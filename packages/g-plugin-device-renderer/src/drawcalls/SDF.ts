import type {
  Circle,
  CSSRGB,
  DisplayObject,
  ParsedBaseStyleProps,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
  ParsedRectStyleProps,
} from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import { Format, VertexStepMode } from '@antv/g-device-api';
import frag from '../shader/sdf.frag';
import vert from '../shader/sdf.vert';
import { enumToObject } from '../utils/enum';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';

enum SDFVertexAttributeBufferIndex {
  PACKED_STYLE = VertexAttributeBufferIndex.POSITION + 1,
}

enum SDFVertexAttributeLocation {
  PACKED_STYLE3 = VertexAttributeLocation.MAX,
  SIZE,
}

const SDF_Shape: string[] = [Shape.CIRCLE, Shape.ELLIPSE, Shape.RECT];

/**
 * Use SDF to render 2D shapes, eg. circle, ellipse.
 * Use less triangles(2) and vertices compared with normal triangulation.
 */
export class SDFDrawcall extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    // if (
    //   this.needDrawStrokeSeparately(object.parsedStyle) ||
    //   this.needDrawStrokeSeparately(this.instance.parsedStyle)
    // ) {
    //   return false;
    // }

    // const { fill: instanceFill } = this.instance
    //   .parsedStyle as ParsedBaseStyleProps;
    // const { fill } = object.parsedStyle as ParsedBaseStyleProps;
    // if ((instanceFill as CSSRGB).isNone !== (fill as CSSRGB).isNone) {
    //   return false;
    // }

    return true;
  }

  createMaterial(objects: DisplayObject[]) {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(SDFVertexAttributeLocation),
    };
  }

  createGeometry(objects: DisplayObject[]) {
    // use default common attributes
    super.createGeometry(objects);

    const instanced = [];
    objects.forEach((object, i) => {
      const circle = object as Circle;
      // @ts-ignore
      const { radius } = circle.parsedStyle;
      const omitStroke = this.shouldOmitStroke(circle.parsedStyle);
      const size = this.getSize(object.parsedStyle, circle.nodeName);
      instanced.push(
        ...size,
        circle.parsedStyle.isBillboard ? 1 : 0,
        circle.parsedStyle.isSizeAttenuation ? 1 : 0,
        SDF_Shape.indexOf(circle.nodeName),
        (radius && radius[0]) || 0,
        omitStroke ? 1 : 0,
      );
    });

    this.geometry.setIndexBuffer(new Uint32Array([0, 2, 1, 0, 3, 2]));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 4,
      stepMode: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.POSITION,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: VertexAttributeLocation.UV,
        },
      ],
      data: new Float32Array([
        -1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1,
      ]),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: SDFVertexAttributeBufferIndex.PACKED_STYLE,
      byteStride: 4 * 7,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: SDFVertexAttributeLocation.SIZE,
          divisor: 1,
        },
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 4,
          location: SDFVertexAttributeLocation.PACKED_STYLE3,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced),
    });
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
      name === 'lineWidth' ||
      name === 'stroke' ||
      name === 'lineDash' ||
      name === 'strokeOpacity' ||
      name === 'radius' ||
      name === 'isBillboard' ||
      name === 'isSizeAttenuation'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const circle = object as Circle;
        const omitStroke = this.shouldOmitStroke(circle.parsedStyle);

        const [halfWidth, halfHeight] = this.getSize(
          object.parsedStyle,
          object.nodeName,
        );
        const size = [halfWidth, halfHeight];
        packed.push(
          ...size,
          circle.parsedStyle.isBillboard ? 1 : 0,
          circle.parsedStyle.isSizeAttenuation ? 1 : 0,
          SDF_Shape.indexOf(object.nodeName),
          (object.parsedStyle.radius && object.parsedStyle.radius[0]) || 0,
          omitStroke ? 1 : 0,
        );
      });
      this.geometry.updateVertexBuffer(
        SDFVertexAttributeBufferIndex.PACKED_STYLE,
        SDFVertexAttributeLocation.SIZE,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    }
  }

  private getSize(
    parsed:
      | ParsedCircleStyleProps
      | ParsedEllipseStyleProps
      | ParsedRectStyleProps,
    tagName: string,
  ) {
    let size: [number, number] = [0, 0];
    if (tagName === Shape.CIRCLE) {
      const { r } = parsed as ParsedCircleStyleProps;
      size = [r, r];
    } else if (tagName === Shape.ELLIPSE) {
      const { rx, ry } = parsed as ParsedEllipseStyleProps;
      size = [rx, ry];
    } else if (tagName === Shape.RECT) {
      const { width, height } = parsed as ParsedRectStyleProps;
      size = [width / 2, height / 2];
    }

    return size;
  }

  private shouldOmitStroke(parsedStyle: ParsedBaseStyleProps) {
    const { lineDash, stroke, strokeOpacity } = parsedStyle;
    const hasStroke = stroke && !(stroke as CSSRGB).isNone;
    const hasLineDash =
      lineDash &&
      lineDash.length &&
      lineDash.every((item: number) => item !== 0);
    const hasStrokeOpacity = strokeOpacity < 1;
    return !hasStroke || (hasStroke && (hasLineDash || hasStrokeOpacity));
  }
}
