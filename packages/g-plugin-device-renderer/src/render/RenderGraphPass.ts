import type {
  QueryPool,
  RenderPassDescriptor,
  Texture,
} from '@antv/g-device-api';
import { assert } from '@antv/g-device-api';
import type {
  IRenderGraphPass,
  PassExecFunc,
  PassPostFunc,
  RGAttachmentSlot,
} from './interfaces';
import type { RGRenderTarget } from './RenderTarget';

export class RenderGraphPass implements IRenderGraphPass {
  // RenderTargetAttachmentSlot => renderTargetID
  renderTargetIDs: number[] = [];
  renderTargetLevels: number[] = [];
  // RenderTargetAttachmentSlot => resolveTextureID
  resolveTextureOutputIDs: number[] = [];
  // RenderTargetAttachmentSlot => Texture
  resolveTextureOutputExternalTextures: Texture[] = [];
  resolveTextureOutputExternalTextureLevel: number[] = [];
  // List of resolveTextureIDs that we have a reference to.
  resolveTextureInputIDs: number[] = [];
  // RGAttachmentSlot => refcount.
  renderTargetExtraRefs: boolean[] = [];

  resolveTextureInputTextures: Texture[] = [];

  renderTargets: (RGRenderTarget | null)[] = [];

  // Execution state computed by scheduling.
  descriptor: RenderPassDescriptor = {
    colorAttachment: [],
    colorAttachmentLevel: [],
    colorResolveTo: [],
    colorResolveToLevel: [],
    colorStore: [],
    depthStencilAttachment: null,
    depthStencilResolveTo: null,
    depthStencilStore: true,
    colorClearColor: ['load'],
    depthClearValue: 'load',
    stencilClearValue: 'load',
    occlusionQueryPool: null,
  };

  viewportX = 0;
  viewportY = 0;
  viewportW = 1;
  viewportH = 1;

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

  setViewport(x: number, y: number, w: number, h: number): void {
    this.viewportX = x;
    this.viewportY = y;
    this.viewportW = w;
    this.viewportH = h;
  }

  attachRenderTargetID(
    attachmentSlot: RGAttachmentSlot,
    renderTargetID: number,
    level = 0,
  ): void {
    assert(this.renderTargetIDs[attachmentSlot] === undefined);
    this.renderTargetIDs[attachmentSlot] = renderTargetID;
    this.renderTargetLevels[attachmentSlot] = level;
  }

  attachResolveTexture(resolveTextureID: number): void {
    this.resolveTextureInputIDs.push(resolveTextureID);
  }

  attachOcclusionQueryPool(queryPool: QueryPool): void {
    this.descriptor.occlusionQueryPool = queryPool;
  }

  exec(func: PassExecFunc): void {
    assert(this.execFunc === null);
    this.execFunc = func;
  }

  post(func: PassPostFunc): void {
    assert(this.postFunc === null);
    this.postFunc = func;
  }

  addExtraRef(slot: RGAttachmentSlot): void {
    this.renderTargetExtraRefs[slot] = true;
  }
}
