import { injectable } from 'mana-syringe';
import { DisplayObject, Image, SHAPE } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import { Batch, AttributeLocation } from './Batch';
import { ShapeMesh, ShapeRenderer } from '../tokens';
import vert from '../shader/image.vert';
import frag from '../shader/image.frag';
import { BatchMesh } from './BatchMesh';
import { CircleBatchMesh } from './Circle';

enum ImageProgram {
  a_Size = AttributeLocation.MAX,
  a_Uv,
}

const IMAGE_TEXTURE_MAPPING = 'IMAGE_TEXTURE_MAPPING';

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
    this.material.addTexture(img, IMAGE_TEXTURE_MAPPING);
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

    this.bufferGeometry.setIndices(new Uint32Array(indices));
    this.bufferGeometry.vertexCount = 6;
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: ImageProgram.a_Uv,
        },
      ],
      data: new Float32Array(interleaved),
    });
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: ImageProgram.a_Size,
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
        ImageProgram.a_Size,
        index,
        new Uint8Array(new Float32Array([width, height]).buffer),
      );
    } else if (name === 'img') {
      this.material.addTexture(value, IMAGE_TEXTURE_MAPPING);
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
