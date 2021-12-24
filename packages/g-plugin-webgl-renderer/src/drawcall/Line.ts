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
import { fillMatrix4x4, fillVec4 } from '../render/utils';
import { CullMode, Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch, RENDER_ORDER_SCALE } from './Batch';
import { ShapeRenderer } from '../tokens';
import { Renderable3D } from '../components/Renderable3D';
import { RenderInstList } from '../render';
import { isNil } from '@antv/util';
// import { FillRenderer } from './Fill';
import vert from '../shader/line.vert';
import frag from '../shader/line.frag';

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

class LineProgram extends DeviceProgram {
  static a_Prev = 0;
  static a_Point1 = 0 + 1;
  static a_Point2 = 0 + 2;
  static a_Next = 0 + 3;
  static a_VertexJoint = 0 + 4;
  static a_VertexNum = 0 + 5;
  static a_Travel = 6;

  static ub_ObjectParams = 1;

  vert: string = vert;

  frag: string = frag;
}

@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Polyline },
    { token: ShapeRenderer, named: SHAPE.Path },
    { token: ShapeRenderer, named: SHAPE.Polygon },
  ],
})
export class LineRenderer extends Batch {
  protected program = new LineProgram();

  instanced = false;

  needFill = false;
  triangles: number[];

  // private fillRenderer: FillRenderer;

  validate(object: DisplayObject) {
    return false;
  }

  buildGeometry() {
    const geometry = this.geometry;

    // use triangles for Polygon
    let { triangles, pointsBuffer, travelBuffer, instanceCount } = this.updateBuffer(this.instance);
    if (triangles && triangles.length) {
      this.needFill = true;
      this.triangles = triangles;

      // create a submesh
      // this.fillRenderer = new FillRenderer();
      // this.fillRenderer.init(this.device, this.renderingService);
      // this.fillRenderer.geometry.setIndices();
    }

    geometry.setVertexBuffer({
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
    geometry.setVertexBuffer({
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
    geometry.setVertexBuffer({
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

    geometry.vertexCount = 15;
    geometry.maxInstancedCount = instanceCount;

    geometry.setIndices(new Uint32Array([0, 2, 1, 0, 3, 2, 4, 6, 5, 4, 7, 6, 4, 7, 8]));
  }

  /**
   * use another draw call for fill
   */
  afterRender(list: RenderInstList) {
    const { fill } = this.instance.parsedStyle;
    if (this.needFill) {
      // console.log(fill, this.triangles);
      // this.fillRenderer.render(list);
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    this.geometryDirty = true;
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    if (
      name === 'lineJoin' ||
      name === 'lineCap' ||
      (object.nodeName === SHAPE.Line &&
        (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2')) ||
      (object.nodeName === SHAPE.Polyline && name === 'points') ||
      (object.nodeName === SHAPE.Polygon && name === 'points') ||
      (object.nodeName === SHAPE.Path && name === 'path')
    ) {
      this.geometryDirty = true;
    }
  }

  uploadUBO(renderInst: RenderInst): void {
    const instance = this.objects[0];

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
    const encodedPickingColor = (instance.renderable3D as Renderable3D).encodedPickingColor;
    let translateX = 0;
    let translateY = 0;
    const contentBounds = instance.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      translateX = -halfExtents[0] * anchor[0] * 2;
      translateY = -halfExtents[1] * anchor[1] * 2;
    }

    // Upload to our UBO.
    let offs = renderInst.allocateUniformBuffer(LineProgram.ub_ObjectParams, 16 + 4 * 7);
    const d = renderInst.mapUniformBufferF32(LineProgram.ub_ObjectParams);
    const m = mat4.create();
    mat4.mul(
      m,
      instance.getWorldTransform(), // apply anchor
      mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
    );
    offs += fillMatrix4x4(d, offs, m);
    offs += fillVec4(d, offs, ...(fillColor as [number, number, number, number]));
    offs += fillVec4(d, offs, ...(strokeColor as [number, number, number, number]));
    offs += fillVec4(d, offs, lineWidth, opacity, fillOpacity, strokeOpacity);
    offs += fillVec4(d, offs, 1, 5, 1, 0.5); // u_Expand u_MiterLimit u_ScaleMode u_Alignment
    offs += fillVec4(d, offs, ...encodedPickingColor);
    offs += fillVec4(d, offs, lineDash[0] || 0, lineDash[1] || 0, translateX, translateY); // u_Dash u_Gap u_Anchor
    offs += fillVec4(
      d,
      offs,
      lineDashOffset,
      visibility === 'visible' ? 1 : 0,
      instance.sortable.renderOrder * RENDER_ORDER_SCALE,
    ); // u_DashOffset u_Visible u_ZIndex

    // keep both faces
    renderInst.setMegaStateFlags({
      cullMode: CullMode.None,
    });
  }

  private updateBuffer(object: DisplayObject) {
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
        points.push(points[0], points[1]);

        // use earcut for triangulation
        triangles = earcut(points, [], 2);
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
    }

    const jointType = this.jointType(lineJoin);
    const capType = this.capType(lineCap);
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

  private jointType(lineJoin: LINE_JOIN) {
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

  private capType(lineCap: LINE_CAP) {
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
