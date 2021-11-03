import { NormalizedViewportCoords, RenderPassDescriptor, RenderTarget, Texture } from '../platform';
import { assert } from '../platform/utils';
import {
  IdentityViewportCoords,
  IRenderGraphPass,
  PassExecFunc,
  PassPostFunc,
  RGAttachmentSlot,
} from './interfaces';
import { RGRenderTarget } from './RenderTarget';

export class RenderGraphPass implements IRenderGraphPass {
  // RenderTargetAttachmentSlot => renderTargetID
  renderTargetIDs: number[] = [];
  // RenderTargetAttachmentSlot => resolveTextureID
  resolveTextureOutputIDs: number[] = [];
  // RenderTargetAttachmentSlot => Texture
  resolveTextureOutputExternalTextures: Texture[] = [];
  // List of resolveTextureIDs that we have a reference to.
  resolveTextureInputIDs: number[] = [];

  viewport: NormalizedViewportCoords = IdentityViewportCoords;

  resolveTextureInputTextures: Texture[] = [];

  renderTargets: (RGRenderTarget | null)[] = [];

  // Execution state computed by scheduling.
  descriptor: RenderPassDescriptor = {
    colorAttachment: [],
    colorResolveTo: [],
    depthStencilAttachment: null,
    depthStencilResolveTo: null,
    colorClearColor: ['load'],
    depthClearValue: 'load',
    stencilClearValue: 'load',
  };

  viewportX: number = 0;
  viewportY: number = 0;
  viewportW: number = 0;
  viewportH: number = 0;

  // Execution callback from user.
  execFunc: PassExecFunc | null = null;
  postFunc: PassPostFunc | null = null;

  // Misc. state.
  debugName: string;
  debugThumbnails: boolean[] = [];

  setDebugName(debugName: string): void {
    this.debugName = debugName;
  }

  pushDebugThumbnail(attachmentSlot: RGAttachmentSlot): void {
    this.debugThumbnails[attachmentSlot] = true;
  }

  setViewport(viewport: Readonly<NormalizedViewportCoords>): void {
    this.viewport = viewport;
  }

  attachRenderTargetID(attachmentSlot: RGAttachmentSlot, renderTargetID: number): void {
    assert(this.renderTargetIDs[attachmentSlot] === undefined);
    this.renderTargetIDs[attachmentSlot] = renderTargetID;
  }

  attachResolveTexture(resolveTextureID: number): void {
    this.resolveTextureInputIDs.push(resolveTextureID);
  }

  resolveToExternalTexture(attachmentSlot: RGAttachmentSlot, texture: Texture): void {
    this.resolveTextureOutputExternalTextures[attachmentSlot] = texture;
  }

  exec(func: PassExecFunc): void {
    assert(this.execFunc === null);
    this.execFunc = func;
  }

  post(func: PassPostFunc): void {
    assert(this.postFunc === null);
    this.postFunc = func;
  }
}
