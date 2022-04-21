import { injectable } from 'mana-syringe';
import type { DisplayObject, Image as ImageShape } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import vert from '../shader/image.vert';
import frag from '../shader/image.frag';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from '../meshes/Instanced';

@injectable()
export class ImageMesh extends Instanced {
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
    // @ts-ignore
    this.material.defines = {
      ...this.material.defines,
      USE_UV: true,
      USE_MAP: true,
    };

    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;

    const map = this.texturePool.getOrCreateTexture(this.device, img, undefined, () => {
      // need re-render
      objects.forEach((object) => {
        const renderable = object.renderable;
        renderable.dirty = true;

        this.renderingService.dirtify();
      });
    });

    this.material.setUniforms({
      u_Map: map,
    });
  }

  createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    super.createGeometry(objects);

    const instanced: number[] = [];
    const interleaved: number[] = [];
    const indices: number[] = [];
    objects.forEach((object, i) => {
      const image = object as ImageShape;
      const offset = i * 4;
      const { width, height } = image.parsedStyle;
      instanced.push(width.value, height.value);
      interleaved.push(0, 0, 1, 0, 1, 1, 0, 1);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
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
      data: new Float32Array(interleaved),
    });
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any) {
    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (name === 'width' || name === 'height') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const image = object as ImageShape;
        const { width, height } = image.parsedStyle;
        packed.push(width.value, height.value);
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.POSITION,
        VertexAttributeLocation.POSITION,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'img') {
      const map = this.texturePool.getOrCreateTexture(this.device, value, undefined, () => {
        // need re-render
        objects.forEach((object) => {
          const renderable = object.renderable;
          renderable.dirty = true;
        });
        this.renderingService.dirtify();
      });
      this.material.setUniforms({
        u_Map: map,
      });
    }
  }
}
