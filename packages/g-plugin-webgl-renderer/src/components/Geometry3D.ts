import { Component } from '@antv/g-ecs';
import { BufferData, IAttribute, IBuffer, IElements, RenderingEngine } from '../services/renderer';
import { gl } from '../services/renderer/constants';

export class Geometry3D extends Component {
  static tag = 'c-geometry-3d';

  engine: RenderingEngine;

  attributes: Array<
    {
      dirty: boolean;
      name: string;
      data?: BufferData;
      buffer?: IAttribute;
    } & GPUVertexBufferLayoutDescriptor
  > = [];

  /**
   * raw indices' data
   */
  indices: Uint32Array | undefined;
  indicesBuffer: IElements | undefined;

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

    this.indices = undefined;
    this.indicesBuffer = undefined;
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
  ) {
    let existedIndex = this.attributes.findIndex((a) => a.name === name);
    let existed = this.attributes[existedIndex];
    if (existed && existed.buffer && existed.data) {
      // @ts-ignore
      if (data.length === existed.data.length) {
        existed.buffer?.updateBuffer({
          data,
          // TODO: support offset in subdata
          offset: 0,
        });
        return this;
      }

      existed.buffer.destroy();
      this.attributes.splice(existedIndex, 1);
    }

    existed = {
      dirty: true,
      name,
      data,
      ...descriptor!,
    };

    existed.buffer = this.engine.createAttribute({
      buffer: this.engine.createBuffer({
        data: existed.data!,
        type: gl.FLOAT, // extract from descriptor
        usage: gl.DYNAMIC_DRAW,
      }),
      attributes: existed.attributes,
      arrayStride: existed.arrayStride,
      stepMode: existed.stepMode,
      divisor: existed.stepMode === 'vertex' ? 0 : 1,
    });

    this.attributes.push(existed);

    return this;
  }

  setIndex(data: number[] | Uint8Array | Uint16Array | Uint32Array) {
    if (this.indicesBuffer && this.indices) {
      if (this.indices.length === data.length) {
        this.indicesBuffer.subData({
          data,
          offset: 0,
        });
        return this;
      }

      // destroy existed buffer first
      this.indicesBuffer.destroy();
    }

    this.indices = new Uint32Array(
      // @ts-ignore
      data.buffer ? data.buffer : (data as number[])
    );
    this.indicesBuffer = this.engine.createElements({
      data: this.indices,
      count: this.indices.length,
      type: gl.UNSIGNED_INT,
      usage: gl.STATIC_DRAW,
    });
    return this;
  }
}
