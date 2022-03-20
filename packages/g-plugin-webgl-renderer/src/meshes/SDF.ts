import {
  Circle,
  DisplayObject,
  Shape,
  ParsedBaseStyleProps,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
} from '@antv/g';
import { injectable } from 'mana-syringe';
import { Format, VertexBufferFrequency } from '../platform';
import vert from '../shader/sdf.vert';
import frag from '../shader/sdf.frag';
import { Instanced, VertexAttributeBufferIndex } from './Instanced';
import { VertexAttributeLocation } from '../geometries';
import { enumToObject } from '../utils/enum';

enum SDFVertexAttributeBufferIndex {
  EXTRUDE_UV = VertexAttributeBufferIndex.MAX,
  SIZE,
  PACKED_STYLE3,
}

enum SDFVertexAttributeLocation {
  EXTRUDE = VertexAttributeLocation.MAX,
  PACKED_STYLE3,
  SIZE,
  UV,
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
      bufferIndex: SDFVertexAttributeBufferIndex.EXTRUDE_UV,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: SDFVertexAttributeLocation.EXTRUDE,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: SDFVertexAttributeLocation.UV,
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

  updateAttribute(object: DisplayObject, name: string, value: any) {
    super.updateAttribute(object, name, value);

    const index = this.objects.indexOf(object);
    this.updateBatchedAttribute(object, index, name, value);

    if (name === 'r' || name === 'rx' || name === 'ry' || name === 'lineWidth') {
      const [halfWidth, halfHeight] = this.getSize(object.parsedStyle, object.nodeName);
      const size = [halfWidth, halfHeight];

      this.geometry.updateVertexBuffer(
        SDFVertexAttributeBufferIndex.SIZE,
        SDFVertexAttributeLocation.SIZE,
        index,
        new Uint8Array(new Float32Array([...size]).buffer),
      );
    } else if (name === 'stroke' || name === 'lineDash' || name === 'strokeOpacity') {
      const circle = object as Circle;
      const omitStroke = this.shouldOmitStroke(circle.parsedStyle);

      this.geometry.updateVertexBuffer(
        SDFVertexAttributeBufferIndex.PACKED_STYLE3,
        SDFVertexAttributeLocation.PACKED_STYLE3,
        index,
        new Uint8Array(
          new Float32Array([
            SDF_Shape.indexOf(object.nodeName),
            object.parsedStyle.radius || 0,
            omitStroke ? 1 : 0,
            0,
          ]).buffer,
        ),
      );
    }
  }

  private getSize(parsed: ParsedCircleStyleProps | ParsedEllipseStyleProps, tagName: string) {
    let size: [number, number] = [0, 0];
    if (tagName === Shape.CIRCLE) {
      const { rInPixels } = parsed as ParsedCircleStyleProps;
      size = [rInPixels, rInPixels];
    } else if (tagName === Shape.ELLIPSE) {
      const { rxInPixels, ryInPixels } = parsed as ParsedEllipseStyleProps;
      size = [rxInPixels, ryInPixels];
    }

    return size;
  }

  private shouldOmitStroke(attributes: ParsedBaseStyleProps) {
    const { lineDash, stroke, strokeOpacity } = attributes;
    return !!(
      stroke &&
      ((lineDash && lineDash.length && lineDash.every((item) => item !== 0)) || strokeOpacity !== 1)
    );
  }

  private needDrawStrokeSeparately(object: DisplayObject) {
    const { stroke, lineDash, lineWidth, strokeOpacity } =
      object.parsedStyle as ParsedBaseStyleProps;
    return (
      stroke &&
      lineWidth.value > 0 &&
      (strokeOpacity < 1 || (lineDash && lineDash.length && lineDash.every((item) => item !== 0)))
    );
  }
}
