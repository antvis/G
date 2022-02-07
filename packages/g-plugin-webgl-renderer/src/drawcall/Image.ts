import { injectable } from 'mana-syringe';
import { DisplayObject, Image, SHAPE } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import { Batch } from './Batch';
import { ShapeMesh, ShapeRenderer } from '../tokens';
import vert from '../shader/image.vert';
import frag from '../shader/image.frag';
import { BatchMesh } from './BatchMesh';
import { VertexAttributeLocation } from '../geometries';

enum ImageVertexAttributeLocation {
  SIZE = VertexAttributeLocation.MAX,
  UV,
}

@injectable({
  token: [{ token: ShapeMesh, named: SHAPE.Image }],
})
export class ImageBatchMesh extends BatchMesh {
  protected createMaterial(objects: DisplayObject[]): void {
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

  protected createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    this.createBatchedGeometry(objects);

    const instanced = [];
    const interleaved = [];
    const indices = [];
    objects.forEach((object, i) => {
      const image = object as Image;
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

  protected updateMeshAttribute(object: DisplayObject, index: number, name: string, value: any) {
    this.updateBatchedAttribute(object, index, name, value);

    const image = object as Image;
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

@injectable({
  token: [{ token: ShapeRenderer, named: SHAPE.Image }],
})
export class ImageRenderer extends Batch {
  protected createBatchMeshList(): void {
    this.batchMeshList.push(this.meshFactory(SHAPE.Image));
  }

  protected validate(object: DisplayObject<any, any>): boolean {
    if (this.instance.nodeName === SHAPE.Image) {
      if (this.instance.parsedStyle.img !== object.parsedStyle.img) {
        return false;
      }
    }

    return true;
  }
}
