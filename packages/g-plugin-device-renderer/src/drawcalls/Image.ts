import type { DisplayObject, Image as ImageShape } from '@antv/g-lite';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import { Format, VertexBufferFrequency } from '../platform';
import frag from '../shader/image.frag';
import vert from '../shader/image.vert';

export class ImageDrawcall extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.instance.parsedStyle.img !== object.parsedStyle.img) {
      return false;
    }

    return true;
  }

  createMaterial(objects: DisplayObject[]): void {
    const instance = objects[0];
    const { img } = instance.parsedStyle;

    this.material.defines = {
      ...this.material.defines,
    };

    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;

    const map = this.texturePool.getOrCreateTexture(this.context.device, img);
    this.material.setUniforms({
      u_Map: map,
    });
  }

  createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    super.createGeometry(objects);

    const instanced: number[] = [];
    objects.forEach((object, i) => {
      const image = object as ImageShape;
      const { width, height, isBillboard, billboardRotation } =
        image.parsedStyle;
      instanced.push(
        width,
        height,
        isBillboard ? 1 : 0,
        billboardRotation ?? 0,
      );
    });

    this.geometry.setIndexBuffer(new Uint32Array([0, 2, 1, 0, 3, 2]));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.POSITION,
        },
      ],
      data: new Float32Array(instanced),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.UV,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.UV,
        },
      ],
      data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
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
      name === 'width' ||
      name === 'height' ||
      name === 'z' ||
      name === 'isBillboard'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const image = object as ImageShape;
        const { width, height, isBillboard, billboardRotation } =
          image.parsedStyle;
        packed.push(width, height, isBillboard ? 1 : 0, billboardRotation ?? 0);
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.POSITION,
        VertexAttributeLocation.POSITION,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'img') {
      const map = this.texturePool.getOrCreateTexture(
        this.context.device,
        value,
      );
      this.material.setUniforms({
        u_Map: map,
      });
    }
  }
}
