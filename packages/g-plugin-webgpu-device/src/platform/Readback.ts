import type { Buffer, Readback, Texture } from '@antv/g-plugin-device-renderer';
import {
  BufferFrequencyHint,
  BufferUsage,
  Format,
  getFormatCompByteSize,
  ResourceType,
} from '@antv/g-plugin-device-renderer';
import type { Buffer_WebGPU } from './Buffer';
import { GPUMapMode } from './constants';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import type { Texture_WebGPU } from './Texture';
import { allocateAndCopyTypedBuffer, halfFloat2Number } from './utils';

export class Readback_WebGPU extends ResourceBase_WebGPU implements Readback {
  type: ResourceType.Readback = ResourceType.Readback;

  constructor({ id, device }: { id: number; device: IDevice_WebGPU }) {
    super({ id, device });
  }

  async readTexture(
    t: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    dst: ArrayBufferView,
    dstOffset = 0,
    length = 0,
  ): Promise<ArrayBufferView> {
    const texture = t as Texture_WebGPU;

    // FIXME: default to 0 for now
    const faceIndex = 0;

    const blockInformation = this.getBlockInformationFromFormat(texture.format);

    const bytesPerRow =
      Math.ceil(width / blockInformation.width) * blockInformation.length;

    // bytesPerRow (4) is not a multiple of 256, so we need to align it to 256.
    const bytesPerRowAligned = Math.ceil(bytesPerRow / 256) * 256;

    const size = bytesPerRowAligned * height;

    const buffer = this.device.createBuffer({
      usage: BufferUsage.STORAGE | BufferUsage.MAP_READ | BufferUsage.COPY_DST,
      hint: BufferFrequencyHint.Static,
      viewOrSize: size,
    }) as Buffer_WebGPU;

    const commandEncoder = this.device.device.createCommandEncoder();

    // @see https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer
    commandEncoder.copyTextureToBuffer(
      {
        texture: texture.gpuTexture,
        mipLevel: 0,
        origin: {
          x,
          y,
          z: Math.max(faceIndex, 0),
        },
      },
      {
        buffer: buffer.gpuBuffer,
        offset: 0,
        bytesPerRow: bytesPerRowAligned,
      },
      {
        width,
        height,
        depthOrArrayLayers: 1,
      },
    );

    this.device.device.queue.submit([commandEncoder.finish()]);

    return this.readBuffer(
      buffer,
      0,
      dst.byteLength === size ? dst : null,
      dstOffset,
      size,
      texture.pixelFormat,
    );
  }

  readBuffer(
    b: Buffer,
    srcByteOffset = 0,
    dstArrayBufferView: ArrayBufferView = null,
    dstOffset = 0,
    _size = 0,
    type: Format = Format.U8_RGB,
    noDataConversion = false,
    destroy = false,
    // bytesPerRow: number,
    // bytesPerRowAligned: number,
  ): Promise<ArrayBufferView> {
    const buffer = b as Buffer_WebGPU;

    const size = _size || buffer.size;
    const dst = dstArrayBufferView || buffer.view;
    const floatFormat =
      // @ts-ignore
      (dst && dst.constructor && dst.constructor.BYTES_PER_ELEMENT) ||
      getFormatCompByteSize(type);

    let gpuReadBuffer: Buffer_WebGPU = buffer;

    // can read buffer directly?
    if (
      !(
        buffer.usage & BufferUsage.MAP_READ &&
        buffer.usage & BufferUsage.COPY_DST
      )
    ) {
      const commandEncoder = this.device.device.createCommandEncoder();

      gpuReadBuffer = this.device.createBuffer({
        usage:
          BufferUsage.STORAGE | BufferUsage.MAP_READ | BufferUsage.COPY_DST,
        hint: BufferFrequencyHint.Static,
        viewOrSize: size,
      }) as Buffer_WebGPU;

      // Encode commands for copying buffer to buffer.
      commandEncoder.copyBufferToBuffer(
        buffer.gpuBuffer /* source buffer */,
        srcByteOffset /* source offset */,
        gpuReadBuffer.gpuBuffer /* destination buffer */,
        0 /* destination offset */,
        size /* size */,
      );

      this.device.device.queue.submit([commandEncoder.finish()]);
    }

    return new Promise((resolve, reject) => {
      gpuReadBuffer.gpuBuffer
        .mapAsync(GPUMapMode.READ, srcByteOffset, size)
        .then(
          () => {
            const copyArrayBuffer = gpuReadBuffer.gpuBuffer.getMappedRange(
              srcByteOffset,
              size,
            );
            let data = dst;
            if (noDataConversion) {
              if (data === null) {
                data = allocateAndCopyTypedBuffer(
                  type,
                  size,
                  true,
                  copyArrayBuffer,
                );
              } else {
                // @ts-ignore
                data = allocateAndCopyTypedBuffer(
                  type,
                  data.buffer,
                  undefined,
                  copyArrayBuffer,
                );
              }
            } else {
              if (data === null) {
                switch (floatFormat) {
                  case 1: // byte format
                    data = new Uint8Array(size);
                    (data as Uint8Array).set(new Uint8Array(copyArrayBuffer));
                    break;
                  case 2: // half float
                    // TODO WEBGPU use computer shaders (or render pass) to make the conversion?
                    data = this.getHalfFloatAsFloatRGBAArrayBuffer(
                      size / 2,
                      copyArrayBuffer,
                    );
                    break;
                  case 4: // float
                    data = new Float32Array(size / 4);
                    (data as Float32Array).set(
                      new Float32Array(copyArrayBuffer),
                    );
                    break;
                }
              } else {
                switch (floatFormat) {
                  case 1: // byte format
                    data = new Uint8Array(data.buffer);
                    (data as Uint8Array).set(new Uint8Array(copyArrayBuffer));
                    break;
                  case 2: // half float
                    // TODO WEBGPU use computer shaders (or render pass) to make the conversion?
                    data = this.getHalfFloatAsFloatRGBAArrayBuffer(
                      size / 2,
                      copyArrayBuffer,
                      dst as Float32Array,
                    );
                    break;
                  case 4: // float
                    const ctor = (dst && dst.constructor) || Float32Array;

                    // @ts-ignore
                    data = new ctor(data.buffer);
                    // @ts-ignore
                    (data as ctor).set(new ctor(copyArrayBuffer));
                    break;
                }
              }
            }
            // if (bytesPerRow !== bytesPerRowAligned) {
            //   // TODO WEBGPU use computer shaders (or render pass) to build the final buffer data?
            //   if (floatFormat === 1 && !noDataConversion) {
            //     // half float have been converted to float above
            //     bytesPerRow *= 2;
            //     bytesPerRowAligned *= 2;
            //   }
            //   const data2 = new Uint8Array(data!.buffer);
            //   let offset = bytesPerRow,
            //     offset2 = 0;
            //   for (let y = 1; y < height; ++y) {
            //     offset2 = y * bytesPerRowAligned;
            //     for (let x = 0; x < bytesPerRow; ++x) {
            //       data2[offset++] = data2[offset2++];
            //     }
            //   }
            //   if (floatFormat !== 0 && !noDataConversion) {
            //     data = new Float32Array(data2.buffer, 0, offset / 4);
            //   } else {
            //     data = new Uint8Array(data2.buffer, 0, offset);
            //   }
            // }
            gpuReadBuffer.gpuBuffer.unmap();

            resolve(data!);
          },
          (reason) => reject(reason),
        );
    });
  }

  private getHalfFloatAsFloatRGBAArrayBuffer(
    dataLength: number,
    arrayBuffer: ArrayBuffer,
    destArray?: Float32Array,
  ): Float32Array {
    if (!destArray) {
      destArray = new Float32Array(dataLength);
    }
    const srcData = new Uint16Array(arrayBuffer);
    while (dataLength--) {
      destArray[dataLength] = halfFloat2Number(srcData[dataLength]);
    }

    return destArray;
  }

  private getBlockInformationFromFormat(format: GPUTextureFormat): {
    width: number;
    height: number;
    length: number;
  } {
    switch (format) {
      // 8 bits formats
      case 'r8unorm':
      case 'r8snorm':
      case 'r8uint':
      case 'r8sint':
        return { width: 1, height: 1, length: 1 };

      // 16 bits formats
      case 'r16uint':
      case 'r16sint':
      case 'r16float':
      case 'rg8unorm':
      case 'rg8snorm':
      case 'rg8uint':
      case 'rg8sint':
        return { width: 1, height: 1, length: 2 };

      // 32 bits formats
      case 'r32uint':
      case 'r32sint':
      case 'r32float':
      case 'rg16uint':
      case 'rg16sint':
      case 'rg16float':
      case 'rgba8unorm':
      case 'rgba8unorm-srgb':
      case 'rgba8snorm':
      case 'rgba8uint':
      case 'rgba8sint':
      case 'bgra8unorm':
      case 'bgra8unorm-srgb':
      case 'rgb9e5ufloat':
      case 'rgb10a2unorm':
      case 'rg11b10ufloat':
        return { width: 1, height: 1, length: 4 };
      // 64 bits formats
      case 'rg32uint':
      case 'rg32sint':
      case 'rg32float':
      case 'rgba16uint':
      case 'rgba16sint':
      case 'rgba16float':
        return { width: 1, height: 1, length: 8 };

      // 128 bits formats
      case 'rgba32uint':
      case 'rgba32sint':
      case 'rgba32float':
        return { width: 1, height: 1, length: 16 };
      // Depth and stencil formats
      case 'stencil8':
        throw new Error('No fixed size for Stencil8 format!');
      case 'depth16unorm':
        return { width: 1, height: 1, length: 2 };
      case 'depth24plus':
        throw new Error('No fixed size for Depth24Plus format!');
      case 'depth24plus-stencil8':
        throw new Error('No fixed size for Depth24PlusStencil8 format!');
      case 'depth32float':
        return { width: 1, height: 1, length: 4 };
      // case 'depth24unorm-stencil8':
      //   return { width: 1, height: 1, length: 4 };
      case 'depth32float-stencil8':
        return { width: 1, height: 1, length: 5 };
      // BC compressed formats usable if "texture-compression-bc" is both
      // supported by the device/user agent and enabled in requestDevice.
      case 'bc7-rgba-unorm':
      case 'bc7-rgba-unorm-srgb':
      case 'bc6h-rgb-ufloat':
      case 'bc6h-rgb-float':
      case 'bc2-rgba-unorm':
      case 'bc2-rgba-unorm-srgb':
      case 'bc3-rgba-unorm':
      case 'bc3-rgba-unorm-srgb':
      case 'bc5-rg-unorm':
      case 'bc5-rg-snorm':
        return { width: 4, height: 4, length: 16 };

      case 'bc4-r-unorm':
      case 'bc4-r-snorm':
      case 'bc1-rgba-unorm':
      case 'bc1-rgba-unorm-srgb':
        return { width: 4, height: 4, length: 8 };
      default:
        return { width: 1, height: 1, length: 4 };
    }
  }
}
