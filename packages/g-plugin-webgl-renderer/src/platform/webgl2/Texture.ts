import { GL } from '../constants';
import { Format, FormatTypeFlags, getFormatSamplerKind, getFormatTypeFlags } from '../format';
import {
  ResourceType,
  SamplerFormatKind,
  Texture,
  TextureDescriptor,
  TextureDimension,
} from '../interfaces';
import { assert, isPowerOfTwo } from '../utils';
import { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import { getPlatformTexture, isTextureFormatCompressed, isWebGL2 } from './utils';

export class Texture_GL extends ResourceBase_GL implements Texture {
  type: ResourceType.Texture = ResourceType.Texture;

  gl_texture: WebGLTexture;
  gl_target: GLenum;
  pixelFormat: Format;
  width: number;
  height: number;
  depth: number;
  numLevels: number;
  immutable: boolean;
  // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
  pixelStore: Partial<{
    packAlignment: number;
    unpackAlignment: number;
    unpackFlipY: boolean;
  }>;
  mipmaps: boolean;
  formatKind: SamplerFormatKind;

  constructor({
    id,
    device,
    descriptor,
    fake,
  }: {
    id: number;
    device: Device_GL;
    descriptor: TextureDescriptor;
    fake?: boolean;
  }) {
    super({ id, device });

    const gl = this.device.gl;
    let gl_target: GLenum;
    let gl_texture: WebGLTexture;
    let numLevels = this.clampNumLevels(descriptor);
    this.immutable = !!descriptor.immutable;
    this.pixelStore = descriptor.pixelStore;
    this.pixelFormat = descriptor.pixelFormat;
    this.formatKind = getFormatSamplerKind(descriptor.pixelFormat);
    this.width = descriptor.width;
    this.height = descriptor.height;
    this.depth = descriptor.depth;
    this.mipmaps = numLevels >= 1;

    if (!fake) {
      gl_texture = this.device.ensureResourceExists(gl.createTexture());
      const gl_type = this.device.translateTextureType(descriptor.pixelFormat);

      const internalformat = this.device.translateTextureInternalFormat(descriptor.pixelFormat);
      this.device.setActiveTexture(gl.TEXTURE0);
      this.device.currentTextures[0] = null;

      this.preprocessImage();

      if (descriptor.dimension === TextureDimension.n2D) {
        gl_target = GL.TEXTURE_2D;
        gl.bindTexture(gl_target, gl_texture);
        if (isWebGL2(gl)) {
          if (this.immutable) {
            // texStorage2D will create an immutable texture(fixed size)
            // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage2D
            // @see https://github.com/visgl/luma.gl/issues/193
            // @see https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/texture_immutable.html
            gl.texStorage2D(
              gl_target,
              numLevels,
              internalformat,
              descriptor.width,
              descriptor.height,
            );
          }
        } else {
          if (this.immutable) {
            // texImage2D: level must be 0 for DEPTH_COMPONENT format
            const level = internalformat === GL.DEPTH_COMPONENT || this.isNPOT() ? 0 : numLevels;

            // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
            gl.texImage2D(
              gl_target,
              level,
              internalformat,
              descriptor.width,
              descriptor.height,
              // texImage2D: border != 0
              0,
              internalformat,
              gl_type,
              null,
            );

            // @see https://stackoverflow.com/questions/21954036/dartweb-gl-render-warning-texture-bound-to-texture-unit-0-is-not-renderable
            // [.WebGL-0x106ad0400]RENDER WARNING: texture bound to texture unit 0 is not renderable. It might be non-power-of-2 or have incompatible texture filtering (maybe)?
            if (this.mipmaps && this.isNPOT()) {
              this.mipmaps = false;
              gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
              gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
              gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            }
          }
        }

        assert(descriptor.depth === 1);
      } else if (descriptor.dimension === TextureDimension.n2DArray) {
        gl_target = GL.TEXTURE_2D_ARRAY;
        gl.bindTexture(gl_target, gl_texture);

        if (isWebGL2(gl)) {
          // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage3D
          gl.texStorage3D(
            gl_target,
            numLevels,
            internalformat,
            descriptor.width,
            descriptor.height,
            descriptor.depth,
          );
        }
      } else if (descriptor.dimension === TextureDimension.n3D) {
        gl_target = GL.TEXTURE_3D;
        gl.bindTexture(gl_target, gl_texture);

        if (isWebGL2(gl)) {
          gl.texStorage3D(
            gl_target,
            numLevels,
            internalformat,
            descriptor.width,
            descriptor.height,
            descriptor.depth,
          );
        }
      } else if (descriptor.dimension === TextureDimension.Cube) {
        gl_target = GL.TEXTURE_CUBE_MAP;
        gl.bindTexture(gl_target, gl_texture);
        if (isWebGL2(gl)) {
          gl.texStorage2D(
            gl_target,
            numLevels,
            internalformat,
            descriptor.width,
            descriptor.height,
          );
        }
        assert(descriptor.depth === 6);
      } else {
        throw 'whoops';
      }
    }

    this.gl_texture = gl_texture;
    this.gl_target = gl_target;
    this.numLevels = numLevels;

    if (this.mipmaps) {
      this.generateMipmap();
    }
  }

  setImageData(data: TexImageSource | ArrayBufferView[], level: number) {
    const gl = this.device.gl;
    const isCompressed = isTextureFormatCompressed(this.pixelFormat);
    const is3D = this.gl_target === GL.TEXTURE_3D || this.gl_target === GL.TEXTURE_2D_ARRAY;
    const isCube = this.gl_target === GL.TEXTURE_CUBE_MAP;
    const isArray = Array.isArray(data);

    this.device.setActiveTexture(gl.TEXTURE0);
    this.device.currentTextures[0] = null;

    let width: number;
    let height: number;
    if (isArray) {
      width = this.width;
      height = this.height;
    } else {
      width = (data as TexImageSource).width;
      height = (data as TexImageSource).height;
    }

    gl.bindTexture(this.gl_target, this.gl_texture);
    // let w = this.width;
    // let h = this.height;
    // let d = this.depth;
    // const maxMipLevel = Math.min(firstMipLevel + levelDatasSize, this.numLevels);

    const gl_format = this.device.translateTextureFormat(this.pixelFormat);
    const gl_type = this.device.translateTextureType(this.pixelFormat);

    this.preprocessImage();

    if (this.immutable) {
      // must use texSubImage2D instead of texImage2D, since texture is immutable
      // @see https://stackoverflow.com/questions/56123201/unity-plugin-texture-is-immutable?rq=1
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
      gl.texSubImage2D(
        this.gl_target,
        level,
        0,
        0,
        width,
        height,
        gl_format,
        gl_type,
        // @ts-ignore
        isArray ? data[0] : data,
      );
    } else {
      if (isWebGL2(gl)) {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
        gl.texImage2D(
          this.gl_target,
          level,
          gl_format,
          width,
          height,
          0, // border must be 0
          gl_format, // TODO: can be different with gl_format
          gl_type,
          // @ts-ignore
          isArray ? data[0] : data,
        );
      } else {
        // WebGL1:
        (gl as WebGLRenderingContext).texImage2D(
          this.gl_target,
          level,
          gl_format,
          gl_format,
          gl_type,
          data as ImageData,
        );
      }
    }

    if (this.mipmaps) {
      this.generateMipmap();
    }

    // for (let i = 0; i < maxMipLevel; i++) {
    //   if (i >= firstMipLevel) {
    //     const levelData = levelDatas[levelDatasOffs++] as ArrayBufferView;
    //     const compByteSize = isCompressed ? 1 : getFormatCompByteSize(this.pixelFormat);
    //     const sliceElementSize = levelData.byteLength / compByteSize / this.depth;

    //     // TODO: Buffer

    //     if (is3D && isCompressed) {
    //       // Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1004511
    //       for (let z = 0; z < this.depth; z++) {
    //         if (isWebGL2(gl)) {
    //           gl.compressedTexSubImage3D(
    //             this.gl_target,
    //             i,
    //             0,
    //             0,
    //             z,
    //             w,
    //             h,
    //             1,
    //             gl_format,
    //             levelData,
    //             z * sliceElementSize,
    //             sliceElementSize,
    //           );
    //         }
    //       }
    //     } else if (isCube) {
    //       for (let z = 0; z < this.depth; z++) {
    //         const face_target = GL.TEXTURE_CUBE_MAP_POSITIVE_X + (z % 6);
    //         if (isCompressed) {
    //           gl.compressedTexSubImage2D(
    //             face_target,
    //             i,
    //             0,
    //             0,
    //             w,
    //             h,
    //             gl_format,
    //             levelData,
    //             z * sliceElementSize,
    //             sliceElementSize,
    //           );
    //         } else {
    //           gl.texSubImage2D(
    //             face_target,
    //             i,
    //             0,
    //             0,
    //             w,
    //             h,
    //             gl_format,
    //             gl_type,
    //             levelData,
    //             z * sliceElementSize,
    //           );
    //         }
    //       }
    //     } else if (is3D) {
    //       if (isWebGL2(gl)) {
    //         if (isCompressed) {
    //           gl.compressedTexSubImage3D(this.gl_target, i, 0, 0, 0, w, h, d, gl_format, levelData);
    //         } else {
    //           gl.texSubImage3D(this.gl_target, i, 0, 0, 0, w, h, d, gl_format, gl_type, levelData);
    //         }
    //       }
    //     } else {
    //       if (isCompressed) {
    //         gl.compressedTexSubImage2D(this.gl_target, i, 0, 0, w, h, gl_format, levelData);
    //       } else {
    //         // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
    //         gl.texSubImage2D(this.gl_target, i, 0, 0, w, h, gl_format, gl_type, levelData);
    //       }
    //     }
    //   }

    //   w = Math.max((w / 2) | 0, 1);
    //   h = Math.max((h / 2) | 0, 1);
    // }
  }

  destroy() {
    super.destroy();
    this.device.gl.deleteTexture(getPlatformTexture(this));
  }

  private clampNumLevels(descriptor: TextureDescriptor): number {
    if (descriptor.dimension === TextureDimension.n2DArray && descriptor.depth > 1) {
      const typeFlags: FormatTypeFlags = getFormatTypeFlags(descriptor.pixelFormat);
      if (typeFlags === FormatTypeFlags.BC1) {
        // Chrome/ANGLE seems to have issues with compressed miplevels of size 1/2, so clamp before they arrive...
        // https://bugs.chromium.org/p/angleproject/issues/detail?id=4056
        let w = descriptor.width,
          h = descriptor.height;
        for (let i = 0; i < descriptor.numLevels; i++) {
          if (w <= 2 || h <= 2) return i - 1;

          w = Math.max((w / 2) | 0, 1);
          h = Math.max((h / 2) | 0, 1);
        }
      }
    }

    return descriptor.numLevels;
  }

  private preprocessImage() {
    const gl = this.device.gl;
    if (this.pixelStore) {
      if (this.pixelStore.unpackFlipY) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      }
      if (this.pixelStore.packAlignment) {
        gl.pixelStorei(gl.PACK_ALIGNMENT, this.pixelStore.packAlignment);
      }
      if (this.pixelStore.unpackAlignment) {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, this.pixelStore.unpackAlignment);
      }
    }
  }

  private generateMipmap(): this {
    const gl = this.device.gl;
    if (this.isNPOT()) {
      return this;
    }

    // if (this.gl_texture && this.gl_target) {
    //   gl.bindTexture(this.gl_target, this.gl_texture);
    //   gl.generateMipmap(this.gl_target);
    //   gl.bindTexture(this.gl_target, null);
    // }
    return this;
  }

  private isNPOT(): boolean {
    const gl = this.device.gl;
    if (isWebGL2(gl)) {
      // NPOT restriction is only for WebGL1
      return false;
    }
    return !isPowerOfTwo(this.width) || !isPowerOfTwo(this.height);
  }
}
