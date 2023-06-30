import {
  Buffer,
  BufferDescriptor,
  align,
} from '@antv/g-plugin-device-renderer';
import { BufferUsage, ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { translateBufferUsage } from './utils';
import { isNumber } from '@antv/util';

export class Buffer_WebGPU extends ResourceBase_WebGPU implements Buffer {
  type: ResourceType.Buffer = ResourceType.Buffer;
  /**
   * @see https://www.w3.org/TR/webgpu/#gpubuffer
   */
  gpuBuffer: GPUBuffer;

  /**
   * size in bytes
   */
  size: number;

  view: ArrayBufferView;

  usage: BufferUsage;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: BufferDescriptor;
  }) {
    super({ id, device });

    const { usage, viewOrSize } = descriptor;
    const useMapRead = !!(usage & BufferUsage.MAP_READ);

    this.usage = translateBufferUsage(usage);

    // Buffer usages (BufferUsage::(MapRead|CopyDst|Storage)) is invalid. If a buffer usage contains BufferUsage::MapRead the only other allowed usage is BufferUsage::CopyDst.
    // @see https://www.w3.org/TR/webgpu/#dom-gpubufferusage-copy_dst
    if (useMapRead) {
      this.usage = BufferUsage.MAP_READ | BufferUsage.COPY_DST;
    }

    const mapBuffer = !isNumber(viewOrSize);

    // this.size = isView(viewOrSize) ? viewOrSize.byteLength : viewOrSize * 4;
    this.view = !isNumber(viewOrSize) ? viewOrSize : null;

    // 4 bytes alignments (because of the upload which requires this)
    this.size = isNumber(viewOrSize)
      ? align(viewOrSize, 4)
      : align(viewOrSize.byteLength, 4);

    if (!isNumber(viewOrSize)) {
      this.gpuBuffer = this.device.device.createBuffer({
        usage: this.usage,
        size: this.size,
        mappedAtCreation: true,
      });

      const ctor = (viewOrSize && viewOrSize.constructor) || Float32Array;
      // @ts-ignore
      new ctor(this.gpuBuffer.getMappedRange()).set(viewOrSize);
      this.gpuBuffer.unmap();
    } else {
      this.gpuBuffer = this.device.device.createBuffer({
        usage: this.usage,
        size: this.size,
        mappedAtCreation: useMapRead ? mapBuffer : false,
      });
    }
  }

  setSubData(
    dstByteOffset: number,
    src: Uint8Array,
    srcByteOffset = 0,
    byteLength = 0,
  ): void {
    const buffer = this.gpuBuffer;

    byteLength = byteLength || src.byteLength;
    byteLength = Math.min(byteLength, this.size - dstByteOffset);

    // After Migration to Canary
    let chunkStart = src.byteOffset + srcByteOffset;
    let chunkEnd = chunkStart + byteLength;

    // 4 bytes alignments for upload
    const alignedLength = (byteLength + 3) & ~3;
    if (alignedLength !== byteLength) {
      const tempView = new Uint8Array(src.buffer.slice(chunkStart, chunkEnd));
      src = new Uint8Array(alignedLength);
      (src as Uint8Array).set(tempView);
      srcByteOffset = 0;
      chunkStart = 0;
      chunkEnd = alignedLength;
      byteLength = alignedLength;
    }

    // Chunk
    const maxChunk = 1024 * 1024 * 15;
    let offset = 0;
    while (chunkEnd - (chunkStart + offset) > maxChunk) {
      this.device.device.queue.writeBuffer(
        buffer,
        dstByteOffset + offset,
        src.buffer,
        chunkStart + offset,
        maxChunk,
      );
      offset += maxChunk;
    }

    this.device.device.queue.writeBuffer(
      buffer,
      dstByteOffset + offset,
      src.buffer,
      chunkStart + offset,
      byteLength - offset,
    );
  }

  destroy() {
    super.destroy();
    // @see https://www.w3.org/TR/webgpu/#dom-gpubuffer-destroy
    this.gpuBuffer.destroy();
  }
}
