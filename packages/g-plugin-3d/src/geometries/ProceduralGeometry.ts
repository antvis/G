import {
  Format,
  BufferGeometry,
  VertexBufferFrequency,
  VertexAttributeLocation,
  Mesh,
} from '@antv/g-plugin-webgl-renderer';
import { mat4, vec3, vec4 } from 'gl-matrix';

export enum ProceduralGeometryAttributeLocation {
  POSITION = 1,
  NORMAL,
  UV,
  MAX,
}

export abstract class ProceduralGeometry<GeometryProps> extends BufferGeometry<GeometryProps> {
  /**
   * flip Y, since +Y is down in G's world coords
   */
  protected flipYMatrix = mat4.fromScaling(mat4.create(), vec3.fromValues(1, -1, 1));

  /**
   * create geometry attributes
   */
  protected abstract createTopology(mesh: Mesh<GeometryProps>): {
    indices: number[];
    positions: number[];
    normals: number[];
    uvs: number[];
    uv1s: number[];
  };

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
  }

  applyMat4(mat: mat4) {
    this.applyMa4Position(mat, this.vertexBuffers[ProceduralGeometryAttributeLocation.POSITION]);
    this.applyMa4Normal(mat, this.vertexBuffers[ProceduralGeometryAttributeLocation.NORMAL]);
    // transform tangent
  }

  getBoundingBox() {
    // 根据 ProceduralGeometryAttributeLocation.POSITION 计算
  }

  build(meshes: Mesh<GeometryProps>[]) {
    const positionsAll: number[] = [];
    const normalsAll: number[] = [];
    const uvsAll: number[] = [];
    const uv1sAll: number[] = [];
    const indicesAll: number[] = [];
    let indiceStart = 0;
    meshes.forEach((mesh) => {
      const { indices, positions, normals, uvs, uv1s } = this.createTopology(mesh);

      positionsAll.push(...positions);
      normalsAll.push(...normals);
      uvsAll.push(...uvs);
      uv1sAll.push(...uv1s);
      indicesAll.push(...indices.map((i) => i + indiceStart));
      indiceStart = indices.length;
    });

    this.setIndices(new Uint32Array(indicesAll));
    this.vertexCount = indicesAll.length / meshes.length;
    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.POSITION,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.POSITION,
        },
      ],
      data: Float32Array.from(positionsAll),
    });
    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.NORMAL,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.NORMAL,
        },
      ],
      data: Float32Array.from(normalsAll),
    });
    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.UV,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.UV,
        },
      ],
      data: Float32Array.from(uvsAll),
    });

    this.applyMat4(this.flipYMatrix);
  }

  update<Key extends keyof GeometryProps>(
    index: number,
    mesh: Mesh,
    name: Key,
    value: GeometryProps[Key],
  ) {
    return [];
  }
}
