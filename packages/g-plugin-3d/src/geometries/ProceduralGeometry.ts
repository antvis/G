import { AABB } from '@antv/g-lite';
import {
  BufferGeometry,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from '@antv/g-plugin-device-renderer';
import type { Device } from '@antv/g-device-api';
import { Format, VertexStepMode } from '@antv/g-device-api';
import { mat4, vec3, vec4 } from 'gl-matrix';

export interface Topology {
  indices: number[];
  positions: number[];
  normals: number[];
  uvs: number[];
  uv1s: number[];
}

export abstract class ProceduralGeometry<
  GeometryProps,
> extends BufferGeometry<GeometryProps> {
  constructor(device: Device, props: Partial<GeometryProps> = {}) {
    super(device, props);
    this.topology = this.createTopology();
  }

  protected topology: Topology;

  /**
   * flip Y, since +Y is down in G's world coords
   */
  protected flipYMatrix = mat4.fromScaling(
    mat4.create(),
    vec3.fromValues(1, -1, 1),
  );

  /**
   * create geometry attributes
   */
  protected abstract createTopology(): Topology;

  protected applyMa4Position(mat: mat4, positions: ArrayBufferView) {
    const v = vec4.create();
    for (let i = 0; i < positions.byteLength / 4; i += 3) {
      v[0] = positions[i];
      v[1] = positions[i + 1];
      v[2] = positions[i + 2];
      v[3] = 1;
      vec4.transformMat4(v, v, mat);
      positions[i] = v[0];
      positions[i + 1] = v[1];
      positions[i + 2] = v[2];
    }

    this.updateVertexBuffer(
      VertexAttributeBufferIndex.POSITION,
      VertexAttributeLocation.POSITION,
      0,
      new Uint8Array(positions.buffer),
    );
  }

  protected applyMa4Normal(mat: mat4, normals: ArrayBufferView) {
    const v = vec4.create();
    const normalMatrix = mat4.copy(mat4.create(), mat);
    mat4.invert(normalMatrix, normalMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    for (let i = 0; i < normals.byteLength / 4; i += 3) {
      v[0] = normals[i];
      v[1] = normals[i + 1];
      v[2] = normals[i + 2];
      v[3] = 1;
      vec4.transformMat4(v, v, normalMatrix);
      normals[i] = v[0];
      normals[i + 1] = v[1];
      normals[i + 2] = v[2];
    }

    this.updateVertexBuffer(
      VertexAttributeBufferIndex.NORMAL,
      VertexAttributeLocation.NORMAL,
      0,
      new Uint8Array(normals.buffer),
    );
  }

  protected rebuildPosition() {
    this.topology = this.createTopology();

    const p = Float32Array.from(this.topology.positions);
    this.applyMa4Position(this.flipYMatrix, p);

    this.dirty = true;
  }

  applyMat4(mat: mat4) {
    this.applyMa4Position(
      mat,
      this.vertices[VertexAttributeBufferIndex.POSITION],
    );
    this.applyMa4Normal(mat, this.vertices[VertexAttributeBufferIndex.NORMAL]);
    // transform tangent
  }

  computeBoundingBox(): AABB {
    const { positions } = this.topology;

    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
    }

    const aabb = new AABB();
    aabb.setMinMax([minX, minY, minZ], [maxX, maxY, maxZ]);

    return aabb;
  }

  build() {
    const { indices, positions, normals, uvs } = this.topology;

    this.setIndexBuffer(new Uint32Array(indices));
    this.vertexCount = indices.length;
    this.setVertexBuffer({
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
      data: Float32Array.from(positions),
    });
    this.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.NORMAL,
      byteStride: 4 * 3,
      stepMode: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.NORMAL,
        },
      ],
      data: Float32Array.from(normals),
    });
    this.setVertexBuffer({
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
      data: Float32Array.from(uvs),
    });

    this.applyMat4(this.flipYMatrix);

    this.dirty = true;
  }
}
