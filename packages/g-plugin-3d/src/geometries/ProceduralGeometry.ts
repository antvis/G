import { Format, BufferGeometry, VertexBufferFrequency, Mesh } from '@antv/g-plugin-webgl-renderer';
import { mat4, vec3, vec4 } from 'gl-matrix';

export enum ProceduralGeometryAttributeLocation {
  POSITION = 1,
  NORMAL,
  UV,
  MAX,
}

export abstract class ProceduralGeometry<GeometryProps> extends BufferGeometry<GeometryProps> {
  /**
   * create geometry attributes
   */
  protected abstract createTopology(meshes: Mesh<GeometryProps>[]): {
    indices: number[];
    positions: number[];
    normals: number[];
    uvs: number[];
    uvs1: number[];
    vertexCountPerInstance: number;
  };

  applyMat4(mat: mat4) {
    const positions = this.vertexBuffers[ProceduralGeometryAttributeLocation.POSITION];
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

    const normals = this.vertexBuffers[ProceduralGeometryAttributeLocation.NORMAL];
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

    // transform tangent
  }

  getBoundingBox() {
    // 根据 ProceduralGeometryAttributeLocation.POSITION 计算
  }

  build(meshes: Mesh<GeometryProps>[]) {
    const { indices, positions, normals, uvs, vertexCountPerInstance } =
      this.createTopology(meshes);

    this.setIndices(new Uint32Array(indices));
    this.vertexCount = vertexCountPerInstance;
    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.POSITION,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: 10,
        },
      ],
      data: Float32Array.from(positions),
    });
    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.NORMAL,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: 11,
        },
      ],
      data: Float32Array.from(normals),
    });
    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.UV,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: 12,
        },
      ],
      data: Float32Array.from(uvs),
    });

    // flip Y
    this.applyMat4(mat4.fromScaling(mat4.create(), vec3.fromValues(1, -1, 1)));
  }
}
