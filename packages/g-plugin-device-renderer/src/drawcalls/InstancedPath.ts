/**
 * Instanced line which has a  better performance.
 * @see https://www.yuque.com/antv/ou292n/gg1gh5
 */
import {
  DisplayObject,
  ParsedPathStyleProps,
  Path,
  Shape,
  ParsedBaseStyleProps,
  ParsedLineStyleProps,
  Polyline,
  isDisplayObject,
  parsePath,
  convertToPath,
} from '@antv/g-lite';
import { mat4 } from 'gl-matrix';
import { arcToCubic } from '@antv/util';
import earcut from 'earcut';
import { Format, VertexBufferFrequency } from '../platform';
import frag from '../shader/line.frag';
import vert from '../shader/line.vert';
import { enumToObject } from '../utils/enum';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import { RenderHelper } from '../render';
import { TexturePool } from '../TexturePool';
import { LightPool } from '../LightPool';
import { bezierCurveTo, quadCurveTo } from '../utils';
import { InstancedFillDrawcall } from './InstancedFill';
import { BatchContext } from '../renderer';

enum LineVertexAttributeBufferIndex {
  PACKED = VertexAttributeBufferIndex.POSITION + 1,
  VERTEX_NUM,
  TRAVEL,
  DASH,
}

enum LineVertexAttributeLocation {
  PREV = VertexAttributeLocation.POSITION,
  POINT1,
  POINT2,
  NEXT,
  VERTEX_JOINT,
  VERTEX_NUM,
  TRAVEL,
  DASH,
}

const SEGMENT_NUM = 12;

/**
 * Used for Curve only contains 2 commands, e.g. [[M], [C | Q | A]]
 */
export class InstancedPathDrawcall extends Instanced {
  static calcSubpathNum(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      const {
        path: { absolutePath },
      } = object.parsedStyle as ParsedPathStyleProps;
      return absolutePath.filter((d) => d[0] === 'M').length;
    }

    return 1;
  }

  constructor(
    protected renderHelper: RenderHelper,
    protected texturePool: TexturePool,
    protected lightPool: LightPool,
    object: DisplayObject,
    drawcallCtors: (new (..._: any) => Instanced)[],
    index: number,
    context: BatchContext,
  ) {
    super(
      renderHelper,
      texturePool,
      lightPool,
      object,
      drawcallCtors,
      index,
      context,
    );
    this.segmentNum = this.calcSegmentNum(object);
  }

  protected mergeAnchorIntoModelMatrix = true;

  private segmentNum = -1;

  private calcSegmentNum(object: DisplayObject) {
    // FIXME: only need to collect instanced count
    const { instancedCount } = updateBuffer(
      object,
      false,
      SEGMENT_NUM,
      this.calcSubpathIndex(object),
    );
    return instancedCount;
  }

  private calcSubpathIndex(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      const fillDrawcallCount = this.drawcallCtors.filter(
        (ctor) => ctor === InstancedFillDrawcall,
      ).length;
      return this.index - fillDrawcallCount;
    }
    return 0;
  }

  /**
   * Paths with the same number of vertices should be merged.
   */
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);
    if (!shouldMerge) {
      return false;
    }

    if (this.index !== index) {
      return false;
    }

    const segmentNum = this.calcSegmentNum(object);

    return this.segmentNum === segmentNum;
  }

  createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(LineVertexAttributeLocation),
      INSTANCED: true,
    };
  }

  createGeometry(objects: DisplayObject[]): void {
    const indices: number[] = [];
    const pointsBuffer: number[] = [];
    const travelBuffer: number[] = [];
    const packedDash: number[] = [];
    let instancedCount = 0;
    let offset = 0;
    objects.forEach((object) => {
      const {
        pointsBuffer: pBuffer,
        travelBuffer: tBuffer,
        instancedCount: count,
      } = updateBuffer(
        object,
        false,
        SEGMENT_NUM,
        this.calcSubpathIndex(object),
      );

      const { lineDash, lineDashOffset, isBillboard } = (object as Path)
        .parsedStyle;

      packedDash.push(
        (lineDash && lineDash[0]) || 0, // DASH
        (lineDash && lineDash[1]) || 0, // GAP
        lineDashOffset || 0,
        isBillboard ? 1 : 0,
      );

      instancedCount += count;

      // Can't use interleaved buffer here, we should spread them like:
      // | prev - pointA - pointB - next |. This will allocate ~4x buffer memory space.
      for (let i = 0; i < pBuffer.length - 3 * 3; i += 3) {
        pointsBuffer.push(
          pBuffer[i],
          pBuffer[i + 1],
          pBuffer[i + 2],
          pBuffer[i + 3],
          pBuffer[i + 4],
          pBuffer[i + 5],
          pBuffer[i + 6],
          pBuffer[i + 7],
          pBuffer[i + 8],
          pBuffer[i + 9],
          pBuffer[i + 10],
          pBuffer[i + 11],
        );
      }

      travelBuffer.push(...tBuffer);

      indices.push(
        0 + offset,
        2 + offset,
        1 + offset,
        0 + offset,
        3 + offset,
        2 + offset,
        4 + offset,
        6 + offset,
        5 + offset,
        4 + offset,
        7 + offset,
        6 + offset,
        4 + offset,
        7 + offset,
        8 + offset,
      );
      offset += 9;
    });

    if (pointsBuffer.length) {
      this.geometry.setVertexBuffer({
        bufferIndex: LineVertexAttributeBufferIndex.PACKED,
        byteStride: 4 * (3 + 3 + 3 + 3),
        frequency: VertexBufferFrequency.PerInstance,
        attributes: [
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 0,
            location: LineVertexAttributeLocation.PREV,
            divisor: 1,
          },
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 3,
            location: LineVertexAttributeLocation.POINT1,
            divisor: 1,
          },
          {
            format: Format.F32_R,
            bufferByteOffset: 4 * 5,
            location: LineVertexAttributeLocation.VERTEX_JOINT,
            divisor: 1,
          },
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 6,
            location: LineVertexAttributeLocation.POINT2,
            divisor: 1,
          },
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 9,
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

      // this attribute only changes for each n instance
      this.divisor = instancedCount / objects.length;

      this.geometry.setVertexBuffer({
        bufferIndex: LineVertexAttributeBufferIndex.DASH,
        byteStride: 4 * 4,
        frequency: VertexBufferFrequency.PerInstance,
        attributes: [
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 0,
            location: LineVertexAttributeLocation.DASH,
            divisor: this.divisor,
          },
        ],
        data: new Float32Array(packedDash),
      });

      // use default common attributes
      super.createGeometry(objects);

      this.geometry.vertexCount = 15;
      this.geometry.instancedCount = instancedCount;
      this.geometry.setIndexBuffer(new Uint32Array(indices));
    }
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ) {
    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (
      name === 'r' ||
      name === 'rx' ||
      name === 'ry' ||
      name === 'width' ||
      name === 'height' ||
      name === 'radius' ||
      name === 'x1' ||
      name === 'y1' ||
      name === 'x2' ||
      name === 'y2' ||
      name === 'points' ||
      name === 'path' ||
      name === 'lineJoin' ||
      name === 'lineCap' ||
      name === 'markerStartOffset' ||
      name === 'markerEndOffset' ||
      name === 'markerStart' ||
      name === 'markerEnd'
    ) {
      const pointsBuffer: number[] = [];
      const travelBuffer: number[] = [];
      let instancedCount = 0;
      objects.forEach((object) => {
        const {
          pointsBuffer: pBuffer,
          travelBuffer: tBuffer,
          instancedCount: iCount,
        } = updateBuffer(
          object,
          false,
          SEGMENT_NUM,
          this.calcSubpathIndex(object),
        );
        instancedCount = iCount;

        // Can't use interleaved buffer here, we should spread them like:
        // | prev - pointA - pointB - next |. This will allocate ~4x buffer memory space.
        for (let i = 0; i < pBuffer.length - 3 * 3; i += 3) {
          pointsBuffer.push(
            pBuffer[i],
            pBuffer[i + 1],
            pBuffer[i + 2],
            pBuffer[i + 3],
            pBuffer[i + 4],
            pBuffer[i + 5],
            pBuffer[i + 6],
            pBuffer[i + 7],
            pBuffer[i + 8],
            pBuffer[i + 9],
            pBuffer[i + 10],
            pBuffer[i + 11],
          );
        }

        travelBuffer.push(...tBuffer);
      });

      this.geometry.updateVertexBuffer(
        LineVertexAttributeBufferIndex.PACKED,
        LineVertexAttributeLocation.PREV,
        startIndex * instancedCount,
        new Uint8Array(new Float32Array(pointsBuffer).buffer),
      );
      this.geometry.updateVertexBuffer(
        LineVertexAttributeBufferIndex.TRAVEL,
        LineVertexAttributeLocation.TRAVEL,
        startIndex,
        new Uint8Array(new Float32Array(travelBuffer).buffer),
      );
    } else if (
      name === 'lineDashOffset' ||
      name === 'lineDash' ||
      name === 'isBillboard'
    ) {
      const packedDash: number[] = [];
      objects.forEach((object) => {
        const { lineDash, lineDashOffset, isBillboard } = (object as Path)
          .parsedStyle;

        packedDash.push(
          (lineDash && lineDash[0]) || 0, // DASH
          (lineDash && lineDash[1]) || 0, // GAP
          lineDashOffset || 0,
          isBillboard ? 1 : 0,
        );
      });

      this.geometry.updateVertexBuffer(
        LineVertexAttributeBufferIndex.DASH,
        LineVertexAttributeBufferIndex.DASH,
        startIndex,
        new Uint8Array(new Float32Array(packedDash).buffer),
      );
    }
  }
}

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

export function updateBuffer(
  object: DisplayObject,
  needEarcut = false,
  segmentNum?: number,
  subPathIndex = 0,
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
      path = parsePath(convertToPath(object, mat4.identity(mat4.create())));
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
      const pointsBuffer = points[subPathIndex];
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

  const subPath = points[subPathIndex];
  {
    const points = subPath;
    let j = (Math.round(0 / stridePoints) + 2) * strideFloats;
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
  }
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
