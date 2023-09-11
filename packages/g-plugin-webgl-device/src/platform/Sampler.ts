import {
  GL,
  MipFilterMode,
  ResourceType,
  TexFilterMode,
  assert,
  isPowerOfTwo,
} from '@antv/g-plugin-device-renderer';
import type {
  Sampler,
  SamplerDescriptor,
} from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import {
  getPlatformSampler,
  isWebGL2,
  translateFilterMode,
  translateWrapMode,
} from './utils';

/**
 * In WebGL 1 texture image data and sampling information are both stored in texture objects
 * @see https://github.com/shrekshao/MoveWebGL1EngineToWebGL2/blob/master/Move-a-WebGL-1-Engine-To-WebGL-2-Blog-2.md#sampler-objects
 */
export class Sampler_GL extends ResourceBase_GL implements Sampler {
  type: ResourceType.Sampler = ResourceType.Sampler;

  gl_sampler: WebGLSampler;
  descriptor: SamplerDescriptor;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: SamplerDescriptor;
  }) {
    super({ id, device });

    const gl = this.device.gl;

    if (isWebGL2(gl)) {
      const gl_sampler = this.device.ensureResourceExists(gl.createSampler());
      gl.samplerParameteri(
        gl_sampler,
        GL.TEXTURE_WRAP_S,
        translateWrapMode(descriptor.wrapS),
      );
      gl.samplerParameteri(
        gl_sampler,
        GL.TEXTURE_WRAP_T,
        translateWrapMode(descriptor.wrapT),
      );
      gl.samplerParameteri(
        gl_sampler,
        GL.TEXTURE_WRAP_R,
        translateWrapMode(descriptor.wrapQ ?? descriptor.wrapS),
      );
      gl.samplerParameteri(
        gl_sampler,
        GL.TEXTURE_MIN_FILTER,
        translateFilterMode(descriptor.minFilter, descriptor.mipFilter),
      );
      gl.samplerParameteri(
        gl_sampler,
        GL.TEXTURE_MAG_FILTER,
        translateFilterMode(descriptor.magFilter, MipFilterMode.NO_MIP),
      );

      if (descriptor.minLOD !== undefined) {
        gl.samplerParameterf(gl_sampler, GL.TEXTURE_MIN_LOD, descriptor.minLOD);
      }
      if (descriptor.maxLOD !== undefined) {
        gl.samplerParameterf(gl_sampler, GL.TEXTURE_MAX_LOD, descriptor.maxLOD);
      }
      if (descriptor.compareMode !== undefined) {
        gl.samplerParameteri(
          gl_sampler,
          gl.TEXTURE_COMPARE_MODE,
          gl.COMPARE_REF_TO_TEXTURE,
        );
        gl.samplerParameteri(
          gl_sampler,
          gl.TEXTURE_COMPARE_FUNC,
          descriptor.compareMode,
        );
      }

      const maxAnisotropy = descriptor.maxAnisotropy ?? 1;
      if (
        maxAnisotropy > 1 &&
        this.device.EXT_texture_filter_anisotropic !== null
      ) {
        assert(
          descriptor.minFilter === TexFilterMode.BILINEAR &&
            descriptor.magFilter === TexFilterMode.BILINEAR &&
            descriptor.mipFilter === MipFilterMode.LINEAR,
        );
        gl.samplerParameterf(
          gl_sampler,
          this.device.EXT_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
          maxAnisotropy,
        );
      }

      this.gl_sampler = gl_sampler;
    } else {
      // use later in WebGL1
      this.descriptor = descriptor;
    }
  }

  setTextureParameters(gl_target: number, width: number, height: number): void {
    const gl = this.device.gl;
    const descriptor = this.descriptor;

    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL#%E9%9D%9E2%E7%9A%84%E5%B9%82%E7%BA%B9%E7%90%86
    if (this.isNPOT(width, height)) {
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    } else {
      gl.texParameteri(
        gl_target,
        GL.TEXTURE_MIN_FILTER,
        translateFilterMode(descriptor.minFilter, descriptor.mipFilter),
      );
    }
    gl.texParameteri(
      GL.TEXTURE_2D,
      GL.TEXTURE_WRAP_S,
      translateWrapMode(descriptor.wrapS),
    );
    gl.texParameteri(
      GL.TEXTURE_2D,
      GL.TEXTURE_WRAP_T,
      translateWrapMode(descriptor.wrapT),
    );

    gl.texParameteri(
      gl_target,
      GL.TEXTURE_MAG_FILTER,
      translateFilterMode(descriptor.magFilter, MipFilterMode.NO_MIP),
    );

    // if (descriptor.minLOD !== undefined) {
    //   gl.texParameterf(gl_target, GL.TEXTURE_MIN_LOD, descriptor.minLOD);
    // }
    // if (descriptor.maxLOD !== undefined) {
    //   gl.texParameterf(gl_target, GL.TEXTURE_MAX_LOD, descriptor.maxLOD);
    // }

    const maxAnisotropy = descriptor.maxAnisotropy ?? 1;
    if (
      maxAnisotropy > 1 &&
      this.device.EXT_texture_filter_anisotropic !== null
    ) {
      assert(
        descriptor.minFilter === TexFilterMode.BILINEAR &&
          descriptor.magFilter === TexFilterMode.BILINEAR &&
          descriptor.mipFilter === MipFilterMode.LINEAR,
      );
      gl.texParameteri(
        gl_target,
        this.device.EXT_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
        maxAnisotropy,
      );
    }
  }

  destroy() {
    super.destroy();

    if (isWebGL2(this.device.gl)) {
      this.device.gl.deleteSampler(getPlatformSampler(this));
    }
  }

  isNPOT(width: number, height: number): boolean {
    return !isPowerOfTwo(width) || !isPowerOfTwo(height);
  }
}
