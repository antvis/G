/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import type {
  ParsedBaseStyleProps,
  ParsedLineStyleProps,
  ParsedPathStyleProps,
  Path,
  Polyline,
  Tuple4Number,
} from '@antv/g-lite';
import {
  convertToPath,
  DisplayObject,
  parsePath,
  Shape,
  isCSSRGB,
  isDisplayObject,
} from '@antv/g-lite';
import { arcToCubic } from '@antv/util';
import earcut from 'earcut';
import { mat4, vec3 } from 'gl-matrix';
import { CullMode, Format, VertexBufferFrequency } from '../platform';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';
import frag from '../shader/line.frag';
import vert from '../shader/line.vert';
import { bezierCurveTo, quadCurveTo } from '../utils';
import { enumToObject } from '../utils/enum';
import { Instanced } from './Instanced';

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
// const strideBytes = 3 * 4;

enum LineVertexAttributeBufferIndex {
  PACKED = 0,
  VERTEX_NUM,
  TRAVEL,
}

enum LineVertexAttributeLocation {
  PREV = 0,
  POINT1,
  POINT2,
  NEXT,
  VERTEX_JOINT,
  VERTEX_NUM,
  TRAVEL,
}

export enum Uniform {
  MODEL_MATRIX = 'u_ModelMatrix',
  FILL_COLOR = 'u_FillColor',
  STROKE_COLOR = 'u_StrokeColor',
  STROKE_WIDTH = 'u_StrokeWidth',
  INCREASED_LINE_WIDTH_FOR_HIT_TESTING = 'u_IncreasedLineWidthForHitTesting',
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

export class LineMesh extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    return false;
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ): void {
    super.updateAttribute(objects, startIndex, name, value);

    objects.forEach((object) => {
      const {
        stroke,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        increasedLineWidthForHitTesting,
        anchor,
        lineDash,
        lineDashOffset,
        visibility,
      } = object.parsedStyle as ParsedLineStyleProps;
      if (
        name === 'lineJoin' ||
        name === 'lineCap' ||
        name === 'markerStart' ||
        name === 'markerEnd' ||
        name === 'markerStartOffset' ||
        name === 'markerEndOffset' ||
        (object.nodeName === Shape.CIRCLE && name === 'r') ||
        (object.nodeName === Shape.ELLIPSE &&
          (name === 'rx' || name === 'ry')) ||
        (object.nodeName === Shape.RECT &&
          (name === 'width' || name === 'height' || name === 'radius')) ||
        (object.nodeName === Shape.LINE &&
          (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2')) ||
        (object.nodeName === Shape.POLYLINE && name === 'points') ||
        (object.nodeName === Shape.POLYGON && name === 'points') ||
        (object.nodeName === Shape.PATH && name === 'path')
      ) {
        // need re-calc geometry
        this.material.geometryDirty = true;
        this.material.programDirty = true;
      } else if (name === 'stroke') {
        let strokeColor: Tuple4Number = [0, 0, 0, 0];
        if (isCSSRGB(stroke)) {
          strokeColor = [
            Number(stroke.r) / 255,
            Number(stroke.g) / 255,
            Number(stroke.b) / 255,
            Number(stroke.alpha),
          ];
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
      } else if (name === 'increasedLineWidthForHitTesting') {
        this.material.setUniforms({
          [Uniform.INCREASED_LINE_WIDTH_FOR_HIT_TESTING]:
            increasedLineWidthForHitTesting || 0,
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
          [Uniform.DASH_OFFSET]: lineDashOffset || 0,
        });
      } else if (name === 'pointerEvents') {
        const encodedPickingColor = (value &&
          object.isInteractive() &&
          // @ts-ignore
          object.renderable3D?.encodedPickingColor) || [0, 0, 0];
        this.material.setUniforms({
          [Uniform.PICKING_COLOR]: encodedPickingColor,
        });
      }
    });
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    if (this.material) {
      this.material.setUniforms({
        [Uniform.Z_INDEX]: renderOrder * RENDER_ORDER_SCALE,
      });
    }
  }

  createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(LineVertexAttributeLocation),
    };

    const instance = objects[0];

    const {
      fill,
      stroke,
      opacity,
      fillOpacity,
      strokeOpacity,
      lineWidth,
      increasedLineWidthForHitTesting,
      anchor,
      lineDash,
      lineDashOffset,
      visibility,
    } = instance.parsedStyle as ParsedLineStyleProps;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (isCSSRGB(fill)) {
      fillColor = [
        Number(fill.r) / 255,
        Number(fill.g) / 255,
        Number(fill.b) / 255,
        Number(fill.alpha),
      ];
    }
    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (isCSSRGB(stroke)) {
      strokeColor = [
        Number(stroke.r) / 255,
        Number(stroke.g) / 255,
        Number(stroke.b) / 255,
        Number(stroke.alpha),
      ];
    }

    const encodedPickingColor = (instance.isInteractive() &&
      // @ts-ignore
      instance.renderable3D?.encodedPickingColor) || [0, 0, 0];
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
      [Uniform.FILL_COLOR]: fillColor,
      [Uniform.STROKE_COLOR]: strokeColor,
      [Uniform.STROKE_WIDTH]: lineWidth,
      [Uniform.INCREASED_LINE_WIDTH_FOR_HIT_TESTING]:
        increasedLineWidthForHitTesting || 0,
      [Uniform.OPACITY]: opacity,
      [Uniform.FILL_OPACITY]: fillOpacity,
      [Uniform.STROKE_OPACITY]: strokeOpacity,
      [Uniform.EXPAND]: 1,
      [Uniform.MITER_LIMIT]: 5,
      [Uniform.SCALE_MODE]: 1,
      [Uniform.ALIGNMENT]: 0.5,
      [Uniform.PICKING_COLOR]: encodedPickingColor,
      [Uniform.DASH]: (lineDash && lineDash[0]) || 0,
      [Uniform.GAP]: (lineDash && lineDash[1]) || 0,
      [Uniform.DASH_OFFSET]: lineDashOffset || 0,
      [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      [Uniform.Z_INDEX]: instance.sortable.renderOrder * RENDER_ORDER_SCALE,
    });
    this.material.cullMode = CullMode.None;
  }

  createGeometry(objects: DisplayObject[]): void {
    const instance = objects[0];

    // use triangles for Polygon
    const { pointsBuffer, travelBuffer, instancedCount } =
      updateBuffer(instance);

    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.PACKED,
      byteStride: 4 * (3 + 3 + 3 + 3),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.PREV,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.POINT1,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 5,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.VERTEX_JOINT,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 6,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.POINT2,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 9,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.NEXT,
          divisor: 1,
        },
      ],
      data: new Float32Array(pointsBuffer),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.VERTEX_NUM,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineVertexAttributeLocation.VERTEX_NUM,
          divisor: 0,
        },
      ],
      data: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.TRAVEL,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineVertexAttributeLocation.TRAVEL,
          divisor: 1,
        },
      ],
      data: new Float32Array(travelBuffer),
    });

    this.geometry.vertexCount = 15;
    this.geometry.instancedCount = instancedCount;

    this.geometry.setIndexBuffer(
      new Uint32Array([0, 2, 1, 0, 3, 2, 4, 6, 5, 4, 7, 6, 4, 7, 8]),
    );
  }
}

export function updateBuffer(
  object: DisplayObject,
  needEarcut = false,
  segmentNum?: number,
) {
  const { lineCap, lineJoin } = object.parsedStyle as ParsedBaseStyleProps;
  let { defX, defY } = object.parsedStyle;
  const { markerStart, markerEnd, markerStartOffset, markerEndOffset } =
    object.parsedStyle as ParsedLineStyleProps;

  const points: number[][] = [];
  let triangles: number[] = [];

  if (object.nodeName === Shape.POLYLINE || object.nodeName === Shape.POLYGON) {
    const polylineControlPoints = (object as Polyline).parsedStyle.points
      .points;
    const length = polylineControlPoints.length;
    let startOffsetX = 0;
    let startOffsetY = 0;
    let endOffsetX = 0;
    let endOffsetY = 0;

    let rad = 0;
    let x: number;
    let y: number;

    if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
      x = polylineControlPoints[1][0] - polylineControlPoints[0][0];
      y = polylineControlPoints[1][1] - polylineControlPoints[0][1];
      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
      x =
        polylineControlPoints[length - 2][0] -
        polylineControlPoints[length - 1][0];
      y =
        polylineControlPoints[length - 2][1] -
        polylineControlPoints[length - 1][1];
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    points[0] = polylineControlPoints.reduce((prev, cur, i) => {
      let offsetX = 0;
      let offsetY = 0;
      if (i === 0) {
        offsetX = startOffsetX;
        offsetY = startOffsetY;
      } else if (i === length - 1) {
        offsetX = endOffsetX;
        offsetY = endOffsetY;
      }

      prev.push(cur[0] - defX + offsetX, cur[1] - defY + offsetY);
      return prev;
    }, [] as number[]);

    // close polygon, dealing with extra joint
    if (object.nodeName === Shape.POLYGON) {
      if (needEarcut) {
        // use earcut for triangulation
        triangles = earcut(points[0], [], 2);
        return {
          pointsBuffer: points[0],
          travelBuffer: [],
          triangles,
          instancedCount: Math.round(points[0].length / stridePoints),
        };
      } else {
        points[0].push(points[0][0], points[0][1]);
        points[0].push(
          ...addTailSegment(
            points[0][0],
            points[0][1],
            points[0][2],
            points[0][3],
          ),
        );
      }
    }
  } else if (
    object.nodeName === Shape.PATH ||
    object.nodeName === Shape.CIRCLE ||
    object.nodeName === Shape.ELLIPSE ||
    object.nodeName === Shape.RECT
  ) {
    let path: ParsedPathStyleProps['path'];
    if (object.nodeName !== Shape.PATH) {
      path = parsePath(
        convertToPath(object, mat4.identity(mat4.create())),
        object,
      );
      defX = path.rect.x;
      defY = path.rect.y;

      // support negative width/height of Rect
      if (object.nodeName === Shape.RECT) {
        const { width, height } = object.parsedStyle;
        if (width < 0) {
          defX += path.rect.width;
        }
        if (height < 0) {
          defY += path.rect.height;
        }
      }
    } else {
      path = object.parsedStyle.path;
    }
    const { absolutePath, segments } = path;

    let startOffsetX = 0;
    let startOffsetY = 0;
    let endOffsetX = 0;
    let endOffsetY = 0;

    let rad = 0;
    let x: number;
    let y: number;

    if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
      const [p1, p2] = (markerStart.parentNode as Path).getStartTangent();
      x = p1[0] - p2[0];
      y = p1[1] - p2[1];

      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
      const [p1, p2] = (markerEnd.parentNode as Path).getEndTangent();
      x = p1[0] - p2[0];
      y = p1[1] - p2[1];
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    let startPointIndex = -1;
    let mCommandsNum = -1;
    absolutePath.forEach(([command, ...params], i) => {
      const nextSegment = absolutePath[i + 1];
      const useStartOffset =
        i === 0 && (startOffsetX !== 0 || startOffsetY !== 0);
      const useEndOffset =
        (i === absolutePath.length - 1 ||
          (nextSegment &&
            (nextSegment[0] === 'M' || nextSegment[0] === 'Z'))) &&
        endOffsetX !== 0 &&
        endOffsetY !== 0;

      if (command === 'M') {
        mCommandsNum++;
        points[mCommandsNum] = [];
        startPointIndex = points[mCommandsNum].length;

        if (useStartOffset) {
          points[mCommandsNum].push(
            params[0] - defX + startOffsetX,
            params[1] - defY + startOffsetY,
            params[0] - defX,
            params[1] - defY,
          );
        } else {
          points[mCommandsNum].push(params[0] - defX, params[1] - defY);
        }
      } else if (command === 'L') {
        if (useEndOffset) {
          points[mCommandsNum].push(
            params[0] - defX + endOffsetX,
            params[1] - defY + endOffsetY,
          );
        } else {
          points[mCommandsNum].push(params[0] - defX, params[1] - defY);
        }
      } else if (command === 'Q') {
        quadCurveTo(
          params[0] - defX,
          params[1] - defY,
          params[2] - defX,
          params[3] - defY,
          points[mCommandsNum],
          segmentNum,
        );
        if (useEndOffset) {
          points[mCommandsNum].push(
            params[2] - defX + endOffsetX,
            params[3] - defY + endOffsetY,
          );
        }
      } else if (command === 'A') {
        // convert Arc to Cubic

        const [px1, py1] = segments[i].prePoint;
        const args = arcToCubic(
          px1,
          py1,
          params[0],
          params[1],
          params[2],
          params[3],
          params[4],
          params[5],
          params[6],
          undefined,
        );

        // fixArc
        for (let i = 0; i < args.length; i += 6) {
          bezierCurveTo(
            args[i] - defX,
            args[i + 1] - defY,
            args[i + 2] - defX,
            args[i + 3] - defY,
            args[i + 4] - defX,
            args[i + 5] - defY,
            points[mCommandsNum],
            segmentNum,
          );
        }
        if (useEndOffset) {
          points[mCommandsNum].push(
            params[5] - defX + endOffsetX,
            params[6] - defY + endOffsetY,
          );
        }
      } else if (command === 'C') {
        bezierCurveTo(
          params[0] - defX,
          params[1] - defY,
          params[2] - defX,
          params[3] - defY,
          params[4] - defX,
          params[5] - defY,
          points[mCommandsNum],
          segmentNum,
        );
        if (useEndOffset) {
          points[mCommandsNum].push(
            params[4] - defX + endOffsetX,
            params[5] - defY + endOffsetY,
          );
        }
      } else if (
        command === 'Z' &&
        (object.nodeName === Shape.PATH || object.nodeName === Shape.RECT)
      ) {
        const epsilon = 0.0001;
        // skip if already closed
        if (
          Math.abs(
            points[mCommandsNum][points[mCommandsNum].length - 2] -
              points[mCommandsNum][startPointIndex],
          ) > epsilon ||
          Math.abs(
            points[mCommandsNum][points[mCommandsNum].length - 1] -
              points[mCommandsNum][startPointIndex + 1],
          ) > epsilon
        ) {
          points[mCommandsNum].push(
            points[mCommandsNum][startPointIndex],
            points[mCommandsNum][startPointIndex + 1],
          );
        }

        points[mCommandsNum].push(
          ...addTailSegment(
            points[mCommandsNum][startPointIndex],
            points[mCommandsNum][startPointIndex + 1],
            points[mCommandsNum][startPointIndex + 2],
            points[mCommandsNum][startPointIndex + 3],
          ),
        );
      }
    });

    if (needEarcut) {
      const pointsBuffer = points.reduce((prev, cur) => {
        prev.push(...cur);
        return prev;
      }, []);
      // use earcut for triangulation
      triangles = earcut(pointsBuffer, [], 2);
      return {
        pointsBuffer,
        travelBuffer: [],
        triangles,
        instancedCount: Math.round(pointsBuffer.length / stridePoints),
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
  return points
    .map((points) => {
      // const needDash = !isNil(lineDash);
      let dist = 0;
      const pointsBuffer: number[] = [];
      const travelBuffer: number[] = [];
      for (let i = 0; i < points.length; i += stridePoints) {
        // calc travel
        // if (needDash) {
        if (i > 1) {
          dist += Math.sqrt(
            Math.pow(points[i] - points[i - 2], 2) +
              Math.pow(points[i + 1] - points[i + 1 - 2], 2),
          );
        }
        travelBuffer.push(dist);
        // } else {
        //   travelBuffer.push(0);
        // }

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

      const instancedCount = Math.round(points.length / stridePoints);

      return {
        pointsBuffer,
        travelBuffer,
        triangles,
        instancedCount,
      };
    })
    .reduce(
      (prev, cur) => {
        prev.pointsBuffer.push(...cur.pointsBuffer);
        prev.travelBuffer.push(...cur.travelBuffer);
        prev.instancedCount += cur.instancedCount;
        return prev;
      },
      {
        pointsBuffer: [],
        travelBuffer: [],
        triangles,
        instancedCount: 0,
      },
    );
}

function getJointType(lineJoin: CanvasLineJoin) {
  let joint: number;

  switch (lineJoin) {
    case 'bevel':
      joint = JOINT_TYPE.JOINT_BEVEL;
      break;
    case 'round':
      joint = JOINT_TYPE.JOINT_ROUND;
      break;
    default:
      joint = JOINT_TYPE.JOINT_MITER;
      break;
  }

  return joint;
}

function getCapType(lineCap: CanvasLineCap) {
  let cap: number;

  switch (lineCap) {
    case 'square':
      cap = JOINT_TYPE.CAP_SQUARE;
      break;
    case 'round':
      cap = JOINT_TYPE.CAP_ROUND;
      break;
    default:
      cap = JOINT_TYPE.CAP_BUTT;
      break;
  }

  return cap;
}

function addTailSegment(
  x1: number,
  y1: number,
  x2: number = x1,
  y2: number = y1,
) {
  const vec = [x2 - x1, y2 - y1];
  const length = 0.01;
  return [x1 + vec[0] * length, y1 + vec[1] * length];
}
