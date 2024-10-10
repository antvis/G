import { DisplayObject, Shape } from '@antv/g-lite';
import { Format, VertexStepMode } from '@antv/g-device-api';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import meshFrag from '../shader/mesh.frag';
import meshVert from '../shader/mesh.vert';
import { updateBuffer } from './InstancedPath';
import { RenderHelper } from '../render';
import { TexturePool } from '../TexturePool';
import { LightPool } from '../LightPool';
import { BatchContext } from '../renderer';
import { enumToObject } from '../utils';

const SEGMENT_NUM = 12;

enum FillVertexAttributeBufferIndex {
  PACKED_STYLE = VertexAttributeBufferIndex.POSITION + 1,
}

enum FillVertexAttributeLocation {
  PACKED_STYLE3 = VertexAttributeLocation.MAX,
}

export class InstancedFillDrawcall extends Instanced {
  // protected mergeAnchorIntoModelMatrix = true;

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

      const packedStyle: number[] = [];
      objects.forEach((object) => {
        const { isBillboard, billboardRotation, isSizeAttenuation } =
          object.parsedStyle;
        packedStyle.push(
          isBillboard ? 1 : 0,
          billboardRotation ?? 0,
          isSizeAttenuation ? 1 : 0,
          0,
        );
      });

      this.geometry.setVertexBuffer({
        bufferIndex: VertexAttributeBufferIndex.POSITION,
        byteStride: 4 * 3,
        stepMode: VertexStepMode.VERTEX,
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
        bufferIndex: FillVertexAttributeBufferIndex.PACKED_STYLE,
        byteStride: 4 * 4,
        stepMode: VertexStepMode.INSTANCE,
        attributes: [
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 0,
            location: FillVertexAttributeLocation.PACKED_STYLE3,
            divisor: 1,
          },
        ],
        data: new Float32Array(packedStyle),
      });
      this.geometry.setVertexBuffer({
        bufferIndex: VertexAttributeBufferIndex.UV,
        byteStride: 4 * 2,
        stepMode: VertexStepMode.VERTEX,
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
      ...enumToObject(FillVertexAttributeLocation),
      INSTANCED: true,
    };
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ): void {
    if (objects.length === 0) {
      return;
    }

    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (
      name === 'isBillboard' ||
      name === 'billboardRotation' ||
      name === 'isSizeAttenuation'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { isBillboard, billboardRotation, isSizeAttenuation } =
          object.parsedStyle;
        packed.push(
          isBillboard ? 1 : 0,
          billboardRotation ?? 0,
          isSizeAttenuation ? 1 : 0,
          0,
        );
      });

      this.geometry.updateVertexBuffer(
        FillVertexAttributeBufferIndex.PACKED_STYLE,
        FillVertexAttributeLocation.PACKED_STYLE3,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    }
  }
}
