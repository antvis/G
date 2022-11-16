import type {
  NormalizedViewportCoords,
  QueryPool,
  RenderPassDescriptor,
  Texture,
} from '../platform';
import { assert } from '../platform/utils';
import type {
  IRenderGraphPass,
  PassExecFunc,
  PassPostFunc,
  RGAttachmentSlot,
} from './interfaces';
import { IdentityViewportCoords } from './interfaces';
import type { RGRenderTarget } from './RenderTarget';

export class RenderGraphPass implements IRenderGraphPass {
  // RenderTargetAttachmentSlot => renderTargetID
  renderTargetIDs: number[] = [];
  // RenderTargetAttachmentSlot => resolveTextureID
  resolveTextureOutputIDs: number[] = [];
  // RenderTargetAttachmentSlot => Texture
  resolveTextureOutputExternalTextures: Texture[] = [];
  // List of resolveTextureIDs that we have a reference to.
  resolveTextureInputIDs: number[] = [];
  // RGAttachmentSlot => refcount.
  renderTargetExtraRefs: boolean[] = [];

  viewport: NormalizedViewportCoords = IdentityViewportCoords;

  resolveTextureInputTextures: Texture[] = [];

  renderTargets: (RGRenderTarget | null)[] = [];

  // Execution state computed by scheduling.
  descriptor: RenderPassDescriptor = {
    colorAttachment: [],
    colorResolveTo: [],
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
  viewportW = 0;
  viewportH = 0;

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

  attachRenderTargetID(
    attachmentSlot: RGAttachmentSlot,
    renderTargetID: number,
  ): void {
    assert(this.renderTargetIDs[attachmentSlot] === undefined);
    this.renderTargetIDs[attachmentSlot] = renderTargetID;
  }

  attachResolveTexture(resolveTextureID: number): void {
    this.resolveTextureInputIDs.push(resolveTextureID);
  }

  attachOcclusionQueryPool(queryPool: QueryPool): void {
    this.descriptor.occlusionQueryPool = queryPool;
  }

  resolveToExternalTexture(
    attachmentSlot: RGAttachmentSlot,
    texture: Texture,
  ): void {
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

  addExtraRef(slot: RGAttachmentSlot): void {
    this.renderTargetExtraRefs[slot] = true;
  }
}
