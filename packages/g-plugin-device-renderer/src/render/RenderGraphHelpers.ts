import type { Color } from '@antv/g-device-api';
import {
  Format,
  colorNewFromRGBA,
  OpaqueBlack,
  OpaqueWhite,
} from '@antv/g-device-api';
// import { reverseDepthForClearValue } from '../platform/utils';
import { RGAttachmentSlot } from './interfaces';
import { RGRenderTargetDescription } from './RenderTargetDescription';

export function makeAttachmentClearDescriptor(
  clearColor: Readonly<Color> | 'load',
): GfxrAttachmentClearDescriptor {
  return {
    colorClearColor: clearColor,
    // depthClearValue: reverseDepthForClearValue(1.0),
    depthClearValue: 1,
    stencilClearValue: 0.0,
  };
}

export const standardFullClearRenderPassDescriptor =
  makeAttachmentClearDescriptor(colorNewFromRGBA(0.88, 0.88, 0.88, 1.0));
export const opaqueBlackFullClearRenderPassDescriptor =
  makeAttachmentClearDescriptor(OpaqueBlack);
export const opaqueWhiteFullClearRenderPassDescriptor =
  makeAttachmentClearDescriptor(OpaqueWhite);

export enum AntialiasingMode {
  None,
  FXAA,
  MSAAx4,
}

export interface RenderInput {
  backbufferWidth: number;
  backbufferHeight: number;
  antialiasingMode: AntialiasingMode;
}

function selectFormatSimple(slot: RGAttachmentSlot): Format {
  if (slot === RGAttachmentSlot.Color0) {
    return Format.U8_RGBA_RT;
  }
  if (slot === RGAttachmentSlot.DepthStencil) {
    return Format.D24_S8;
  }
  throw new Error('whoops');
}

function selectSampleCount(renderInput: RenderInput): number {
  if (renderInput.antialiasingMode === AntialiasingMode.MSAAx4) {
    return 4;
  }
  return 1;
}

export function setBackbufferDescSimple(
  desc: RGRenderTargetDescription,
  renderInput: RenderInput,
): void {
  const sampleCount = selectSampleCount(renderInput);
  desc.setDimensions(
    renderInput.backbufferWidth,
    renderInput.backbufferHeight,
    sampleCount,
  );
}

export interface GfxrAttachmentClearDescriptor {
  colorClearColor: Readonly<Color> | 'load';
  depthClearValue: number;
  stencilClearValue: number;
}

export function makeBackbufferDescSimple(
  slot: RGAttachmentSlot,
  renderInput: RenderInput,
  clearDescriptor: GfxrAttachmentClearDescriptor,
): RGRenderTargetDescription {
  const pixelFormat = selectFormatSimple(slot);
  const desc = new RGRenderTargetDescription(pixelFormat);

  setBackbufferDescSimple(desc, renderInput);

  if (clearDescriptor !== null) {
    desc.colorClearColor = clearDescriptor.colorClearColor;
    desc.depthClearValue = clearDescriptor.depthClearValue;
    desc.stencilClearValue = clearDescriptor.stencilClearValue;
  }

  return desc;
}
