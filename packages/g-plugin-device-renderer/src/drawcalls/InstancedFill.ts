import { DisplayObject, Shape } from '@antv/g-lite';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import { Format, VertexBufferFrequency } from '../platform';
import meshFrag from '../shader/mesh.frag';
import meshVert from '../shader/mesh.vert';
import { updateBuffer } from './InstancedPath';
import { RenderHelper } from '../render';
import { TexturePool } from '../TexturePool';
import { LightPool } from '../LightPool';
import { BatchContext } from '../renderer';

const SEGMENT_NUM = 12;

export class InstancedFillDrawcall extends Instanced {
  protected mergeAnchorIntoModelMatrix = true;

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
    this.trianglesHash = this.calcSegmentNum(object);
  }

  private trianglesHash: [number[], number[]] = [[], []];
  private calcSegmentNum(object: DisplayObject): [number[], number[]] {
    const { triangles, pointsBuffer } = updateBuffer(
      object,
      true,
      SEGMENT_NUM,
      this.calcSubpathIndex(object),
    );
    return [triangles, pointsBuffer];
  }

  private calcSubpathIndex(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      return this.index;
    }
    return 0;
  }

  private compareTrianglesHash(hash: [number[], number[]]) {
    const [triangles, points] = this.trianglesHash;
    const [t, p] = hash;
    if (triangles.length !== t.length || points.length !== p.length) {
      return false;
    }

    if (
      triangles.some((n, i) => n !== t[i]) ||
      points.some((n, i) => n !== p[i])
    ) {
      return false;
    }

    return true;
  }

  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);
    if (!shouldMerge) {
      return false;
    }

    if (this.index !== index) {
      return false;
    }

    const trianglesHash = this.calcSegmentNum(object);
    return this.compareTrianglesHash(trianglesHash);
  }

  createGeometry(objects: DisplayObject[]): void {
    const indices: number[] = [];
    const pointsBuffer: number[] = [];
    const uvsBuffer: number[] = [];
    let offset = 0;
    objects.forEach((object, i) => {
      // use triangles for Polygon
      const { triangles, pointsBuffer: pBuffer } = updateBuffer(
        object,
        true,
        SEGMENT_NUM,
        this.calcSubpathIndex(object),
      );

      if (triangles.length) {
        const { halfExtents } = object.getGeometryBounds();
        // pointsBuffer use 3D
        const uvBuffer = [];
        pBuffer.forEach((x, i) => {
          if (i % 3 !== 2) {
            uvBuffer.push(x / halfExtents[i % 3] / 2);
          }
        });

        offset += pointsBuffer.length / 3;

        pointsBuffer.push(...pBuffer);
        uvsBuffer.push(...uvBuffer);
        indices.push(...triangles.map((n) => n + offset));
      }
    });

    if (pointsBuffer.length) {
      // use default common attributes
      super.createGeometry(objects);

      this.geometry.setVertexBuffer({
        bufferIndex: VertexAttributeBufferIndex.POSITION,
        byteStride: 4 * 3,
        frequency: VertexBufferFrequency.PerVertex,
        attributes: [
          {
            format: Format.F32_RGB,
            bufferByteOffset: 4 * 0,
            location: VertexAttributeLocation.POSITION,
          },
        ],
        data: new Float32Array(pointsBuffer),
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
        data: new Float32Array(uvsBuffer),
      });
      this.geometry.vertexCount = indices.length / objects.length;
      this.geometry.setIndexBuffer(new Uint32Array(indices));
    }
  }

  createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = meshVert;
    this.material.fragmentShader = meshFrag;
    this.material.defines = {
      ...this.material.defines,
      INSTANCED: true,
    };
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ): void {
    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);
  }
}
