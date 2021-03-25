import { Component } from '@antv/g-ecs';
import { mat3, mat4, vec3, vec4 } from 'gl-matrix';
import isTypedArray from 'lodash-es/isTypedArray';
import { BufferData, IBuffer, IElements } from '../services/renderer';

export class Geometry3D extends Component {
  static tag = 'c-geometry-3d';

  public dirty: boolean = true;

  public attributes: Array<
    {
      dirty: boolean;
      name: string;
      data?: BufferData;
      buffer?: IBuffer;
      // 结合 Compute Pipeline 时，需要在运行时获取 PingPong buffer
      bufferGetter?: () => IBuffer;
    } & GPUVertexBufferLayoutDescriptor
  > = [];

  public indices: Uint32Array | null;
  public indicesBuffer: IElements | null;

  public vertexCount: number = 0;

  // instanced count
  public maxInstancedCount: number;

  public reset() {
    this.attributes.forEach((attribute) => {
      if (attribute.buffer) {
        attribute.buffer.destroy();
      }
    });

    if (this.indicesBuffer) {
      this.indicesBuffer.destroy();
    }

    this.indices = null;
    this.attributes = [];
    this.vertexCount = 0;
    this.maxInstancedCount = 0;
  }

  public getAttribute(name: string) {
    return this.attributes.find((a) => a.name === name);
  }

  /**
   * @see https://threejs.org/docs/#api/en/core/BufferAttribute
   */
  public setAttribute(
    name: string,
    data: BufferData,
    descriptor?: GPUVertexBufferLayoutDescriptor,
    bufferGetter?: () => IBuffer
  ) {
    const existed = this.attributes.find((a) => a.name === name);
    if (!existed) {
      this.attributes.push({
        dirty: true,
        name,
        data,
        ...descriptor!,
        bufferGetter,
      });
    } else {
      existed.data = data;
      existed.dirty = true;
    }
    this.dirty = true;
    return this;
  }

  public setIndex(data: number[] | Uint8Array | Uint16Array | Uint32Array) {
    this.indices = new Uint32Array(
      // @ts-ignore
      data.buffer ? data.buffer : (data as number[])
    );
    this.dirty = true;
    return this;
  }

  /**
   * when merge all the geometries into one, we need to transform every vertex's position
   * and every face's normal
   */
  public applyMatrix(matrix: mat4) {
    const positionAttribute = this.attributes.find(({ name }) => name === 'position');
    const normalAttribute = this.attributes.find(({ name }) => name === 'normal');

    if (positionAttribute) {
      positionAttribute.dirty = true;

      // @ts-ignore
      if (positionAttribute.data && positionAttribute.data.length) {
        // @ts-ignore
        for (let i = 0; i < positionAttribute.data.length; i += 3) {
          const position = vec4.fromValues(
            // @ts-ignore
            positionAttribute.data[i] as number,
            // @ts-ignore
            positionAttribute.data[i + 1] as number,
            // @ts-ignore
            positionAttribute.data[i + 2] as number,
            1
          );
          vec4.transformMat4(position, position, matrix);
          if (isTypedArray(positionAttribute.data)) {
            // @ts-ignore
            positionAttribute.data.set([position[0], position[1], position[2]], i);
          } else {
            // @ts-ignore
            positionAttribute.data[i] = position[0];
            // @ts-ignore
            positionAttribute.data[i + 1] = position[1];
            // @ts-ignore
            positionAttribute.data[i + 2] = position[2];
          }
        }
      }
    }

    if (normalAttribute) {
      const normalMatrix = mat3.normalFromMat4(mat3.create(), matrix);
      // @ts-ignore
      if (normalAttribute.data && normalAttribute.data.length) {
        // @ts-ignore
        for (let i = 0; i < normalAttribute.data.length; i += 3) {
          const normal = vec3.fromValues(
            // @ts-ignore
            normalAttribute.data[i] as number,
            // @ts-ignore
            normalAttribute.data[i + 1] as number,
            // @ts-ignore
            normalAttribute.data[i + 2] as number
          );
          vec3.transformMat3(normal, normal, normalMatrix);
          vec3.normalize(normal, normal);
          if (isTypedArray(normalAttribute.data)) {
            // @ts-ignore
            normalAttribute.data.set([normal[0], normal[1], normal[2]], i);
          } else {
            // @ts-ignore
            normalAttribute.data[i] = normal[0];
            // @ts-ignore
            normalAttribute.data[i + 1] = normal[1];
            // @ts-ignore
            normalAttribute.data[i + 2] = normal[2];
          }
        }
      }
    }
  }
}
