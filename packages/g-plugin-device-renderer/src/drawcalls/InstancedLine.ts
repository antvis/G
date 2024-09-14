/**
 * Instanced line which has a  better performance.
 * @see https://www.yuque.com/antv/ou292n/gg1gh5
 */
import type {
  Line,
  ParsedLineStyleProps,
  Path,
  Polyline,
  ParsedPathStyleProps,
  ParsedPolylineStyleProps,
} from '@antv/g-lite';
import { DisplayObject, Shape, isDisplayObject } from '@antv/g-lite';
import { Format, VertexStepMode } from '@antv/g-device-api';
import frag from '../shader/instanced-line.frag';
import vert from '../shader/instanced-line.vert';
import { enumToObject } from '../utils/enum';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import { InstancedFillDrawcall } from './InstancedFill';
import { RenderHelper } from '../render';
import { TexturePool } from '../TexturePool';
import { LightPool } from '../LightPool';
import { BatchContext } from '../renderer';

export const segmentInstanceGeometry = [
  0, -0.5, 0, 0, 0, 1, -0.5, 1, 1, 0, 1, 0.5, 1, 1, 1, 0, 0.5, 0, 0, 1,
];

enum InstancedLineVertexAttributeBufferIndex {
  POINT = VertexAttributeBufferIndex.POSITION + 1,
  CAP,
  DASH,
}

enum InstancedLineVertexAttributeLocation {
  POSITION = VertexAttributeLocation.POSITION,
  UV = VertexAttributeLocation.UV,
  POINTA = VertexAttributeLocation.NORMAL,
  POINTB = VertexAttributeLocation.BARYCENTRIC,
  CAP = VertexAttributeLocation.MAX,
  DASH = VertexAttributeLocation.MAX + 1,
}

const LineCap_MAP = {
  butt: 1,
  round: 2,
  square: 3,
};

export class InstancedLineDrawcall extends Instanced {
  static isLine(object: DisplayObject, subpathIndex: number) {
    if (object.nodeName === Shape.PATH) {
      const {
        d: { absolutePath },
      } = object.parsedStyle as ParsedPathStyleProps;

      let mSegmentCount = 0;
      let mCommandIndex = 0;
      for (let i = 0; i < absolutePath.length; i++) {
        const segment = absolutePath[i];
        if (segment[0] === 'M') {
          if (mSegmentCount === subpathIndex) {
            mCommandIndex = i;
            break;
          }
          mSegmentCount++;
        }
      }

      // only contains M & L commands
      if (
        absolutePath[mCommandIndex][0] === 'M' &&
        absolutePath[mCommandIndex + 1][0] === 'L' &&
        (absolutePath[mCommandIndex + 2] === undefined ||
          absolutePath[mCommandIndex + 2][0] === 'M')
      ) {
        return true;
      }
    } else if (object.nodeName === Shape.POLYLINE) {
      const {
        points: { points },
      } = object.parsedStyle as ParsedPolylineStyleProps;
      const tangent =
        (points[1][0] - points[1][1]) / (points[0][0] - points[0][1]);
      for (let i = 1; i < points.length - 1; i++) {
        if (
          (points[i + 1][0] - points[i + 1][1]) /
            (points[i][0] - points[i][1]) !==
          tangent
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
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
    this.gradientAttributeName = 'stroke';
  }

  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);
    if (!shouldMerge) {
      return false;
    }

    return true;
  }

  createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(InstancedLineVertexAttributeLocation),
    };
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

  createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    super.createGeometry(objects);

    const interleaved: number[] = [];
    const packedCap: number[] = [];
    const packedDash: number[] = [];
    const indices: number[] = [];
    let offset = 0;
    objects.forEach((object) => {
      let parsedLineStyleProps: Partial<ParsedLineStyleProps>;
      let totalLength: number;
      if (object.nodeName === Shape.LINE) {
        parsedLineStyleProps = (object as Line).parsedStyle;
        totalLength = (object as Line).getTotalLength();
      } else if (object.nodeName === Shape.POLYLINE) {
        const {
          points: { points },
          lineCap,
          lineDash,
          lineDashOffset,
          markerStart,
          markerEnd,
          markerStartOffset,
          markerEndOffset,
          isBillboard,
          // @ts-ignore
          isSizeAttenuation,
        } = (object as Polyline).parsedStyle;
        parsedLineStyleProps = {
          x1: points[0][0],
          y1: points[0][1],
          x2: points[points.length - 1][0],
          y2: points[points.length - 1][1],
          z1: 0,
          z2: 0,
          lineCap,
          lineDash,
          lineDashOffset,
          isBillboard,
          isSizeAttenuation,
          markerStart,
          markerEnd,
          markerStartOffset,
          markerEndOffset,
        };
        totalLength = (object as Polyline).getTotalLength();
      } else if (object.nodeName === Shape.PATH) {
        const {
          d: { absolutePath },
          lineCap,
          lineDash,
          lineDashOffset,
          markerStart,
          markerEnd,
          markerStartOffset,
          markerEndOffset,
          isBillboard,
          isSizeAttenuation,
        } = (object as Path).parsedStyle;
        let mSegmentCount = 0;
        let mCommandIndex = 0;
        const index = this.calcSubpathIndex(object);
        for (let i = 0; i < absolutePath.length; i++) {
          const segment = absolutePath[i];
          if (segment[0] === 'M') {
            if (mSegmentCount === index) {
              mCommandIndex = i;
              break;
            }
            mSegmentCount++;
          }
        }
        parsedLineStyleProps = {
          x1: absolutePath[mCommandIndex][1],
          y1: absolutePath[mCommandIndex][2],
          x2: absolutePath[mCommandIndex + 1][1],
          y2: absolutePath[mCommandIndex + 1][2],
          z1: 0,
          z2: 0,
          lineCap,
          lineDash,
          lineDashOffset,
          isBillboard,
          isSizeAttenuation,
          markerStart,
          markerEnd,
          markerStartOffset,
          markerEndOffset,
        };
        totalLength = (object as Path).getTotalLength();
      }

      const {
        x1,
        y1,
        x2,
        y2,
        z1,
        z2,
        lineCap,
        isBillboard,
        isSizeAttenuation,
      } = parsedLineStyleProps;

      const { startOffsetX, startOffsetY, endOffsetX, endOffsetY } =
        this.calcOffset(parsedLineStyleProps);
      const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } =
        this.calcDash(parsedLineStyleProps, totalLength);

      packedCap.push(
        // caps
        LineCap_MAP[lineCap],
      );
      packedDash.push(
        dashOffset,
        dashSegmentPercent,
        dashRatioInEachSegment,
        // isSizeAttenuation
        isBillboard || isSizeAttenuation ? 1 : 0,
      );

      interleaved.push(
        x1 + startOffsetX,
        y1 + startOffsetY,
        z1,
        x2 + endOffsetX,
        y2 + endOffsetY,
        z2,
      );
      indices.push(
        0 + offset,
        2 + offset,
        1 + offset,
        0 + offset,
        3 + offset,
        2 + offset,
      );
      offset += 4;
    });

    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 5,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.POSITION,
          divisor: 0,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          location: InstancedLineVertexAttributeLocation.UV,
          divisor: 0,
        },
      ],
      data: new Float32Array(segmentInstanceGeometry),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.POINT,
      byteStride: 4 * (3 + 3),
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.POINTA,
          divisor: 1,
        },
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 3,
          location: InstancedLineVertexAttributeLocation.POINTB,
          divisor: 1,
        },
      ],
      data: new Float32Array(interleaved),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.CAP,
      byteStride: 4 * 1,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.CAP,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedCap),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.DASH,
      byteStride: 4 * 4,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.DASH,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedDash),
    });
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ) {
    if (objects.length === 0) {
      return;
    }

    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (
      name === 'x1' ||
      name === 'y1' ||
      name === 'x2' ||
      name === 'y2' ||
      name === 'z1' ||
      name === 'z2' ||
      name === 'markerStartOffset' ||
      name === 'markerEndOffset' ||
      name === 'markerStart' ||
      name === 'markerEnd' ||
      name === 'points' ||
      name === 'd'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        let parsedLineStyleProps: Partial<ParsedLineStyleProps>;
        if (object.nodeName === Shape.LINE) {
          parsedLineStyleProps = (object as Line).parsedStyle;
        } else if (object.nodeName === Shape.POLYLINE) {
          const {
            points: { points },
            lineCap,
            markerStart,
            markerEnd,
            markerStartOffset,
            markerEndOffset,
            isBillboard,
            // @ts-ignore
            isSizeAttenuation,
          } = (object as Polyline).parsedStyle;
          parsedLineStyleProps = {
            x1: points[0][0],
            y1: points[0][1],
            x2: points[points.length - 1][0],
            y2: points[points.length - 1][1],
            z1: 0,
            z2: 0,
            lineCap,
            isSizeAttenuation,
            isBillboard,
            markerStart,
            markerEnd,
            markerStartOffset,
            markerEndOffset,
          };
        } else if (object.nodeName === Shape.PATH) {
          const {
            d: { absolutePath },
            lineCap,
            markerStart,
            markerEnd,
            markerStartOffset,
            markerEndOffset,
            isBillboard,
            isSizeAttenuation,
          } = (object as Path).parsedStyle;
          parsedLineStyleProps = {
            x1: absolutePath[0][1],
            y1: absolutePath[0][2],
            x2: absolutePath[1][1],
            y2: absolutePath[1][2],
            z1: 0,
            z2: 0,
            lineCap,
            isBillboard,
            isSizeAttenuation,
            markerStart,
            markerEnd,
            markerStartOffset,
            markerEndOffset,
          };
        }

        const { x1, y1, x2, y2, z1, z2 } = parsedLineStyleProps;
        const { startOffsetX, startOffsetY, endOffsetX, endOffsetY } =
          this.calcOffset(parsedLineStyleProps);
        packed.push(
          x1 + startOffsetX,
          y1 + startOffsetY,
          z1,
          x2 + endOffsetX,
          y2 + endOffsetY,
          z2,
        );
      });

      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.POINT,
        InstancedLineVertexAttributeLocation.POINTA,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (
      name === 'lineDashOffset' ||
      name === 'lineDash' ||
      name === 'isSizeAttenuation' ||
      name === 'isBillboard'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const totalLength = (object as Line).getTotalLength();

        const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } =
          this.calcDash(object.parsedStyle, totalLength);
        packed.push(
          dashOffset,
          dashSegmentPercent,
          dashRatioInEachSegment,
          object.parsedStyle.isBillboard || object.parsedStyle.isSizeAttenuation
            ? 1
            : 0, // isSizeAttenuation
        );
      });

      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.DASH,
        InstancedLineVertexAttributeLocation.DASH,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'lineCap') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { lineCap } = object.parsedStyle;
        packed.push(LineCap_MAP[lineCap]);
      });
      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.CAP,
        InstancedLineVertexAttributeLocation.CAP,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    }
  }

  private calcOffset(parsedStyle: Partial<ParsedLineStyleProps>) {
    const {
      x1,
      y1,
      x2,
      y2,
      markerStart,
      markerEnd,
      markerStartOffset,
      markerEndOffset,
    } = parsedStyle;

    let startOffsetX = 0;
    let startOffsetY = 0;
    let endOffsetX = 0;
    let endOffsetY = 0;

    let rad = 0;
    let x: number;
    let y: number;

    if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
      x = x2 - x1;
      y = y2 - y1;
      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
      x = x1 - x2;
      y = y1 - y2;
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    return {
      startOffsetX,
      startOffsetY,
      endOffsetX,
      endOffsetY,
    };
  }

  private calcDash(
    parsedLineStyle: Partial<ParsedLineStyleProps>,
    totalLength: number,
  ) {
    const { lineDash, lineDashOffset } = parsedLineStyle;
    let dashOffset = 0;
    let dashSegmentPercent = 1;
    let dashRatioInEachSegment = 0;
    if (lineDash && lineDash.length) {
      dashOffset = (lineDashOffset || 0) / totalLength;
      const segmentsLength = lineDash.reduce((cur, prev) => cur + prev, 0);

      if (segmentsLength === 0) {
        dashSegmentPercent = 1;
        dashRatioInEachSegment = 0;
      } else {
        dashSegmentPercent = segmentsLength / totalLength;
        dashRatioInEachSegment = lineDash[1] / segmentsLength;
      }
    }
    return {
      dashOffset,
      dashSegmentPercent,
      dashRatioInEachSegment,
    };
  }
}
