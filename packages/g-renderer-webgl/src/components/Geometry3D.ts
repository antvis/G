import { Component } from '@antv/g-ecs';
import { BufferData, IBuffer, IElements, RenderingEngine } from '../services/renderer';
import { gl } from '../services/renderer/constants';

export class Geometry3D extends Component {
  static tag = 'c-geometry-3d';

  engine: RenderingEngine;

  attributes: Array<
    {
      dirty: boolean;
      name: string;
      data?: BufferData;
      buffer?: IBuffer;
      // 结合 Compute Pipeline 时，需要在运行时获取 PingPong buffer
      bufferGetter?: () => IBuffer;
    } & GPUVertexBufferLayoutDescriptor
  > = [];

  indices: Uint32Array | null;
  indicesBuffer: IElements | null;

  vertexCount: number = 0;

  // instanced count
  maxInstancedCount: number;

  reset() {
    this.attributes.forEach((attribute) => {
      if (attribute.buffer) {
        // attribute.buffer.destroy();
        attribute.buffer = undefined;
      }
    });

    if (this.indicesBuffer) {
      // this.indicesBuffer.destroy();
    }

    this.indices = null;
    this.indicesBuffer = null;
    this.attributes = [];
    this.vertexCount = 0;
    this.maxInstancedCount = 0;
  }

  getAttribute(name: string) {
    return this.attributes.find((a) => a.name === name);
  }

  /**
   * @see https://threejs.org/docs/#api/en/core/BufferAttribute
   */
  setAttribute(
    name: string,
    data: BufferData,
    descriptor?: GPUVertexBufferLayoutDescriptor,
    bufferGetter?: () => IBuffer
  ) {
    let existed = this.attributes.find((a) => a.name === name);
    if (existed) {
      existed.buffer?.subData({
        data,
        // TODO: support offset in subdata
        offset: 0,
      });
    } else {
      existed = {
        dirty: true,
        name,
        data,
        ...descriptor!,
        bufferGetter,
      };

      existed.buffer = this.engine.createBuffer({
        data,
        type: gl.FLOAT,
        usage: gl.DYNAMIC_DRAW,
      });

      this.attributes.push(existed);
    }

    return this;
  }

  setIndex(data: number[] | Uint8Array | Uint16Array | Uint32Array) {
    this.indices = new Uint32Array(
      // @ts-ignore
      data.buffer ? data.buffer : (data as number[])
    );

    // create index buffer if needed
    if (!this.indicesBuffer) {
      this.indicesBuffer = this.engine.createElements({
        data: this.indices,
        count: this.indices.length,
        type: gl.UNSIGNED_INT,
        usage: gl.STATIC_DRAW,
      });
    } else {
      this.indicesBuffer.subData({
        data: this.indices,
        offset: 0,
      });
    }

    return this;
  }

  // if (geometry.attributes.length === 0) {
  //   return;
  // }

  // geometry.attributes.forEach((attribute) => {
  //   if (attribute.dirty && attribute.data) {
  //     if (!attribute.buffer) {
  //       attribute.buffer = renderable.engine.createBuffer({
  //         data: attribute.data,
  //         type: gl.FLOAT,
  //         usage: instancing ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
  //       });
  //     } else {
  //       attribute.buffer?.subData({
  //         data: attribute.data,
  //         // TODO: support offset in subdata
  //         offset: 0,
  //       });
  //     }
  //     attribute.dirty = false;
  //   }
  // });

  // // create index buffer if needed
  // if (geometry.indices) {
  //   if (!geometry.indicesBuffer) {
  //     geometry.indicesBuffer = renderable.engine.createElements({
  //       data: geometry.indices,
  //       count: geometry.indices.length,
  //       type: gl.UNSIGNED_INT,
  //       usage: gl.STATIC_DRAW,
  //     });
  //   } else {
  //     geometry.indicesBuffer.subData({
  //       data: geometry.indices,
  //       offset: 0,
  //     });
  //   }
  // }

  /**
   * when merge all the geometries into one, we need to transform every vertex's position
   * and every face's normal
   */
  // applyMatrix(matrix: mat4) {
  //   const positionAttribute = this.attributes.find(({ name }) => name === 'position');
  //   const normalAttribute = this.attributes.find(({ name }) => name === 'normal');

  //   if (positionAttribute) {
  //     positionAttribute.dirty = true;

  //     // @ts-ignore
  //     if (positionAttribute.data && positionAttribute.data.length) {
  //       // @ts-ignore
  //       for (let i = 0; i < positionAttribute.data.length; i += 3) {
  //         const position = vec4.fromValues(
  //           // @ts-ignore
  //           positionAttribute.data[i] as number,
  //           // @ts-ignore
  //           positionAttribute.data[i + 1] as number,
  //           // @ts-ignore
  //           positionAttribute.data[i + 2] as number,
  //           1
  //         );
  //         vec4.transformMat4(position, position, matrix);
  //         if (isTypedArray(positionAttribute.data)) {
  //           // @ts-ignore
  //           positionAttribute.data.set([position[0], position[1], position[2]], i);
  //         } else {
  //           // @ts-ignore
  //           positionAttribute.data[i] = position[0];
  //           // @ts-ignore
  //           positionAttribute.data[i + 1] = position[1];
  //           // @ts-ignore
  //           positionAttribute.data[i + 2] = position[2];
  //         }
  //       }
  //     }
  //   }

  //   if (normalAttribute) {
  //     const normalMatrix = mat3.normalFromMat4(mat3.create(), matrix);
  //     // @ts-ignore
  //     if (normalAttribute.data && normalAttribute.data.length) {
  //       // @ts-ignore
  //       for (let i = 0; i < normalAttribute.data.length; i += 3) {
  //         const normal = vec3.fromValues(
  //           // @ts-ignore
  //           normalAttribute.data[i] as number,
  //           // @ts-ignore
  //           normalAttribute.data[i + 1] as number,
  //           // @ts-ignore
  //           normalAttribute.data[i + 2] as number
  //         );
  //         vec3.transformMat3(normal, normal, normalMatrix);
  //         vec3.normalize(normal, normal);
  //         if (isTypedArray(normalAttribute.data)) {
  //           // @ts-ignore
  //           normalAttribute.data.set([normal[0], normal[1], normal[2]], i);
  //         } else {
  //           // @ts-ignore
  //           normalAttribute.data[i] = normal[0];
  //           // @ts-ignore
  //           normalAttribute.data[i + 1] = normal[1];
  //           // @ts-ignore
  //           normalAttribute.data[i + 2] = normal[2];
  //         }
  //       }
  //     }
  //   }
  // }
}
