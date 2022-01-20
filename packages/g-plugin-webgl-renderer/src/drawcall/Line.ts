/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import { injectable } from 'mana-syringe';
import {
  LINE_CAP,
  LINE_JOIN,
  Path,
  Polyline,
  DisplayObject,
  PARSED_COLOR_TYPE,
  SHAPE,
  Tuple4Number,
} from '@antv/g';
import earcut from 'earcut';
import { vec3, mat4 } from 'gl-matrix';
import { CullMode, Format, VertexBufferFrequency } from '../platform';
import { Batch, RENDER_ORDER_SCALE } from './Batch';
import { ShapeMesh, ShapeRenderer } from '../tokens';
import { isNil } from '@antv/util';
import vert from '../shader/line.vert';
import frag from '../shader/line.frag';
import meshVert from '../shader/mesh.vert';
import meshFrag from '../shader/mesh.frag';
import { BatchMesh } from './BatchMesh';

export enum JOINT_TYPE {
  NONE = 0,
  FILL = 1,
  JOINT_BEVEL = 4,
  JOINT_MITER = 8,
  JOINT_ROUND = 12,
  JOINT_CAP_BUTT = 16,
  JOINT_CAP_SQUARE = 18,
  JOINT_CAP_ROUND = 20,
  FILL_EXPAND = 24,
  CAP_BUTT = 1 << 5,
  CAP_SQUARE = 2 << 5,
  CAP_ROUND = 3 << 5,
  CAP_BUTT2 = 4 << 5,
}

const stridePoints = 2;
const strideFloats = 3;
const strideBytes = 3 * 4;

enum LineProgram {
  a_Prev = 0,
  a_Point1,
  a_Point2,
  a_Next,
  a_VertexJoint,
  a_VertexNum,
  a_Travel,
}

enum Uniform {
  MODEL_MATRIX = 'u_ModelMatrix',
  COLOR = 'u_Color',
  STROKE_COLOR = 'u_StrokeColor',
  STROKE_WIDTH = 'u_StrokeWidth',
  OPACITY = 'u_Opacity',
  FILL_OPACITY = 'u_FillOpacity',
  STROKE_OPACITY = 'u_StrokeOpacity',
  EXPAND = 'u_Expand',
  MITER_LIMIT = 'u_MiterLimit',
  SCALE_MODE = 'u_ScaleMode',
  ALIGNMENT = 'u_Alignment',
  PICKING_COLOR = 'u_PickingColor',
  DASH = 'u_Dash',
  GAP = 'u_Gap',
  DASH_OFFSET = 'u_DashOffset',
  VISIBLE = 'u_Visible',
  Z_INDEX = 'u_ZIndex',
}

enum MeshProgram {
  a_Position = 0,
}

@injectable({
  token: [
    { token: ShapeMesh, named: SHAPE.Polyline },
    { token: ShapeMesh, named: SHAPE.Path },
    { token: ShapeMesh, named: SHAPE.Polygon },
  ],
})
export class LineBatchMesh extends BatchMesh {
  protected updateMeshAttribute(
    object: DisplayObject<any, any>,
    index: number,
    name: string,
    value: any,
  ): void {
    const {
      fill,
      stroke,
      opacity,
      fillOpacity,
      strokeOpacity,
      lineWidth,
      anchor,
      lineDash = [],
      lineDashOffset = 0,
      visibility,
    } = object.parsedStyle;
    if (
      name === 'lineJoin' ||
      name === 'lineCap' ||
      (object.nodeName === SHAPE.Line &&
        (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2')) ||
      (object.nodeName === SHAPE.Polyline && name === 'points') ||
      (object.nodeName === SHAPE.Polygon && name === 'points') ||
      (object.nodeName === SHAPE.Path && name === 'path')
    ) {
      // need re-calc geometry
      this.material.geometryDirty = true;
      this.material.programDirty = true;
    } else if (name === 'stroke') {
      let strokeColor: Tuple4Number = [0, 0, 0, 0];
      if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
        strokeColor = stroke.value;
      }
      this.material.setUniforms({
        [Uniform.STROKE_COLOR]: strokeColor,
      });
    } else if (name === 'opacity') {
      this.material.setUniforms({
        [Uniform.OPACITY]: opacity,
      });
    } else if (name === 'fillOpacity') {
      this.material.setUniforms({
        [Uniform.FILL_OPACITY]: fillOpacity,
      });
    } else if (name === 'strokeOpacity') {
      this.material.setUniforms({
        [Uniform.STROKE_OPACITY]: strokeOpacity,
      });
    } else if (name === 'lineWidth') {
      this.material.setUniforms({
        [Uniform.STROKE_WIDTH]: lineWidth,
      });
    } else if (name === 'anchor' || name === 'modelMatrix') {
      let translateX = 0;
      let translateY = 0;
      const contentBounds = object.getGeometryBounds();
      if (contentBounds) {
        const { halfExtents } = contentBounds;
        translateX = -halfExtents[0] * anchor[0] * 2;
        translateY = -halfExtents[1] * anchor[1] * 2;
      }
      const m = mat4.create();
      mat4.mul(
        m,
        object.getWorldTransform(), // apply anchor
        mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
      );
      this.material.setUniforms({
        [Uniform.MODEL_MATRIX]: m,
      });
    } else if (name === 'visibility') {
      this.material.setUniforms({
        [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      });
    } else if (name === 'lineDash') {
      this.material.setUniforms({
        [Uniform.DASH]: lineDash[0] || 0,
        [Uniform.GAP]: lineDash[1] || 0,
      });
    } else if (name === 'lineDashOffset') {
      this.material.setUniforms({
        [Uniform.DASH_OFFSET]: lineDashOffset,
      });
    }
  }

  changeRenderOrder(object: DisplayObject, index: number, renderOrder: number) {
    this.material.setUniforms({
      [Uniform.Z_INDEX]: renderOrder * RENDER_ORDER_SCALE,
    });
  }

  protected createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;

    const instance = objects[0];

    const {
      fill,
      stroke,
      opacity,
      fillOpacity,
      strokeOpacity,
      lineWidth,
      anchor,
      lineDash = [],
      lineDashOffset = 0,
      visibility,
    } = instance.parsedStyle;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }
    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
      strokeColor = stroke.value;
    }

    // @ts-ignore
    const encodedPickingColor = instance.renderable3D?.encodedPickingColor || [0, 0, 0];
    let translateX = 0;
    let translateY = 0;
    const contentBounds = instance.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      translateX = -halfExtents[0] * anchor[0] * 2;
      translateY = -halfExtents[1] * anchor[1] * 2;
    }

    const m = mat4.create();
    mat4.mul(
      m,
      instance.getWorldTransform(), // apply anchor
      mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
    );

    this.material.setUniforms({
      [Uniform.MODEL_MATRIX]: m,
      [Uniform.COLOR]: fillColor,
      [Uniform.STROKE_COLOR]: strokeColor,
      [Uniform.STROKE_WIDTH]: lineWidth,
      [Uniform.OPACITY]: opacity,
      [Uniform.FILL_OPACITY]: fillOpacity,
      [Uniform.STROKE_OPACITY]: strokeOpacity,
      [Uniform.EXPAND]: 1,
      [Uniform.MITER_LIMIT]: 5,
      [Uniform.SCALE_MODE]: 1,
      [Uniform.ALIGNMENT]: 0.5,
      [Uniform.PICKING_COLOR]: encodedPickingColor,
      [Uniform.DASH]: lineDash[0] || 0,
      [Uniform.GAP]: lineDash[1] || 0,
      [Uniform.DASH_OFFSET]: lineDashOffset,
      [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      [Uniform.Z_INDEX]: instance.sortable.renderOrder * RENDER_ORDER_SCALE,
    });
    this.material.cullMode = CullMode.None;
  }

  protected createGeometry(objects: DisplayObject[]): void {
    const instance = objects[0];

    // use triangles for Polygon
    let { pointsBuffer, travelBuffer, instanceCount } = updateBuffer(instance);

    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 0,
      byteStride: 4 * (3 + 3 + 3 + 3),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 3,
          location: LineProgram.a_Prev,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          byteStride: 4 * 3,
          location: LineProgram.a_Point1,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 5,
          byteStride: 4 * 3,
          location: LineProgram.a_VertexJoint,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 6,
          byteStride: 4 * 3,
          location: LineProgram.a_Point2,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 9,
          byteStride: 4 * 3,
          location: LineProgram.a_Next,
          divisor: 1,
        },
      ],
      data: new Float32Array(pointsBuffer),
    });
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineProgram.a_VertexNum,
          divisor: 0,
        },
      ],
      data: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    });
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineProgram.a_Travel,
          divisor: 1,
        },
      ],
      data: new Float32Array(travelBuffer),
    });

    this.bufferGeometry.vertexCount = 15;
    this.bufferGeometry.instancedCount = instanceCount;

    this.bufferGeometry.setIndices(new Uint32Array([0, 2, 1, 0, 3, 2, 4, 6, 5, 4, 7, 6, 4, 7, 8]));
  }
}

@injectable({
  token: [{ token: ShapeMesh, named: 'Fill' }],
})
export class FillBatchMesh extends BatchMesh {
  protected createGeometry(objects: DisplayObject<any, any>[]): void {
    const instance = objects[0];

    // use triangles for Polygon
    const { triangles, pointsBuffer } = updateBuffer(instance, true);
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 0,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 2,
          location: MeshProgram.a_Position,
        },
      ],
      data: new Float32Array(pointsBuffer),
    });
    this.bufferGeometry.vertexCount = triangles.length;
    this.bufferGeometry.setIndices(new Uint32Array(triangles));
  }

  protected createMaterial(objects: DisplayObject<any, any>[]): void {
    this.material.vertexShader = meshVert;
    this.material.fragmentShader = meshFrag;

    const instance = objects[0];

    const { fill, opacity, fillOpacity, anchor, visibility } = instance.parsedStyle;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }

    // @ts-ignore
    const encodedPickingColor = instance.renderable3D?.encodedPickingColor || [0, 0, 0];
    let translateX = 0;
    let translateY = 0;
    const contentBounds = instance.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      translateX = -halfExtents[0] * anchor[0] * 2;
      translateY = -halfExtents[1] * anchor[1] * 2;
    }

    const m = mat4.create();
    mat4.mul(
      m,
      instance.getWorldTransform(), // apply anchor
      mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
    );

    this.material.setUniforms({
      [Uniform.MODEL_MATRIX]: m,
      [Uniform.COLOR]: fillColor,
      [Uniform.PICKING_COLOR]: encodedPickingColor,
      [Uniform.OPACITY]: opacity,
      [Uniform.FILL_OPACITY]: fillOpacity,
      [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      [Uniform.Z_INDEX]: instance.sortable.renderOrder * RENDER_ORDER_SCALE,
    });
  }
  protected updateMeshAttribute(
    object: DisplayObject<any, any>,
    index: number,
    name: string,
    value: any,
  ): void {
    const { fill, opacity, fillOpacity, anchor, visibility } = object.parsedStyle;
    if (
      name === 'lineJoin' ||
      name === 'lineCap' ||
      (object.nodeName === SHAPE.Line &&
        (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2')) ||
      (object.nodeName === SHAPE.Polyline && name === 'points') ||
      (object.nodeName === SHAPE.Polygon && name === 'points') ||
      (object.nodeName === SHAPE.Path && name === 'path')
    ) {
      // need re-calc geometry
      this.material.geometryDirty = true;
      this.material.programDirty = true;
    } else if (name === 'fill') {
      let fillColor: Tuple4Number = [0, 0, 0, 0];
      if (fill?.type === PARSED_COLOR_TYPE.Constant) {
        fillColor = fill.value;
      }
      this.material.setUniforms({
        [Uniform.COLOR]: fillColor,
      });
    } else if (name === 'opacity') {
      this.material.setUniforms({
        [Uniform.OPACITY]: opacity,
      });
    } else if (name === 'fillOpacity') {
      this.material.setUniforms({
        [Uniform.FILL_OPACITY]: fillOpacity,
      });
    } else if (name === 'anchor' || name === 'modelMatrix') {
      let translateX = 0;
      let translateY = 0;
      const contentBounds = object.getGeometryBounds();
      if (contentBounds) {
        const { halfExtents } = contentBounds;
        translateX = -halfExtents[0] * anchor[0] * 2;
        translateY = -halfExtents[1] * anchor[1] * 2;
      }
      const m = mat4.create();
      mat4.mul(
        m,
        object.getWorldTransform(), // apply anchor
        mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
      );
      this.material.setUniforms({
        [Uniform.MODEL_MATRIX]: m,
      });
    } else if (name === 'visibility') {
      this.material.setUniforms({
        [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      });
    }
  }
  changeRenderOrder(object: DisplayObject, index: number, renderOrder: number) {
    this.material.setUniforms({
      [Uniform.Z_INDEX]: renderOrder * RENDER_ORDER_SCALE,
    });
  }
}

@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Polyline },
    { token: ShapeRenderer, named: SHAPE.Path },
    { token: ShapeRenderer, named: SHAPE.Polygon },
  ],
})
export class LineRenderer extends Batch {
  protected createBatchMeshList(): void {
    this.batchMeshList.push(this.meshFactory('Fill'));
    this.batchMeshList.push(this.meshFactory(SHAPE.Path));
  }

  validate(object: DisplayObject) {
    return false;
  }
}

function curveTo(
  cpX: number,
  cpY: number,
  cpX2: number,
  cpY2: number,
  toX: number,
  toY: number,
  curveLength: number,
  points: Array<number>,
): void {
  const fromX = points[points.length - 2];
  const fromY = points[points.length - 1];

  points.length -= 2;

  const n = segmentsCount(curveLength);

  let dt = 0;
  let dt2 = 0;
  let dt3 = 0;
  let t2 = 0;
  let t3 = 0;

  points.push(fromX, fromY);

  for (let i = 1, j = 0; i <= n; ++i) {
    j = i / n;

    dt = 1 - j;
    dt2 = dt * dt;
    dt3 = dt2 * dt;

    t2 = j * j;
    t3 = t2 * j;

    points.push(
      dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
      dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY,
    );
  }
}

const adaptive = true;
const maxLength = 10;
// const minSegments = 8;
// const maxSegments = 2048;

function segmentsCount(length: number, defaultSegments = 20) {
  if (!adaptive || !length || isNaN(length)) {
    return defaultSegments;
  }

  let result = Math.ceil(length / maxLength);

  // if (result < minSegments) {
  //   result = minSegments;
  // } else if (result > maxSegments) {
  //   result = maxSegments;
  // }

  return result;
}

function updateBuffer(object: DisplayObject, needEarcut = false) {
  const { lineCap, lineJoin, defX, defY, lineDash } = object.parsedStyle;

  let points: number[] = [];
  let triangles: number[] = [];
  if (object.nodeName === SHAPE.Polyline || object.nodeName === SHAPE.Polygon) {
    points = (object as Polyline).parsedStyle.points.points.reduce((prev, cur) => {
      prev.push(cur[0] - defX, cur[1] - defY);
      return prev;
    }, [] as number[]);

    // TODO: close polygon, dealing with extra joint
    if (object.nodeName === SHAPE.Polygon) {
      if (needEarcut) {
        // use earcut for triangulation
        triangles = earcut(points, [], 2);
        return {
          pointsBuffer: points,
          travelBuffer: [],
          triangles,
          instanceCount: Math.round(points.length / stridePoints),
        };
      } else {
        points.push(points[0], points[1]);
      }
    }
  } else if (object.nodeName === SHAPE.Path) {
    const {
      path: { curve, totalLength },
    } = (object as Path).parsedStyle;
    let startPoint: [number, number];
    curve.forEach(([command, ...params]) => {
      if (command === 'M') {
        points.push(params[0] - defX, params[1] - defY);
        startPoint = [params[0] - defX, params[1] - defY];
      } else if (command === 'C') {
        curveTo(
          params[0] - defX,
          params[1] - defY,
          params[2] - defX,
          params[3] - defY,
          params[4] - defX,
          params[5] - defY,
          totalLength,
          points,
        );
      } else if (command === 'Z') {
        points.push(startPoint[0], startPoint[1]);
      }
    });

    if (needEarcut) {
      // use earcut for triangulation
      triangles = earcut(points, [], 2);
      return {
        pointsBuffer: points,
        travelBuffer: [],
        triangles,
        instanceCount: Math.round(points.length / stridePoints),
      };
    }
  }

  const jointType = getJointType(lineJoin);
  const capType = getCapType(lineCap);
  let endJoint = capType;
  if (capType === JOINT_TYPE.CAP_ROUND) {
    endJoint = JOINT_TYPE.JOINT_CAP_ROUND;
  }
  if (capType === JOINT_TYPE.CAP_BUTT) {
    endJoint = JOINT_TYPE.JOINT_CAP_BUTT;
  }
  if (capType === JOINT_TYPE.CAP_SQUARE) {
    endJoint = JOINT_TYPE.JOINT_CAP_SQUARE;
  }

  let j = (Math.round(0 / stridePoints) + 2) * strideFloats;

  const needDash = !isNil(lineDash);
  let dist = 0;
  const pointsBuffer = [];
  const travelBuffer = [];
  for (let i = 0; i < points.length; i += stridePoints) {
    // calc travel
    if (needDash) {
      if (i > 1) {
        dist += Math.sqrt(
          Math.pow(points[i] - points[i - 2], 2) + Math.pow(points[i + 1] - points[i + 1 - 2], 2),
        );
      }
      travelBuffer.push(0, dist, dist, 0, dist, dist, dist, dist, dist);
    } else {
      travelBuffer.push(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    pointsBuffer[j++] = points[i];
    pointsBuffer[j++] = points[i + 1];
    pointsBuffer[j] = jointType;
    if (i == 0 && capType !== JOINT_TYPE.CAP_ROUND) {
      pointsBuffer[j] += capType;
    }
    if (i + stridePoints * 2 >= points.length) {
      pointsBuffer[j] += endJoint - jointType;
    } else if (i + stridePoints >= points.length) {
      pointsBuffer[j] = 0;
    }
    j++;
  }
  pointsBuffer[j++] = points[points.length - 4];
  pointsBuffer[j++] = points[points.length - 3];
  pointsBuffer[j++] = 0;
  pointsBuffer[0] = points[0];
  pointsBuffer[1] = points[1];
  pointsBuffer[2] = 0;
  pointsBuffer[3] = points[2];
  pointsBuffer[4] = points[3];
  pointsBuffer[5] = capType === JOINT_TYPE.CAP_ROUND ? capType : 0;

  const instanceCount = Math.round(points.length / stridePoints);

  return {
    pointsBuffer,
    travelBuffer,
    triangles,
    instanceCount,
  };
}

function getJointType(lineJoin: LINE_JOIN) {
  let joint: number;

  switch (lineJoin) {
    case LINE_JOIN.Bevel:
      joint = JOINT_TYPE.JOINT_BEVEL;
      break;
    case LINE_JOIN.Round:
      joint = JOINT_TYPE.JOINT_ROUND;
      break;
    default:
      joint = JOINT_TYPE.JOINT_MITER;
      break;
  }

  return joint;
}

function getCapType(lineCap: LINE_CAP) {
  let cap: number;

  switch (lineCap) {
    case LINE_CAP.Square:
      cap = JOINT_TYPE.CAP_SQUARE;
      break;
    case LINE_CAP.Round:
      cap = JOINT_TYPE.CAP_ROUND;
      break;
    default:
      cap = JOINT_TYPE.CAP_BUTT;
      break;
  }

  return cap;
}
