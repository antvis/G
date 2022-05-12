import type { Buffer, BufferDescriptor } from '@antv/g-plugin-device-renderer';
import { BufferUsage, ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

function isView(viewOrSize: ArrayBufferView | number): viewOrSize is ArrayBufferView {
  return (viewOrSize as ArrayBufferView).byteLength !== undefined;
}

export class Buffer_WebGPU extends ResourceBase_WebGPU implements Buffer {
  type: ResourceType.Buffer = ResourceType.Buffer;
  /**
   * @see https://www.w3.org/TR/webgpu/#gpubuffer
   */
  gpuBuffer: GPUBuffer;

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

    const alignedLength = isView(viewOrSize)
      ? (viewOrSize.byteLength + 3) & ~3
      : (viewOrSize + 3) & ~3; // 4 bytes alignments (because of the upload which requires this)

    this.usage = usage;

    // Buffer usages (BufferUsage::(MapRead|CopyDst|Storage)) is invalid. If a buffer usage contains BufferUsage::MapRead the only other allowed usage is BufferUsage::CopyDst.
    // @see https://www.w3.org/TR/webgpu/#dom-gpubufferusage-copy_dst
    if (this.usage & BufferUsage.MAP_READ) {
      this.usage = BufferUsage.MAP_READ | BufferUsage.COPY_DST;
    }

    const mapBuffer = isView(viewOrSize);

    this.size = isView(viewOrSize) ? viewOrSize.byteLength : viewOrSize;
    this.view = isView(viewOrSize) ? viewOrSize : null;
    this.gpuBuffer = this.device.device.createBuffer({
      usage: this.usage,
      size: alignedLength,
      mappedAtCreation: mapBuffer,
    });

    if (mapBuffer) {
      const arrayBuffer = this.gpuBuffer.getMappedRange();
      // @ts-expect-error
      new viewOrSize.constructor(arrayBuffer).set(viewOrSize);
      this.gpuBuffer.unmap();
    }
  }

  setSubData(dstByteOffset: number, src: ArrayBufferView, srcByteOffset = 0, byteLength = 0): void {
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
