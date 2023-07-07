import {
  Buffer,
  Readback,
  Texture,
  getFormatByteSize,
} from '@antv/g-plugin-device-renderer';
import { GL, ResourceType } from '@antv/g-plugin-device-renderer';
import { clamp } from '@antv/util';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import type { Texture_GL } from './Texture';
import { getPlatformBuffer, isWebGL2 } from './utils';

export class Readback_GL extends ResourceBase_GL implements Readback {
  type: ResourceType.Readback = ResourceType.Readback;

  gl_pbo: WebGLBuffer | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLSync
  gl_sync: WebGLSync | null = null;

  constructor({ id, device }: { id: number; device: Device_GL }) {
    super({ id, device });
  }

  private clientWaitAsync(
    sync: WebGLSync,
    flags = 0,
    interval_ms = 10,
  ): Promise<void> {
    const gl = this.device.gl as WebGL2RenderingContext;
    return new Promise((resolve, reject) => {
      function test() {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clientWaitSync
        const res = gl.clientWaitSync(sync, flags, 0);
        if (res == gl.WAIT_FAILED) {
          reject();
          return;
        }
        if (res == gl.TIMEOUT_EXPIRED) {
          setTimeout(
            test,
            clamp(interval_ms, 0, gl.MAX_CLIENT_WAIT_TIMEOUT_WEBGL),
          );
          return;
        }
        resolve();
      }
      test();
    });
  }

  private async getBufferSubDataAsync(
    target: number,
    buffer: WebGLBuffer,
    srcByteOffset: number,
    dstBuffer: ArrayBufferView,
    dstOffset = 0,
    length = dstBuffer.byteLength || 0,
  ) {
    const gl = this.device.gl;
    if (isWebGL2(gl)) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/fenceSync
      this.gl_sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();

      await this.clientWaitAsync(this.gl_sync, 0, 10);

      gl.bindBuffer(target, buffer);
      gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length);
      gl.bindBuffer(target, null);

      return dstBuffer;
    }
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#use_non-blocking_async_data_readback
   */
  async readTexture(
    t: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    dstBuffer: ArrayBufferView,
    dstOffset = 0,
    length = dstBuffer.byteLength || 0,
  ): Promise<ArrayBufferView> {
    const gl = this.device.gl;

    const texture = t as Texture_GL;
    const gl_format = this.device.translateTextureFormat(texture.pixelFormat);
    const gl_type = this.device.translateTextureType(texture.pixelFormat);
    const formatByteSize = getFormatByteSize(texture.pixelFormat);

    if (isWebGL2(gl)) {
      this.gl_pbo = this.device.ensureResourceExists(gl.createBuffer());
      // PIXEL_PACK_BUFFER: Buffer used for pixel transfer operations
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.gl_pbo);
      // STREAM_READ: The contents are intended to be specified once by reading data from WebGL, and queried at most a few times by the application
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
      gl.bufferData(gl.PIXEL_PACK_BUFFER, length, gl.STREAM_READ);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

      gl.bindFramebuffer(GL.READ_FRAMEBUFFER, this.device.readbackFramebuffer);
      gl.framebufferTexture2D(
        GL.READ_FRAMEBUFFER,
        GL.COLOR_ATTACHMENT0,
        GL.TEXTURE_2D,
        texture.gl_texture,
        0,
      );

      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.gl_pbo);
      gl.readPixels(
        x,
        y,
        width,
        height,
        gl_format,
        gl_type,
        dstOffset * formatByteSize,
      );
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

      return this.getBufferSubDataAsync(
        gl.PIXEL_PACK_BUFFER,
        this.gl_pbo,
        0,
        dstBuffer,
        dstOffset,
        length,
      );
    } else {
      gl.bindFramebuffer(GL.FRAMEBUFFER, this.device.readbackFramebuffer);
      gl.framebufferTexture2D(
        GL.FRAMEBUFFER,
        GL.COLOR_ATTACHMENT0,
        GL.TEXTURE_2D,
        texture.gl_texture,
        0,
      );
      // slow requires roundtrip to GPU
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
      gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
      gl.readPixels(x, y, width, height, gl.RGBA, gl_type, dstBuffer);
      return dstBuffer;
    }
  }

  readTextureSync(
    t: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    dstBuffer: ArrayBufferView,
    dstOffset = 0,
    length = dstBuffer.byteLength || 0,
  ): ArrayBufferView {
    const gl = this.device.gl;

    const texture = t as Texture_GL;
    const gl_type = this.device.translateTextureType(texture.pixelFormat);

    gl.bindFramebuffer(GL.FRAMEBUFFER, this.device.readbackFramebuffer);
    gl.framebufferTexture2D(
      GL.FRAMEBUFFER,
      GL.COLOR_ATTACHMENT0,
      GL.TEXTURE_2D,
      texture.gl_texture,
      0,
    );
    // slow requires roundtrip to GPU
    // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
    gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
    gl.readPixels(x, y, width, height, gl.RGBA, gl_type, dstBuffer);
    return dstBuffer;
  }

  async readBuffer(
    b: Buffer,
    srcByteOffset: number,
    dstBuffer: ArrayBufferView,
    dstOffset?: number,
    length?: number,
  ): Promise<ArrayBufferView> {
    const gl = this.device.gl;
    if (isWebGL2(gl)) {
      return this.getBufferSubDataAsync(
        gl.ARRAY_BUFFER,
        getPlatformBuffer(b, srcByteOffset),
        srcByteOffset,
        dstBuffer,
        dstOffset,
        length,
      );
    }

    // TODO: WebGL1
    return Promise.reject();
  }

  destroy() {
    super.destroy();
    if (isWebGL2(this.device.gl)) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/deleteSync
      if (this.gl_sync !== null) {
        this.device.gl.deleteSync(this.gl_sync);
      }
      if (this.gl_pbo !== null) {
        this.device.gl.deleteBuffer(this.gl_pbo);
      }
    }
  }
}
