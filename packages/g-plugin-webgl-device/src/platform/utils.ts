import {
  GL,
  FormatCompFlags,
  FormatFlags,
  FormatTypeFlags,
  getFormatCompFlags,
  getFormatFlags,
  getFormatTypeFlags,
  Format,
  BlendFactor,
  BlendMode,
  BufferFrequencyHint,
  BufferUsage,
  MipFilterMode,
  PrimitiveTopology,
  QueryPoolType,
  TexFilterMode,
  TextureDimension,
  WrapMode,
} from '@antv/g-plugin-device-renderer';
import type {
  Buffer,
  ChannelBlendState,
  Sampler,
  Texture,
} from '@antv/g-plugin-device-renderer';
import type { Buffer_GL } from './Buffer';
import type { Sampler_GL } from './Sampler';
import type { Texture_GL } from './Texture';

// @see https://github.com/visgl/luma.gl/blob/30a1039573576d73641de7c1ba222e8992eb526e/modules/gltools/src/utils/webgl-checks.ts#L22
export function isWebGL2(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
): gl is WebGL2RenderingContext {
  if (
    typeof WebGL2RenderingContext !== 'undefined' &&
    gl instanceof WebGL2RenderingContext
  ) {
    return true;
  }
  // Look for debug contexts, headless gl etc
  // @ts-ignore
  return Boolean(gl && gl._version === 2);
}

export function isTextureFormatCompressed(fmt: Format): boolean {
  const typeFlags: FormatTypeFlags = getFormatTypeFlags(fmt);
  switch (typeFlags) {
    case FormatTypeFlags.BC1:
    case FormatTypeFlags.BC2:
    case FormatTypeFlags.BC3:
    case FormatTypeFlags.BC4_UNORM:
    case FormatTypeFlags.BC4_SNORM:
    case FormatTypeFlags.BC5_UNORM:
    case FormatTypeFlags.BC5_SNORM:
      return true;
    default:
      return false;
  }
}

export function isFormatSizedInteger(fmt: Format): boolean {
  const flags = getFormatFlags(fmt);
  if (flags & FormatFlags.Normalized) return false;

  const typeFlags = getFormatTypeFlags(fmt);
  // Check for integer types.
  if (
    typeFlags === FormatTypeFlags.S8 ||
    typeFlags === FormatTypeFlags.S16 ||
    typeFlags === FormatTypeFlags.S32
  )
    return true;
  if (
    typeFlags === FormatTypeFlags.U8 ||
    typeFlags === FormatTypeFlags.U16 ||
    typeFlags === FormatTypeFlags.U32
  )
    return true;

  return false;
}

export function translateBufferHint(hint: BufferFrequencyHint): GLenum {
  switch (hint) {
    case BufferFrequencyHint.STATIC:
      return GL.STATIC_DRAW;
    case BufferFrequencyHint.DYNAMIC:
      return GL.DYNAMIC_DRAW;
  }
}

export function translateBufferUsageToTarget(usage: BufferUsage): GLenum {
  if (usage & BufferUsage.INDEX) {
    return GL.ELEMENT_ARRAY_BUFFER;
  } else if (usage & BufferUsage.VERTEX) {
    return GL.ARRAY_BUFFER;
  } else if (usage & BufferUsage.UNIFORM) {
    return GL.UNIFORM_BUFFER;
  }
}

export function translatePrimitiveTopology(
  topology: PrimitiveTopology,
): GLenum {
  switch (topology) {
    case PrimitiveTopology.TRIANGLES:
      return GL.TRIANGLES;
    case PrimitiveTopology.POINTS:
      return GL.POINTS;
    case PrimitiveTopology.TRIANGLE_STRIP:
      return GL.TRIANGLE_STRIP;
    case PrimitiveTopology.LINES:
      return GL.LINES;
    case PrimitiveTopology.LINE_STRIP:
      return GL.LINE_STRIP;
    default:
      throw new Error('Unknown primitive topology mode');
  }
}

function translateType(flags: FormatTypeFlags): GLenum {
  switch (flags) {
    case FormatTypeFlags.U8:
      return GL.UNSIGNED_BYTE;
    case FormatTypeFlags.U16:
      return GL.UNSIGNED_SHORT;
    case FormatTypeFlags.U32:
      return GL.UNSIGNED_INT;
    case FormatTypeFlags.S8:
      return GL.BYTE;
    case FormatTypeFlags.S16:
      return GL.SHORT;
    case FormatTypeFlags.S32:
      return GL.INT;
    case FormatTypeFlags.F16:
      return GL.HALF_FLOAT;
    case FormatTypeFlags.F32:
      return GL.FLOAT;
    default:
      throw new Error('whoops');
  }
}
function translateSize(flags: FormatCompFlags): number {
  switch (flags) {
    case FormatCompFlags.R:
      return 1;
    case FormatCompFlags.RG:
      return 2;
    case FormatCompFlags.RGB:
      return 3;
    case FormatCompFlags.RGBA:
      return 4;
    default:
      return 1;
  }
}
export function translateVertexFormat(fmt: Format): {
  size: number;
  type: GLenum;
  normalized: boolean;
} {
  const typeFlags = getFormatTypeFlags(fmt);
  const compFlags = getFormatCompFlags(fmt);
  const flags = getFormatFlags(fmt);

  const type = translateType(typeFlags);
  const size = translateSize(compFlags);
  const normalized = !!(flags & FormatFlags.Normalized);
  return { size, type, normalized };
}

export function translateIndexFormat(format: Format): GLenum {
  switch (format) {
    case Format.U8_R:
      return GL.UNSIGNED_BYTE;
    case Format.U16_R:
      return GL.UNSIGNED_SHORT;
    case Format.U32_R:
      return GL.UNSIGNED_INT;
    default:
      throw new Error('whoops');
  }
}

export function translateWrapMode(wrapMode: WrapMode): GLenum {
  switch (wrapMode) {
    case WrapMode.CLAMP:
      return GL.CLAMP_TO_EDGE;
    case WrapMode.REPEAT:
      return GL.REPEAT;
    case WrapMode.MIRROR:
      return GL.MIRRORED_REPEAT;
    default:
      throw new Error('whoops');
  }
}

export function translateFilterMode(
  filter: TexFilterMode,
  mipFilter: MipFilterMode,
): GLenum {
  if (mipFilter === MipFilterMode.LINEAR && filter === TexFilterMode.BILINEAR) {
    return GL.LINEAR_MIPMAP_LINEAR;
  }
  if (mipFilter === MipFilterMode.LINEAR && filter === TexFilterMode.POINT) {
    return GL.NEAREST_MIPMAP_LINEAR;
  }
  if (
    mipFilter === MipFilterMode.NEAREST &&
    filter === TexFilterMode.BILINEAR
  ) {
    return GL.LINEAR_MIPMAP_NEAREST;
  }
  if (mipFilter === MipFilterMode.NEAREST && filter === TexFilterMode.POINT) {
    return GL.NEAREST_MIPMAP_NEAREST;
  }
  if (mipFilter === MipFilterMode.NO_MIP && filter === TexFilterMode.BILINEAR) {
    return GL.LINEAR;
  }
  if (mipFilter === MipFilterMode.NO_MIP && filter === TexFilterMode.POINT) {
    return GL.NEAREST;
  }
  throw new Error('Unknown texture filter mode');
}

export function getPlatformBuffer(
  buffer_: Buffer,
  byteOffset = 0,
): WebGLBuffer {
  const buffer = buffer_ as Buffer_GL;
  return buffer.gl_buffer_pages[(byteOffset / buffer.pageByteSize) | 0];
}

export function getPlatformTexture(texture_: Texture): WebGLTexture {
  const texture = texture_ as Texture_GL;
  return texture.gl_texture;
}

export function getPlatformSampler(sampler_: Sampler): WebGLSampler {
  const sampler = sampler_ as Sampler_GL;
  return sampler.gl_sampler;
}

export function assignPlatformName(o: any, name: string): void {
  o.name = name;
  o.__SPECTOR_Metadata = { name };
}

export function findall(haystack: string, needle: RegExp): RegExpExecArray[] {
  const results: RegExpExecArray[] = [];
  while (true) {
    const result = needle.exec(haystack);
    if (!result) break;
    results.push(result);
  }
  return results;
}

export function isBlendStateNone(blendState: ChannelBlendState): boolean {
  return (
    blendState.blendMode == BlendMode.ADD &&
    blendState.blendSrcFactor == BlendFactor.ONE &&
    blendState.blendDstFactor === BlendFactor.ZERO
  );
}

export function translateQueryPoolType(type: QueryPoolType): GLenum {
  switch (type) {
    case QueryPoolType.OcclusionConservative:
      return GL.ANY_SAMPLES_PASSED_CONSERVATIVE;
    default:
      throw new Error('whoops');
  }
}

export function translateTextureDimension(dimension: TextureDimension): GLenum {
  if (dimension === TextureDimension.TEXTURE_2D) return GL.TEXTURE_2D;
  else if (dimension === TextureDimension.TEXTURE_2D_ARRAY)
    return GL.TEXTURE_2D_ARRAY;
  else if (dimension === TextureDimension.TEXTURE_CUBE_MAP)
    return GL.TEXTURE_CUBE_MAP;
  else if (dimension === TextureDimension.TEXTURE_3D) return GL.TEXTURE_3D;
  else throw new Error('whoops');
}

export function isBlockCompressSized(
  w: number,
  h: number,
  bw: number,
  bh: number,
): boolean {
  if (w % bw !== 0) return false;
  if (h % bh !== 0) return false;
  return true;
}
