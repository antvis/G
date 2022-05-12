import type {
  Circle,
  CSSRGB,
  DisplayObject,
  ParsedBaseStyleProps,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
} from '@antv/g';
import { Shape } from '@antv/g';
import { injectable } from 'mana-syringe';
import { Format, VertexBufferFrequency } from '../platform';
import vert from '../shader/sdf.vert';
import frag from '../shader/sdf.frag';
import { Instanced, VertexAttributeBufferIndex, VertexAttributeLocation } from './Instanced';
import { enumToObject } from '../utils/enum';

enum SDFVertexAttributeBufferIndex {
  PACKED_STYLE3 = VertexAttributeBufferIndex.MAX,
  SIZE,
}

enum SDFVertexAttributeLocation {
  PACKED_STYLE3 = VertexAttributeLocation.MAX,
  SIZE,
}

const SDF_Shape: string[] = [Shape.CIRCLE, Shape.ELLIPSE];

/**
 * Use SDF to render 2D shapes, eg. circle, ellipse.
 * Use less triangles(2) and vertices compared with normal triangulation.
 */
@injectable()
export class SDFMesh extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.needDrawStrokeSeparately(object) || this.needDrawStrokeSeparately(this.instance)) {
      return false;
    }

    const { fill: instanceFill } = this.instance.parsedStyle as ParsedBaseStyleProps;
    const { fill } = object.parsedStyle as ParsedBaseStyleProps;
    if ((instanceFill as CSSRGB).isNone !== (fill as CSSRGB).isNone) {
      return false;
    }

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

    const interleaved = [];
    const instanced = [];
    const instanced2 = [];
    const indices = [];
    objects.forEach((object, i) => {
      const circle = object as Circle;
      const offset = i * 4;
      // @ts-ignore
      const { radius } = circle.parsedStyle;
      const omitStroke = this.shouldOmitStroke(circle.parsedStyle);
      const size = this.getSize(object.parsedStyle, circle.nodeName);
      instanced.push(...size);
      instanced2.push(SDF_Shape.indexOf(circle.nodeName), radius || 0, omitStroke ? 1 : 0, 0);

      interleaved.push(-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerVertex,
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
      data: new Float32Array(interleaved),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: SDFVertexAttributeBufferIndex.SIZE,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: SDFVertexAttributeLocation.SIZE,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: SDFVertexAttributeBufferIndex.PACKED_STYLE3,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: SDFVertexAttributeLocation.PACKED_STYLE3,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced2),
    });
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any) {
    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (name === 'r' || name === 'rx' || name === 'ry' || name === 'lineWidth') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const [halfWidth, halfHeight] = this.getSize(object.parsedStyle, object.nodeName);
        const size = [halfWidth, halfHeight];
        packed.push(...size);
      });
      this.geometry.updateVertexBuffer(
        SDFVertexAttributeBufferIndex.SIZE,
        SDFVertexAttributeLocation.SIZE,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'stroke' || name === 'lineDash' || name === 'strokeOpacity') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const circle = object as Circle;
        const omitStroke = this.shouldOmitStroke(circle.parsedStyle);
        packed.push(
          SDF_Shape.indexOf(object.nodeName),
          object.parsedStyle.radius || 0,
          omitStroke ? 1 : 0,
          0,
        );
      });

      this.geometry.updateVertexBuffer(
        SDFVertexAttributeBufferIndex.PACKED_STYLE3,
        SDFVertexAttributeLocation.PACKED_STYLE3,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    }
  }

  private getSize(parsed: ParsedCircleStyleProps | ParsedEllipseStyleProps, tagName: string) {
    let size: [number, number] = [0, 0];
    if (tagName === Shape.CIRCLE) {
      const { r } = parsed as ParsedCircleStyleProps;
      size = [r.value, r.value];
    } else if (tagName === Shape.ELLIPSE) {
      const { rx, ry } = parsed as ParsedEllipseStyleProps;
      size = [rx.value, ry.value];
    }

    return size;
  }

  private shouldOmitStroke(attributes: ParsedBaseStyleProps) {
    const { lineDash, stroke, strokeOpacity } = attributes;
    return !!(
      stroke &&
      ((lineDash && lineDash.length && lineDash.every((item) => item.value !== 0)) ||
        strokeOpacity.value !== 1)
    );
  }

  private needDrawStrokeSeparately(object: DisplayObject) {
    const { stroke, lineDash, lineWidth, strokeOpacity } =
      object.parsedStyle as ParsedBaseStyleProps;
    return (
      stroke &&
      lineWidth.value > 0 &&
      (strokeOpacity.value < 1 ||
        (lineDash && lineDash.length && lineDash.every((item) => item.value !== 0)))
    );
  }
}
