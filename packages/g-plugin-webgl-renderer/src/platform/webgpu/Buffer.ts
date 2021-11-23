import { Buffer, BufferDescriptor, BufferUsage, ResourceType } from '../interfaces';
import { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { translateBufferUsage } from './utils';

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

  flags: number;

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

    const { usage, flags, viewOrSize } = descriptor;

    const alignedLength = isView(viewOrSize)
      ? (viewOrSize.byteLength + 3) & ~3
      : (viewOrSize + 3) & ~3; // 4 bytes alignments (because of the upload which requires this)

    this.usage = translateBufferUsage(usage);
    // @see https://www.w3.org/TR/webgpu/#dom-gpubufferusage-copy_dst
    this.usage |= GPUBufferUsage.COPY_DST;
    // this.usage |= GPUBufferUsage.COPY_SRC;

    this.flags = this.usage | flags;

    this.size = isView(viewOrSize) ? viewOrSize.byteLength : viewOrSize;
    this.view = isView(viewOrSize) ? viewOrSize : null;
    this.gpuBuffer = this.device.device.createBuffer({
      usage: this.flags,
      // usage: this.usage,
      size: alignedLength,
      // mappedAtCreation: true,
    });

    if (isView(viewOrSize)) {
      this.setSubData(0, viewOrSize);
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
