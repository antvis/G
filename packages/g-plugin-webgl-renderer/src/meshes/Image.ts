import { injectable } from 'mana-syringe';
import { DisplayObject, Image as ImageShape } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import vert from '../shader/image.vert';
import frag from '../shader/image.frag';
import { Instanced } from '../meshes/Instanced';
import { VertexAttributeLocation } from '../geometries';

enum ImageVertexAttributeLocation {
  SIZE = VertexAttributeLocation.MAX,
  UV,
}

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
    this.material.defines.USE_UV = true;
    this.material.defines.USE_MAP = true;
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

    const instanced = [];
    const interleaved = [];
    const indices = [];
    objects.forEach((object, i) => {
      const image = object as ImageShape;
      const offset = i * 4;
      const { width, height } = image.parsedStyle;
      instanced.push(width, height);
      interleaved.push(0, 0, 1, 0, 1, 1, 0, 1);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: ImageVertexAttributeLocation.UV,
        },
      ],
      data: new Float32Array(interleaved),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: ImageVertexAttributeLocation.SIZE,
        },
      ],
      data: new Float32Array(instanced),
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any) {
    super.updateAttribute(object, name, value);

    const index = this.objects.indexOf(object);
    this.updateBatchedAttribute(object, index, name, value);

    const image = object as ImageShape;
    const { width, height } = image.parsedStyle;

    if (name === 'width' || name === 'height') {
      this.geometry.updateVertexBuffer(
        2,
        ImageVertexAttributeLocation.SIZE,
        index,
        new Uint8Array(new Float32Array([width, height]).buffer),
      );
    } else if (name === 'img') {
      const map = this.texturePool.getOrCreateTexture(this.device, value, undefined, () => {
        // need re-render
        const renderable = object.renderable;
        renderable.dirty = true;
        this.renderingService.dirtify();
      });
      this.material.setUniforms({
        u_Map: map,
      });
    }
  }
}
