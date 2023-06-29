import { GPUTextureUsage } from './constants';
import type {
  Buffer,
  Sampler,
  MegaStateDescriptor,
  AttachmentState,
  ChannelBlendState,
  QueryPool,
  BindingLayoutSamplerDescriptor,
} from '@antv/g-plugin-device-renderer';
import {
  BufferUsage,
  WrapMode,
  TexFilterMode,
  MipFilterMode,
  TextureDimension,
  PrimitiveTopology,
  CullMode,
  FrontFaceMode,
  BlendFactor,
  BlendMode,
  CompareMode,
  VertexBufferFrequency,
  TextureUsage,
  QueryPoolType,
  SamplerFormatKind,
  align,
  Format,
  FormatTypeFlags,
  getFormatByteSize,
  getFormatTypeFlags,
} from '@antv/g-plugin-device-renderer';
import type { Buffer_WebGPU } from './Buffer';
import type { Sampler_WebGPU } from './Sampler';
import type { QueryPool_WebGPU } from './QueryPool';

export function translateTextureUsage(
  usage: TextureUsage,
): GPUTextureUsageFlags {
  let gpuUsage: GPUTextureUsageFlags = 0;

  if (usage & TextureUsage.Sampled)
    gpuUsage |= GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
  if (usage & TextureUsage.RenderTarget)
    gpuUsage |=
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST;

  return gpuUsage;
}

export function translateTextureFormat(format: Format): GPUTextureFormat {
  if (format === Format.U8_R_NORM) return 'r8unorm';
  else if (format === Format.U8_RG_NORM) return 'rg8unorm';
  else if (format === Format.U8_RGBA_RT) return 'bgra8unorm';
  else if (format === Format.U8_RGBA_RT_SRGB) return 'bgra8unorm-srgb';
  else if (format === Format.U8_RGBA_NORM) return 'rgba8unorm';
  else if (format === Format.U8_RGBA_SRGB) return 'rgba8unorm-srgb';
  else if (format === Format.S8_R_NORM) return 'r8snorm';
  else if (format === Format.S8_RG_NORM) return 'rg8snorm';
  else if (format === Format.S8_RGBA_NORM) return 'rgba8snorm';
  else if (format === Format.U32_R) return 'r32uint';
  else if (format === Format.F16_RGBA) return 'rgba16float';
  else if (format === Format.F32_RGBA) return 'rgba32float';
  else if (format === Format.D24) return 'depth24plus';
  else if (format === Format.D24_S8) return 'depth24plus-stencil8';
  else if (format === Format.D32F) return 'depth32float';
  else if (format === Format.D32F_S8) return 'depth32float-stencil8';
  else if (format === Format.BC1) return 'bc1-rgba-unorm';
  else if (format === Format.BC1_SRGB) return 'bc1-rgba-unorm-srgb';
  else if (format === Format.BC2) return 'bc2-rgba-unorm';
  else if (format === Format.BC2_SRGB) return 'bc2-rgba-unorm-srgb';
  else if (format === Format.BC3) return 'bc3-rgba-unorm';
  else if (format === Format.BC3_SRGB) return 'bc3-rgba-unorm-srgb';
  else if (format === Format.BC4_SNORM) return 'bc4-r-snorm';
  else if (format === Format.BC4_UNORM) return 'bc4-r-unorm';
  else if (format === Format.BC5_SNORM) return 'bc5-rg-snorm';
  else if (format === Format.BC5_UNORM) return 'bc5-rg-unorm';
  else throw 'whoops';
}

export function translateTextureDimension(
  dimension: TextureDimension,
): GPUTextureDimension {
  if (dimension === TextureDimension.n2D) return '2d';
  else if (dimension === TextureDimension.Cube) return '2d';
  else if (dimension === TextureDimension.n2DArray) return '2d';
  else if (dimension === TextureDimension.n3D) return '3d';
  else throw new Error('whoops');
}

export function translateBufferUsage(usage_: BufferUsage): GPUBufferUsageFlags {
  let usage = 0;
  if (usage_ & BufferUsage.INDEX) usage |= GPUBufferUsage.INDEX;
  if (usage_ & BufferUsage.VERTEX) usage |= GPUBufferUsage.VERTEX;
  if (usage_ & BufferUsage.UNIFORM) usage |= GPUBufferUsage.UNIFORM;
  if (usage_ & BufferUsage.STORAGE) usage |= GPUBufferUsage.STORAGE;
  if (usage_ & BufferUsage.COPY_SRC) usage |= GPUBufferUsage.COPY_SRC;
  usage |= GPUBufferUsage.COPY_DST;
  return usage;
}

export function translateWrapMode(wrapMode: WrapMode): GPUAddressMode {
  if (wrapMode === WrapMode.Clamp) return 'clamp-to-edge';
  else if (wrapMode === WrapMode.Repeat) return 'repeat';
  else if (wrapMode === WrapMode.Mirror) return 'mirror-repeat';
  else throw new Error('whoops');
}

export function translateMinMagFilter(texFilter: TexFilterMode): GPUFilterMode {
  if (texFilter === TexFilterMode.Bilinear) return 'linear';
  else if (texFilter === TexFilterMode.Point) return 'nearest';
  else throw new Error('whoops');
}

export function translateMipFilter(mipFilter: MipFilterMode): GPUFilterMode {
  if (mipFilter === MipFilterMode.Linear) return 'linear';
  else if (mipFilter === MipFilterMode.Nearest) return 'nearest';
  else if (mipFilter === MipFilterMode.NoMip) return 'nearest';
  else throw new Error('whoops');
}

function translateSampleType(type: SamplerFormatKind): GPUTextureSampleType {
  if (type === SamplerFormatKind.Float) return 'float';
  else if (type === SamplerFormatKind.Depth) return 'depth';
  else throw new Error('whoops');
}

export function translateBindGroupSamplerBinding(
  sampler: BindingLayoutSamplerDescriptor,
): GPUSamplerBindingLayout {
  if (sampler.formatKind === SamplerFormatKind.Depth && sampler.comparison) {
    return { type: 'comparison' };
  } else if (sampler.formatKind === SamplerFormatKind.Float) {
    return { type: 'filtering' };
  } else {
    return { type: 'non-filtering' };
  }
}

function translateViewDimension(
  dimension: TextureDimension,
): GPUTextureViewDimension {
  if (dimension === TextureDimension.n2D) return '2d';
  else if (dimension === TextureDimension.n2DArray) return '2d-array';
  else if (dimension === TextureDimension.n3D) return '3d';
  else if (dimension === TextureDimension.Cube) return 'cube';
  else throw new Error('whoops');
}

export function translateBindGroupTextureBinding(
  sampler: BindingLayoutSamplerDescriptor,
): GPUTextureBindingLayout {
  return {
    sampleType: translateSampleType(sampler.formatKind),
    viewDimension: translateViewDimension(sampler.dimension),
  };
}

export function getPlatformBuffer(buffer_: Buffer): GPUBuffer {
  const buffer = buffer_ as Buffer_WebGPU;
  return buffer.gpuBuffer;
}

export function getPlatformSampler(sampler_: Sampler): GPUSampler {
  const sampler = sampler_ as Sampler_WebGPU;
  return sampler.gpuSampler;
}

export function getPlatformQuerySet(queryPool_: QueryPool): GPUQuerySet {
  const queryPool = queryPool_ as QueryPool_WebGPU;
  return queryPool.querySet;
}

export function translateQueryPoolType(type: QueryPoolType): GPUQueryType {
  if (type === QueryPoolType.OcclusionConservative) return 'occlusion';
  else throw new Error('whoops');
}

// @see https://www.w3.org/TR/webgpu/#primitive-state
export function translateTopology(
  topology: PrimitiveTopology,
): GPUPrimitiveTopology {
  switch (topology) {
    case PrimitiveTopology.Triangles:
      return 'triangle-list';
    case PrimitiveTopology.Points:
      return 'point-list';
    case PrimitiveTopology.TriangleStrip:
      return 'triangle-strip';
    case PrimitiveTopology.Lines:
      return 'line-list';
    case PrimitiveTopology.LineStrip:
      return 'line-strip';
    default:
      throw new Error('Unknown primitive topology mode');
  }
}

export function translateCullMode(cullMode: CullMode): GPUCullMode {
  if (cullMode === CullMode.None) return 'none';
  else if (cullMode === CullMode.Front) return 'front';
  else if (cullMode === CullMode.Back) return 'back';
  else throw new Error('whoops');
}

export function translateFrontFace(frontFaceMode: FrontFaceMode): GPUFrontFace {
  if (frontFaceMode === FrontFaceMode.CCW) return 'ccw';
  else if (frontFaceMode === FrontFaceMode.CW) return 'cw';
  else throw new Error('whoops');
}

export function translatePrimitiveState(
  topology: PrimitiveTopology,
  megaStateDescriptor: MegaStateDescriptor,
): GPUPrimitiveState {
  return {
    topology: translateTopology(topology),
    cullMode: translateCullMode(megaStateDescriptor.cullMode),
    frontFace: translateFrontFace(megaStateDescriptor.frontFace),
  };
}

export function translateBlendFactor(factor: BlendFactor): GPUBlendFactor {
  if (factor === BlendFactor.Zero) return 'zero';
  else if (factor === BlendFactor.One) return 'one';
  else if (factor === BlendFactor.Src) return 'src';
  else if (factor === BlendFactor.OneMinusSrc) return 'one-minus-src';
  else if (factor === BlendFactor.Dst) return 'dst';
  else if (factor === BlendFactor.OneMinusDst) return 'one-minus-dst';
  else if (factor === BlendFactor.SrcAlpha) return 'src-alpha';
  else if (factor === BlendFactor.OneMinusSrcAlpha)
    return 'one-minus-src-alpha';
  else if (factor === BlendFactor.DstAlpha) return 'dst-alpha';
  else if (factor === BlendFactor.OneMinusDstAlpha)
    return 'one-minus-dst-alpha';
  else throw new Error('whoops');
}

export function translateBlendMode(mode: BlendMode): GPUBlendOperation {
  if (mode === BlendMode.Add) return 'add';
  else if (mode === BlendMode.Subtract) return 'subtract';
  else if (mode === BlendMode.ReverseSubtract) return 'reverse-subtract';
  else throw new Error('whoops');
}

function translateBlendComponent(ch: ChannelBlendState): GPUBlendComponent {
  return {
    operation: translateBlendMode(ch.blendMode),
    srcFactor: translateBlendFactor(ch.blendSrcFactor),
    dstFactor: translateBlendFactor(ch.blendDstFactor),
  };
}

function blendComponentIsNil(ch: ChannelBlendState): boolean {
  return (
    ch.blendMode === BlendMode.Add &&
    ch.blendSrcFactor === BlendFactor.One &&
    ch.blendDstFactor === BlendFactor.Zero
  );
}

function translateBlendState(
  attachmentState: AttachmentState,
): GPUBlendState | undefined {
  if (
    blendComponentIsNil(attachmentState.rgbBlendState) &&
    blendComponentIsNil(attachmentState.alphaBlendState)
  ) {
    return undefined;
  } else {
    return {
      color: translateBlendComponent(attachmentState.rgbBlendState),
      alpha: translateBlendComponent(attachmentState.alphaBlendState),
    };
  }
}

export function translateColorState(
  attachmentState: AttachmentState,
  format: Format,
): GPUColorTargetState {
  return {
    format: translateTextureFormat(format),
    blend: translateBlendState(attachmentState),
    writeMask: attachmentState.channelWriteMask,
  };
}

export function translateTargets(
  colorAttachmentFormats: (Format | null)[],
  megaStateDescriptor: MegaStateDescriptor,
): GPUColorTargetState[] {
  return megaStateDescriptor.attachmentsState!.map((attachmentState, i) => {
    return translateColorState(attachmentState, colorAttachmentFormats[i]!);
  });
}

export function translateCompareMode(
  compareMode: CompareMode,
): GPUCompareFunction {
  if (compareMode === CompareMode.Never) return 'never';
  else if (compareMode === CompareMode.Less) return 'less';
  else if (compareMode === CompareMode.Equal) return 'equal';
  else if (compareMode === CompareMode.LessEqual) return 'less-equal';
  else if (compareMode === CompareMode.Greater) return 'greater';
  else if (compareMode === CompareMode.NotEqual) return 'not-equal';
  else if (compareMode === CompareMode.GreaterEqual) return 'greater-equal';
  else if (compareMode === CompareMode.Always) return 'always';
  else throw new Error('whoops');
}

export function translateDepthStencilState(
  format: Format | null,
  megaStateDescriptor: MegaStateDescriptor,
): GPUDepthStencilState | undefined {
  if (format === null) return undefined;

  return {
    format: translateTextureFormat(format),
    depthWriteEnabled: megaStateDescriptor.depthWrite,
    depthCompare: translateCompareMode(megaStateDescriptor.depthCompare),
    depthBias: megaStateDescriptor.polygonOffset ? 1 : 0,
    depthBiasSlopeScale: megaStateDescriptor.polygonOffset ? 1 : 0,
  };
}

export function translateIndexFormat(
  format: Format | null,
): GPUIndexFormat | undefined {
  if (format === null) return undefined;
  else if (format === Format.U16_R) return 'uint16';
  else if (format === Format.U32_R) return 'uint32';
  else throw new Error('whoops');
}

export function translateVertexBufferFrequency(
  frequency: VertexBufferFrequency,
): GPUVertexStepMode {
  if (frequency === VertexBufferFrequency.PerVertex) return 'vertex';
  else if (frequency === VertexBufferFrequency.PerInstance) return 'instance';
  else throw new Error('whoops');
}

export function translateVertexFormat(format: Format): GPUVertexFormat {
  if (format === Format.U8_R) return 'uint8x2';
  else if (format === Format.U8_RG) return 'uint8x2';
  else if (format === Format.U8_RGB) return 'uint8x4';
  else if (format === Format.U8_RGBA) return 'uint8x4';
  else if (format === Format.U8_RG_NORM) return 'unorm8x2';
  else if (format === Format.U8_RGBA_NORM) return 'unorm8x4';
  else if (format === Format.S8_RGB_NORM) return 'snorm8x4';
  else if (format === Format.S8_RGBA_NORM) return 'snorm8x4';
  else if (format === Format.U16_RG_NORM) return 'unorm16x2';
  else if (format === Format.U16_RGBA_NORM) return 'unorm16x4';
  else if (format === Format.S16_RG_NORM) return 'snorm16x2';
  else if (format === Format.S16_RGBA_NORM) return 'snorm16x4';
  else if (format === Format.S16_RG) return 'uint16x2';
  else if (format === Format.F16_RG) return 'float16x2';
  else if (format === Format.F16_RGBA) return 'float16x4';
  else if (format === Format.F32_R) return 'float32';
  else if (format === Format.F32_RG) return 'float32x2';
  else if (format === Format.F32_RGB) return 'float32x3';
  else if (format === Format.F32_RGBA) return 'float32x4';
  else throw 'whoops';
}

export function isFormatTextureCompressionBC(format: Format): boolean {
  const formatTypeFlags = getFormatTypeFlags(format);

  switch (formatTypeFlags) {
    case FormatTypeFlags.BC1:
    case FormatTypeFlags.BC2:
    case FormatTypeFlags.BC3:
    case FormatTypeFlags.BC4_SNORM:
    case FormatTypeFlags.BC4_UNORM:
    case FormatTypeFlags.BC5_SNORM:
    case FormatTypeFlags.BC5_UNORM:
      return true;
    default:
      return false;
  }
}

export function getFormatByteSizePerBlock(format: Format): number {
  const formatTypeFlags = getFormatTypeFlags(format);

  switch (formatTypeFlags) {
    case FormatTypeFlags.BC1:
    case FormatTypeFlags.BC4_SNORM:
    case FormatTypeFlags.BC4_UNORM:
      return 8;
    case FormatTypeFlags.BC2:
    case FormatTypeFlags.BC3:
    case FormatTypeFlags.BC5_SNORM:
    case FormatTypeFlags.BC5_UNORM:
      return 16;
    default:
      return getFormatByteSize(format);
  }
}

export function getFormatBlockSize(format: Format): number {
  const formatTypeFlags = getFormatTypeFlags(format);

  switch (formatTypeFlags) {
    case FormatTypeFlags.BC1:
    case FormatTypeFlags.BC2:
    case FormatTypeFlags.BC3:
    case FormatTypeFlags.BC4_SNORM:
    case FormatTypeFlags.BC4_UNORM:
    case FormatTypeFlags.BC5_SNORM:
    case FormatTypeFlags.BC5_UNORM:
      return 4;
    default:
      return 1;
  }
}

export function translateImageLayout(
  layout: GPUImageDataLayout,
  format: Format,
  mipWidth: number,
  mipHeight: number,
): void {
  const blockSize = getFormatBlockSize(format);

  const numBlocksX = align(mipWidth, blockSize);
  const numBlocksY = align(mipHeight, blockSize);

  layout.bytesPerRow = numBlocksX * getFormatByteSizePerBlock(format);
  layout.rowsPerImage = numBlocksY;
}

export function allocateAndCopyTypedBuffer(
  type: Format,
  sizeOrDstBuffer: number | ArrayBuffer,
  sizeInBytes = false,
  copyBuffer?: ArrayBuffer,
): ArrayBufferView {
  switch (type) {
    case Format.S8_R:
    case Format.S8_R_NORM:
    case Format.S8_RG_NORM:
    case Format.S8_RGB_NORM:
    case Format.S8_RGBA_NORM: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Int8Array(sizeOrDstBuffer)
          : new Int8Array(sizeOrDstBuffer);
      if (copyBuffer) {
        buffer.set(new Int8Array(copyBuffer));
      }
      return buffer;
    }
    case Format.U8_R:
    case Format.U8_R_NORM:
    case Format.U8_RG:
    case Format.U8_RG_NORM:
    case Format.U8_RGB:
    case Format.U8_RGB_NORM:
    case Format.U8_RGB_SRGB:
    case Format.U8_RGBA:
    case Format.U8_RGBA_NORM:
    case Format.U8_RGBA_SRGB: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Uint8Array(sizeOrDstBuffer)
          : new Uint8Array(sizeOrDstBuffer);
      if (copyBuffer) {
        buffer.set(new Uint8Array(copyBuffer));
      }
      return buffer;
    }
    case Format.S16_R:
    case Format.S16_RG:
    case Format.S16_RG_NORM:
    case Format.S16_RGB_NORM:
    case Format.S16_RGBA:
    case Format.S16_RGBA_NORM: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Int16Array(sizeOrDstBuffer)
          : new Int16Array(sizeInBytes ? sizeOrDstBuffer / 2 : sizeOrDstBuffer);
      if (copyBuffer) {
        buffer.set(new Int16Array(copyBuffer));
      }
      return buffer;
    }
    case Format.U16_R:
    case Format.U16_RGB:
    case Format.U16_RGBA_5551:
    case Format.U16_RGBA_NORM:
    case Format.U16_RG_NORM:
    case Format.U16_R_NORM: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Uint16Array(sizeOrDstBuffer)
          : new Uint16Array(
              sizeInBytes ? sizeOrDstBuffer / 2 : sizeOrDstBuffer,
            );
      if (copyBuffer) {
        buffer.set(new Uint16Array(copyBuffer));
      }
      return buffer;
    }
    case Format.S32_R: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Int32Array(sizeOrDstBuffer)
          : new Int32Array(sizeInBytes ? sizeOrDstBuffer / 4 : sizeOrDstBuffer);
      if (copyBuffer) {
        buffer.set(new Int32Array(copyBuffer));
      }
      return buffer;
    }
    case Format.U32_R:
    case Format.U32_RG: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Uint32Array(sizeOrDstBuffer)
          : new Uint32Array(
              sizeInBytes ? sizeOrDstBuffer / 4 : sizeOrDstBuffer,
            );
      if (copyBuffer) {
        buffer.set(new Uint32Array(copyBuffer));
      }
      return buffer;
    }
    case Format.F32_R:
    case Format.F32_RG:
    case Format.F32_RGB:
    case Format.F32_RGBA: {
      const buffer =
        sizeOrDstBuffer instanceof ArrayBuffer
          ? new Float32Array(sizeOrDstBuffer)
          : new Float32Array(
              sizeInBytes ? sizeOrDstBuffer / 4 : sizeOrDstBuffer,
            );
      if (copyBuffer) {
        buffer.set(new Float32Array(copyBuffer));
      }
      return buffer;
    }
  }

  const buffer =
    sizeOrDstBuffer instanceof ArrayBuffer
      ? new Uint8Array(sizeOrDstBuffer)
      : new Uint8Array(sizeOrDstBuffer);
  if (copyBuffer) {
    buffer.set(new Uint8Array(copyBuffer));
  }
  return buffer;
}

/**
 * Converts a half float to a number
 * @param value half float to convert
 * @returns converted half float
 */
export function halfFloat2Number(value: number): number {
  const s = (value & 0x8000) >> 15;
  const e = (value & 0x7c00) >> 10;
  const f = value & 0x03ff;

  if (e === 0) {
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
  } else if (e == 0x1f) {
    return f ? NaN : (s ? -1 : 1) * Infinity;
  }

  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}
