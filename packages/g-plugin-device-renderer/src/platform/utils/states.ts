import type {
  AttachmentState,
  BindingLayoutSamplerDescriptor,
  ChannelBlendState,
  MegaStateDescriptor,
} from '../interfaces';
import {
  BlendFactor,
  BlendMode,
  ChannelWriteMask,
  CompareMode,
  CullMode,
  FrontFaceMode,
  SamplerFormatKind,
  StencilOp,
  TextureDimension,
} from '../interfaces';
import { colorCopy, colorNewCopy, TransparentBlack } from './color';
// import { reverseDepthForCompareMode } from './depth';

export function isPowerOfTwo(n: number): boolean {
  return n && (n & (n - 1)) === 0;
}

export function fallbackUndefined<T>(v: T | null | undefined, fallback: T): T {
  return v !== null && v !== undefined ? v : fallback;
}

export function nullify<T>(v: T | undefined | null): T | null {
  return v === undefined ? null : v;
}

export function fillArray<T>(L: T[], n: number, v: T): void {
  L.length = n;
  L.fill(v);
}

export function align(n: number, multiple: number): number {
  const mask = multiple - 1;
  return (n + mask) & ~mask;
}

export function alignNonPowerOfTwo(n: number, multiple: number): number {
  return (((n + multiple - 1) / multiple) | 0) * multiple;
}

// @see https://github.com/d3/d3-array#bisectRight
export function bisectRight<T>(
  L: T[],
  e: T,
  compare: (a: T, b: T) => number,
): number {
  let lo = 0,
    hi = L.length;
  while (lo < hi) {
    const mid = lo + ((hi - lo) >>> 1);
    const cmp = compare(e, L[mid]);
    if (cmp < 0) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

export function spliceBisectRight<T>(
  L: T[],
  e: T,
  compare: (a: T, b: T) => number,
): void {
  const idx = bisectRight(L, e, compare);
  L.splice(idx, 0, e);
}

export function setBitFlagEnabled(
  v: number,
  mask: number,
  enabled: boolean,
): number {
  if (enabled) v |= mask;
  else v &= ~mask;
  return v;
}

export function nArray<T>(n: number, c: () => T): T[] {
  const d = new Array(n);
  for (let i = 0; i < n; i++) d[i] = c();
  return d;
}

export function prependLineNo(str: string, lineStart = 1) {
  const lines = str.split('\n');
  return lines
    .map((s, i) => `${leftPad('' + (lineStart + i), 4, ' ')}  ${s}`)
    .join('\n');
}

export function leftPad(S: string, spaces: number, ch = '0'): string {
  while (S.length < spaces) S = `${ch}${S}`;
  return S;
}

export function range(start: number, count: number): number[] {
  const L: number[] = [];
  for (let i = start; i < start + count; i++) L.push(i);
  return L;
}

function copyChannelBlendState(
  dst: ChannelBlendState,
  src: ChannelBlendState,
): void {
  dst.blendDstFactor = src.blendDstFactor;
  dst.blendSrcFactor = src.blendSrcFactor;
  dst.blendMode = src.blendMode;
}

export function copyAttachmentState(
  dst: AttachmentState | undefined,
  src: AttachmentState,
): AttachmentState {
  if (dst === undefined) {
    dst = {
      rgbBlendState: {} as ChannelBlendState,
      alphaBlendState: {} as ChannelBlendState,
      channelWriteMask: 0,
    };
  }

  copyChannelBlendState(dst.rgbBlendState, src.rgbBlendState);
  copyChannelBlendState(dst.alphaBlendState, src.alphaBlendState);
  dst.channelWriteMask = src.channelWriteMask;
  return dst;
}

function copyAttachmentsState(
  dst: AttachmentState[],
  src: AttachmentState[],
): void {
  if (dst.length !== src.length) dst.length = src.length;
  for (let i = 0; i < src.length; i++)
    dst[i] = copyAttachmentState(dst[i], src[i]);
}

export function setMegaStateFlags(
  dst: MegaStateDescriptor,
  src: Partial<MegaStateDescriptor>,
): void {
  if (src.attachmentsState !== undefined) {
    copyAttachmentsState(dst.attachmentsState, src.attachmentsState);
  }

  if (src.blendConstant !== undefined) {
    colorCopy(dst.blendConstant, src.blendConstant);
  }

  dst.depthCompare = fallbackUndefined(src.depthCompare, dst.depthCompare);
  dst.depthWrite = fallbackUndefined(src.depthWrite, dst.depthWrite);
  dst.stencilCompare = fallbackUndefined(
    src.stencilCompare,
    dst.stencilCompare,
  );
  dst.stencilWrite = fallbackUndefined(src.stencilWrite, dst.stencilWrite);
  dst.stencilPassOp = fallbackUndefined(src.stencilPassOp, dst.stencilPassOp);
  dst.stencilRef = fallbackUndefined(src.stencilRef, dst.stencilRef);
  dst.cullMode = fallbackUndefined(src.cullMode, dst.cullMode);
  dst.frontFace = fallbackUndefined(src.frontFace, dst.frontFace);
  dst.polygonOffset = fallbackUndefined(src.polygonOffset, dst.polygonOffset);
}

export function copyMegaState(src: MegaStateDescriptor): MegaStateDescriptor {
  const dst = Object.assign({}, src);
  // Copy fields that need copying.
  dst.attachmentsState = [];
  copyAttachmentsState(dst.attachmentsState, src.attachmentsState);
  dst.blendConstant = colorNewCopy(dst.blendConstant);
  return dst;
}

export interface AttachmentStateSimple {
  channelWriteMask: ChannelWriteMask;
  rgbBlendMode?: BlendMode;
  alphaBlendMode?: BlendMode;
  rgbBlendSrcFactor?: BlendFactor;
  alphaBlendSrcFactor?: BlendFactor;
  rgbBlendDstFactor?: BlendFactor;
  alphaBlendDstFactor?: BlendFactor;
}

export function copyAttachmentStateFromSimple(
  dst: AttachmentState,
  src: Partial<AttachmentStateSimple>,
): void {
  if (src.channelWriteMask !== undefined) {
    dst.channelWriteMask = src.channelWriteMask;
  }

  if (src.rgbBlendMode !== undefined) {
    dst.rgbBlendState.blendMode = src.rgbBlendMode;
  }

  if (src.alphaBlendMode !== undefined) {
    dst.alphaBlendState.blendMode = src.alphaBlendMode;
  }

  if (src.rgbBlendSrcFactor !== undefined) {
    dst.rgbBlendState.blendSrcFactor = src.rgbBlendSrcFactor;
  }
  if (src.alphaBlendSrcFactor !== undefined) {
    dst.alphaBlendState.blendSrcFactor = src.alphaBlendSrcFactor;
  }

  if (src.rgbBlendDstFactor !== undefined) {
    dst.rgbBlendState.blendDstFactor = src.rgbBlendDstFactor;
  }
  if (src.alphaBlendDstFactor !== undefined) {
    dst.alphaBlendState.blendDstFactor = src.alphaBlendDstFactor;
  }
}

const defaultBlendState: ChannelBlendState = {
  blendMode: BlendMode.Add,
  blendSrcFactor: BlendFactor.One,
  blendDstFactor: BlendFactor.Zero,
};

export const defaultMegaState: MegaStateDescriptor = {
  attachmentsState: [
    {
      channelWriteMask: ChannelWriteMask.RGB,
      rgbBlendState: defaultBlendState,
      alphaBlendState: defaultBlendState,
    },
  ],

  blendConstant: colorNewCopy(TransparentBlack),
  depthWrite: true,
  depthCompare: CompareMode.LessEqual,
  // depthCompare: reverseDepthForCompareMode(CompareMode.LessEqual),
  // stencilCompare: CompareMode.Never,
  stencilCompare: CompareMode.Always,
  stencilWrite: false,
  stencilPassOp: StencilOp.Keep,
  stencilRef: 0,
  cullMode: CullMode.None,
  frontFace: FrontFaceMode.CCW,
  polygonOffset: false,
};

export function makeMegaState(
  other: Partial<MegaStateDescriptor> | null = null,
  src: MegaStateDescriptor = defaultMegaState,
) {
  const dst = copyMegaState(src);
  if (other !== null) setMegaStateFlags(dst, other);
  return dst;
}

export const fullscreenMegaState = makeMegaState(
  { depthCompare: CompareMode.Always, depthWrite: false },
  defaultMegaState,
);

export function setAttachmentStateSimple(
  dst: Partial<MegaStateDescriptor>,
  simple: Partial<AttachmentStateSimple>,
): Partial<MegaStateDescriptor> {
  if (dst.attachmentsState === undefined) {
    dst.attachmentsState = [];
    copyAttachmentsState(
      dst.attachmentsState,
      defaultMegaState.attachmentsState,
    );
  }

  copyAttachmentStateFromSimple(dst.attachmentsState[0], simple);
  return dst;
}

export const defaultBindingLayoutSamplerDescriptor: BindingLayoutSamplerDescriptor =
  {
    formatKind: SamplerFormatKind.Float,
    dimension: TextureDimension.n2D,
  };
