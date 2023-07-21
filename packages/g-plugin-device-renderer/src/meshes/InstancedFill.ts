import type { DisplayObject } from '@antv/g-lite';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from '../meshes/Instanced';
import { Format, VertexBufferFrequency } from '../platform';
import meshFrag from '../shader/mesh.frag';
import meshVert from '../shader/mesh.vert';
import { updateBuffer } from './InstancedPath';
import { RenderHelper } from '../render';
import { TexturePool } from '../TexturePool';
import { LightPool } from '../LightPool';

const SEGMENT_NUM = 12;

export class InstancedFillMesh extends Instanced {
  constructor(
    protected renderHelper: RenderHelper,
    protected texturePool: TexturePool,
    protected lightPool: LightPool,
    object: DisplayObject,
  ) {
    super(renderHelper, texturePool, lightPool, object);
    this.trianglesHash = this.calcSegmentNum(object);
  }

  private trianglesHash: [number[], number[]] = [[], []];
  private calcSegmentNum(object: DisplayObject): [number[], number[]] {
    const { triangles, pointsBuffer } = updateBuffer(object, true, SEGMENT_NUM);
    return [triangles, pointsBuffer];
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

    const trianglesHash = this.calcSegmentNum(object);
    return this.compareTrianglesHash(trianglesHash);
  }

  createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    super.createGeometry(objects);

    const indices: number[] = [];
    const pointsBuffer: number[] = [];
    const uvsBuffer: number[] = [];
    objects.forEach((object, i) => {
      // use triangles for Polygon
      const { triangles, pointsBuffer: pBuffer } = updateBuffer(
        object,
        true,
        SEGMENT_NUM,
      );

      const { halfExtents } = object.getGeometryBounds();
      const uvBuffer = pBuffer.map((x, i) => x / halfExtents[i % 2] / 2);

      pointsBuffer.push(...pBuffer);
      uvsBuffer.push(...uvBuffer);
      indices.push(...triangles.map((n) => n + (i * pBuffer.length) / 2));
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
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
