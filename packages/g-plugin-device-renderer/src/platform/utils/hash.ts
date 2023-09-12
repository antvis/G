import { isNil } from '@antv/util';
import type { Format } from '../format';
import type {
  AttachmentState,
  BindingLayoutSamplerDescriptor,
  BindingsDescriptor,
  BufferBinding,
  ChannelBlendState,
  InputLayoutBufferDescriptor,
  InputLayoutDescriptor,
  MegaStateDescriptor,
  Program,
  RenderPipelineDescriptor,
  SamplerBinding,
  SamplerDescriptor,
  VertexAttributeDescriptor,
} from '../interfaces';
import { colorEqual } from './color';
import { copyMegaState } from './states';

type EqualFunc<K> = (a: K, b: K) => boolean;
export function arrayEqual<T>(a: T[], b: T[], e: EqualFunc<T>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!e(a[i], b[i])) return false;
  return true;
}

type CopyFunc<T> = (a: T) => T;
export function arrayCopy<T>(a: T[], copyFunc: CopyFunc<T>): T[] {
  const b = Array(a.length);
  for (let i = 0; i < a.length; i++) b[i] = copyFunc(a[i]);
  return b;
}

function bufferBindingEquals(
  a: Readonly<BufferBinding>,
  b: Readonly<BufferBinding>,
): boolean {
  return a.buffer === b.buffer && a.byteLength === b.byteLength;
}

function samplerBindingEquals(
  a: Readonly<SamplerBinding | null>,
  b: Readonly<SamplerBinding | null>,
): boolean {
  if (a === null) return b === null;
  if (b === null) return false;
  return a.sampler === b.sampler && a.texture === b.texture;
}

export function bindingsDescriptorEquals(
  a: Readonly<BindingsDescriptor>,
  b: Readonly<BindingsDescriptor>,
): boolean {
  if (a.samplerBindings.length !== b.samplerBindings.length) return false;
  if (!arrayEqual(a.samplerBindings, b.samplerBindings, samplerBindingEquals))
    return false;
  if (
    !arrayEqual(
      a.uniformBufferBindings,
      b.uniformBufferBindings,
      bufferBindingEquals,
    )
  )
    return false;
  return true;
}

function channelBlendStateEquals(
  a: Readonly<ChannelBlendState>,
  b: Readonly<ChannelBlendState>,
): boolean {
  return (
    a.blendMode == b.blendMode &&
    a.blendSrcFactor === b.blendSrcFactor &&
    a.blendDstFactor === b.blendDstFactor
  );
}

function attachmentStateEquals(
  a: Readonly<AttachmentState>,
  b: Readonly<AttachmentState>,
): boolean {
  if (!channelBlendStateEquals(a.rgbBlendState, b.rgbBlendState)) return false;
  if (!channelBlendStateEquals(a.alphaBlendState, b.alphaBlendState))
    return false;
  if (a.channelWriteMask !== b.channelWriteMask) return false;
  return true;
}

function megaStateDescriptorEquals(
  a: MegaStateDescriptor,
  b: MegaStateDescriptor,
): boolean {
  if (
    !arrayEqual(a.attachmentsState, b.attachmentsState, attachmentStateEquals)
  )
    return false;
  if (!colorEqual(a.blendConstant, b.blendConstant)) return false;

  return (
    a.depthCompare === b.depthCompare &&
    a.depthWrite === b.depthWrite &&
    a.stencilCompare === b.stencilCompare &&
    a.stencilWrite === b.stencilWrite &&
    a.stencilPassOp === b.stencilPassOp &&
    a.stencilRef === b.stencilRef &&
    a.cullMode === b.cullMode &&
    a.frontFace === b.frontFace &&
    a.polygonOffset === b.polygonOffset
  );
}

function programEquals(a: Readonly<Program>, b: Readonly<Program>): boolean {
  return a.id === b.id;
}

function formatEquals(a: Format | null, b: Format | null): boolean {
  return a === b;
}

export function renderPipelineDescriptorEquals(
  a: Readonly<RenderPipelineDescriptor>,
  b: Readonly<RenderPipelineDescriptor>,
): boolean {
  if (a.topology !== b.topology) return false;
  if (a.inputLayout !== b.inputLayout) return false;
  if (a.sampleCount !== b.sampleCount) return false;
  if (!megaStateDescriptorEquals(a.megaStateDescriptor, b.megaStateDescriptor))
    return false;
  if (!programEquals(a.program, b.program)) return false;
  return false;
  if (
    !arrayEqual(
      a.colorAttachmentFormats,
      b.colorAttachmentFormats,
      formatEquals,
    )
  )
    return false;
  if (a.depthStencilAttachmentFormat !== b.depthStencilAttachmentFormat)
    return false;
  return true;
}

export function vertexAttributeDescriptorEquals(
  a: Readonly<VertexAttributeDescriptor>,
  b: Readonly<VertexAttributeDescriptor>,
): boolean {
  return (
    a.bufferIndex === b.bufferIndex &&
    a.bufferByteOffset === b.bufferByteOffset &&
    a.location === b.location &&
    a.format === b.format &&
    a.divisor === b.divisor
  );
}

export function inputLayoutBufferDescriptorEquals(
  a: Readonly<InputLayoutBufferDescriptor | null>,
  b: Readonly<InputLayoutBufferDescriptor | null>,
): boolean {
  if (isNil(a)) return isNil(b);
  if (isNil(b)) return false;
  return a.byteStride === b.byteStride && a.stepMode === b.stepMode;
}

export function inputLayoutDescriptorEquals(
  a: Readonly<InputLayoutDescriptor>,
  b: Readonly<InputLayoutDescriptor>,
): boolean {
  if (a.indexBufferFormat !== b.indexBufferFormat) return false;
  if (
    !arrayEqual(
      a.vertexBufferDescriptors,
      b.vertexBufferDescriptors,
      inputLayoutBufferDescriptorEquals,
    )
  )
    return false;
  if (
    !arrayEqual(
      a.vertexAttributeDescriptors,
      b.vertexAttributeDescriptors,
      vertexAttributeDescriptorEquals,
    )
  )
    return false;
  if (!programEquals(a.program, b.program)) return false;
  return true;
}

export function samplerDescriptorEquals(
  a: Readonly<SamplerDescriptor>,
  b: Readonly<SamplerDescriptor>,
): boolean {
  return (
    a.wrapS === b.wrapS &&
    a.wrapT === b.wrapT &&
    a.minFilter === b.minFilter &&
    a.magFilter === b.magFilter &&
    a.mipFilter === b.mipFilter &&
    a.minLOD === b.minLOD &&
    a.maxLOD === b.maxLOD &&
    a.maxAnisotropy === b.maxAnisotropy &&
    a.compareMode === b.compareMode
  );
}

export function samplerBindingCopy(
  a: Readonly<SamplerBinding>,
): SamplerBinding {
  const sampler = a.sampler;
  const texture = a.texture;
  return { sampler, texture };
}

export function samplerBindingNew(): SamplerBinding {
  return { sampler: null, texture: null };
}

export function bufferBindingCopy(a: Readonly<BufferBinding>): BufferBinding {
  const buffer = a.buffer;
  const byteLength = a.byteLength;
  return { buffer, byteLength };
}

export function bindingsDescriptorCopy(
  a: Readonly<BindingsDescriptor>,
): BindingsDescriptor {
  const samplerBindings = arrayCopy(a.samplerBindings, samplerBindingCopy);
  const uniformBufferBindings = arrayCopy(
    a.uniformBufferBindings,
    bufferBindingCopy,
  );
  return {
    samplerBindings,
    uniformBufferBindings,
    pipeline: a.pipeline,
  };
}

export function bindingLayoutSamplerDescriptorCopy(
  a: Readonly<BindingLayoutSamplerDescriptor>,
): BindingLayoutSamplerDescriptor {
  const dimension = a.dimension,
    formatKind = a.formatKind;
  return { dimension, formatKind };
}

export function renderPipelineDescriptorCopy(
  a: Readonly<RenderPipelineDescriptor>,
): RenderPipelineDescriptor {
  const inputLayout = a.inputLayout;
  const program = a.program;
  const topology = a.topology;
  const megaStateDescriptor = copyMegaState(a.megaStateDescriptor);
  const colorAttachmentFormats = a.colorAttachmentFormats.slice();
  const depthStencilAttachmentFormat = a.depthStencilAttachmentFormat;
  const sampleCount = a.sampleCount;
  return {
    inputLayout,
    megaStateDescriptor,
    program,
    topology,
    colorAttachmentFormats,
    depthStencilAttachmentFormat,
    sampleCount,
  };
}

export function vertexAttributeDescriptorCopy(
  a: Readonly<VertexAttributeDescriptor>,
): VertexAttributeDescriptor {
  const location = a.location;
  const format = a.format;
  const bufferIndex = a.bufferIndex;
  const bufferByteOffset = a.bufferByteOffset;
  const divisor = a.divisor;
  return {
    location,
    format,
    bufferIndex,
    bufferByteOffset,
    divisor,
  };
}

export function inputLayoutBufferDescriptorCopy(
  a: Readonly<InputLayoutBufferDescriptor | null>,
): InputLayoutBufferDescriptor | null {
  if (!isNil(a)) {
    const byteStride = a.byteStride;
    const stepMode = a.stepMode;
    return { byteStride, stepMode };
  } else {
    return a;
  }
}

export function inputLayoutDescriptorCopy(
  a: Readonly<InputLayoutDescriptor>,
): InputLayoutDescriptor {
  const vertexAttributeDescriptors = arrayCopy(
    a.vertexAttributeDescriptors,
    vertexAttributeDescriptorCopy,
  );
  const vertexBufferDescriptors = arrayCopy(
    a.vertexBufferDescriptors,
    inputLayoutBufferDescriptorCopy,
  );
  const indexBufferFormat = a.indexBufferFormat;
  const program = a.program;
  return {
    vertexAttributeDescriptors,
    vertexBufferDescriptors,
    indexBufferFormat,
    program,
  };
}
