import {
  Buffer,
  BufferDescriptor,
  BufferFrequencyHint,
  align,
} from '@antv/g-plugin-device-renderer';
import {
  // assert,
  BufferUsage,
  ResourceType,
} from '@antv/g-plugin-device-renderer';
import { isNumber } from '@antv/util';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import {
  getPlatformBuffer,
  isWebGL2,
  translateBufferHint,
  translateBufferUsageToTarget,
} from './utils';

export class Buffer_GL extends ResourceBase_GL implements Buffer {
  type: ResourceType.Buffer = ResourceType.Buffer;

  gl_buffer_pages: WebGLBuffer[];
  gl_target: GLenum;
  usage: BufferUsage;
  byteSize: number;
  pageByteSize: number;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: BufferDescriptor;
  }) {
    super({ id, device });

    const { viewOrSize, usage, hint = BufferFrequencyHint.STATIC } = descriptor;
    const { uniformBufferMaxPageByteSize, gl } = device;

    const isStorageTexture = usage & BufferUsage.STORAGE;

    if (isStorageTexture) {
      // // Use Texture as storage instead of Buffer.
      // const texture = this.createTexture({
      //   dimension: TextureDimension.n2D,
      //   pixelFormat: Format.U8_RGBA_NORM,
      //   usage: TextureUsage.Sampled,
      //   width: 1,
      //   height: 1,
      //   depth: 1,
      //   numLevels: 1,
      //   immutable: true,
      // });
      // texture.setImageData([new Uint8Array(4 * depth)]);

      // Create later.
      return this;
    }

    const isUBO = usage & BufferUsage.UNIFORM;

    if (!isUBO) {
      if (isWebGL2(gl)) {
        // Temporarily unbind VAO when creating buffers to not stomp on the VAO configuration.
        gl.bindVertexArray(null);
      } else {
        device.OES_vertex_array_object.bindVertexArrayOES(null);
      }
    }

    // const byteSize = isNumber(viewOrSize)
    //   ? viewOrSize * 4
    //   : viewOrSize.byteLength * 4;

    const byteSize = isNumber(viewOrSize)
      ? align(viewOrSize, 4)
      : align(viewOrSize.byteLength, 4);

    this.gl_buffer_pages = [];

    let pageByteSize: number;
    if (isUBO) {
      // assert(byteSize % uniformBufferMaxPageByteSize === 0);
      let byteSizeLeft = byteSize;
      while (byteSizeLeft > 0) {
        this.gl_buffer_pages.push(
          this.createBufferPage(
            Math.min(byteSizeLeft, uniformBufferMaxPageByteSize),
            usage,
            hint,
          ),
        );
        byteSizeLeft -= uniformBufferMaxPageByteSize;
      }

      pageByteSize = uniformBufferMaxPageByteSize;

      // TODO: uniform in WebGL1
    } else {
      this.gl_buffer_pages.push(this.createBufferPage(byteSize, usage, hint));
      pageByteSize = byteSize;
    }

    this.pageByteSize = pageByteSize;
    this.byteSize = byteSize;
    this.usage = usage;
    this.gl_target = translateBufferUsageToTarget(usage);

    // init data
    if (!isNumber(viewOrSize)) {
      this.setSubData(0, new Uint8Array(viewOrSize.buffer));
    }

    if (!isUBO) {
      if (isWebGL2(gl)) {
        gl.bindVertexArray(this.device['currentBoundVAO']);
      } else {
        device.OES_vertex_array_object.bindVertexArrayOES(
          this.device['currentBoundVAO'],
        );
      }
    }
  }

  setSubData(
    dstByteOffset: number,
    data: Uint8Array,
    srcByteOffset = 0,
    byteSize: number = data.byteLength - srcByteOffset,
  ): void {
    const gl = this.device.gl;
    const {
      // gl_target,
      // byteSize: dstByteSize,
      pageByteSize: dstPageByteSize,
    } = this;
    // Account for setSubData being called with a dstByteOffset that is beyond the end of the buffer.
    // if (isWebGL2(gl) && gl_target === gl.UNIFORM_BUFFER) {
    //   // Manually check asserts for speed.
    //   if (!(dstByteOffset % dstPageByteSize === 0))
    //     throw new Error(
    //       `Assert fail: (dstByteOffset [${dstByteOffset}] % dstPageByteSize [${dstPageByteSize}]) === 0`,
    //     );
    //   if (!(byteSize % dstPageByteSize === 0))
    //     throw new Error(
    //       `Assert fail: (byteSize [${byteSize}] % dstPageByteSize [${dstPageByteSize}]) === 0`,
    //     );
    // }
    // if (!(dstByteOffset + byteSize <= dstByteSize)) {
    //   throw new Error(
    //     `Assert fail: (dstByteOffset [${dstByteOffset}] + byteSize [${byteSize}]) <= dstByteSize [${dstByteSize}], gl_target ${gl_target}`,
    //   );
    //   // exceed, need to recreate
    // }

    const virtBufferByteOffsetEnd = dstByteOffset + byteSize;
    let virtBufferByteOffset = dstByteOffset;
    let physBufferByteOffset = dstByteOffset % dstPageByteSize;
    while (virtBufferByteOffset < virtBufferByteOffsetEnd) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer#parameters
      const target = isWebGL2(gl) ? gl.COPY_WRITE_BUFFER : this.gl_target;

      const buffer = getPlatformBuffer(this, virtBufferByteOffset);
      // @ts-ignore
      if (buffer.ubo) {
        return;
      }
      gl.bindBuffer(target, buffer);

      // only WebGL2 support srcOffset & length
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
      if (isWebGL2(gl)) {
        gl.bufferSubData(
          target,
          physBufferByteOffset,
          data,
          srcByteOffset,
          Math.min(
            virtBufferByteOffsetEnd - virtBufferByteOffset,
            dstPageByteSize,
          ),
        );
      } else {
        gl.bufferSubData(target, physBufferByteOffset, data);
      }

      virtBufferByteOffset += dstPageByteSize;
      physBufferByteOffset = 0;
      srcByteOffset += dstPageByteSize;
      this.device['debugGroupStatisticsBufferUpload']();
    }
  }

  destroy() {
    super.destroy();
    for (let i = 0; i < this.gl_buffer_pages.length; i++) {
      // no ubo in WebGL1
      // @ts-ignore
      if (!this.gl_buffer_pages[i].ubo) {
        this.device.gl.deleteBuffer(this.gl_buffer_pages[i]);
      }
    }
  }

  private createBufferPage(
    byteSize: number,
    usage: BufferUsage,
    hint: BufferFrequencyHint,
  ): WebGLBuffer {
    const gl = this.device.gl;
    const isUBO = usage & BufferUsage.UNIFORM;
    if (!isWebGL2(gl) && isUBO) {
      return {
        ubo: true,
      };
    } else {
      const gl_buffer = this.device.ensureResourceExists(gl.createBuffer());
      const gl_target = translateBufferUsageToTarget(usage);
      const gl_hint = translateBufferHint(hint);
      gl.bindBuffer(gl_target, gl_buffer);
      gl.bufferData(gl_target, byteSize, gl_hint);
      return gl_buffer;
    }
  }
}
