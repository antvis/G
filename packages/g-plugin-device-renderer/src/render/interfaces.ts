import type {
  QueryPool,
  RenderPass,
  RenderTarget,
  Texture,
} from '@antv/g-device-api';
import type { RGRenderTargetDescription } from './RenderTargetDescription';

export enum RGAttachmentSlot {
  Color0 = 0,
  Color1 = 1,
  Color2 = 2,
  Color3 = 3,
  ColorMax = Color3,
  DepthStencil,
}

export interface RGPassScope {
  getResolveTextureForID: (id: number) => Texture;
  getRenderTargetAttachment: (slot: RGAttachmentSlot) => RenderTarget | null;
  getRenderTargetTexture: (slot: RGAttachmentSlot) => Texture | null;
}

export type PassSetupFunc = (renderPass: IRenderGraphPass) => void;
export type PassExecFunc = (
  passRenderer: RenderPass,
  scope: RGPassScope,
) => void;
export type PassPostFunc = (scope: RGPassScope) => void;

export interface IRenderGraphPass {
  /**
   * Set the debug name of a given pass.
   */
  setDebugName: (debugName: string) => void;

  /**
   * Set whether to output a debug thumbnail. false by default.
   */
  pushDebugThumbnail: (attachmentSlot: RGAttachmentSlot) => void;

  /**
   * Attach the given renderTargetID to the given attachmentSlot.
   * This determines which render targets this pass will render to.
   */
  attachRenderTargetID: (
    attachmentSlot: RGAttachmentSlot,
    renderTargetID: number,
  ) => void;

  /**
   * Attach the occlusion query pool used by this rendering pass.
   */
  attachOcclusionQueryPool: (queryPool: QueryPool) => void;

  /**
   * Set the viewport for the given render pass in *normalized* coordinates (0..1).
   * Not required; defaults to full viewport.
   */
  setViewport(x: number, y: number, w: number, h: number): void;

  /**
   * Attach the resolve texture ID to the given pass. All resolve textures used within the pass
   * must be attached before-hand in order for the scheduler to properly allocate our resolve texture.
   */
  attachResolveTexture: (resolveTextureID: number) => void;

  /**
   * Set the pass's execution callback.
   */
  exec: (func: PassExecFunc) => void;

  /**
   * Set the pass's post callback
   */
  post: (func: PassPostFunc) => void;

  addExtraRef: (renderTargetID: RGAttachmentSlot) => void;
}

export interface RGGraphBuilder {
  /**
   * Add a new pass. {@param setupFunc} will be called *immediately* to set up the
   * pass. This is wrapped in a function simply to limit the scope of a pass. It
   * is possible I might change this in the future to limit the allocations caused
   * by closures.
   */
  pushPass: (setupFunc: PassSetupFunc) => void;

  /**
   * Tell the system about a render target with the given descriptions. Render targets
   * are "virtual", and is only backed by an actual device resource when inside of a pass.
   * This allows render targets to be reused without the user having to track any of this
   * logic.
   *
   * When a pass has a render target ID attached, the created {@see GfxRenderPass} will have
   * the render targets already bound. To use a render target as an input to a rendering
   * algorithm, it must first be "resolved" to a texture. Use {@see resolveRenderTarget} to
   * get a resolved texture ID corresponding to a given render target.
   *
   * To retrieve actual backing resource for a given render target ID inside of a pass,
   * use the {@see GfxrPassScope} given to the pass's execution or post callbacks, however
   * this usage should be rarer than the resolve case.
   */
  createRenderTargetID: (
    desc: Readonly<RGRenderTargetDescription>,
    debugName: string,
  ) => number;

  /**
   * Resolve the render target in slot {@param attachmentSlot} of pass {@param pass}, and return
   * the resolve texture ID.
   *
   * To bind the image of a render target in a rendering pass, it first must be "resolved" to
   * a texture. Please remember to attach the resolve texture to a pass where it is used with
   * {@see GfxrPassScope::attachResolveTexture}. When in the pass's execution or post callbacks,
   * you can retrieve a proper {@param GfxTexture} for a resolve texture ID with
   * {@see GfxrPassScope::getResolveTextureForID}}.
   */
  resolveRenderTargetPassAttachmentSlot: (
    pass: IRenderGraphPass,
    attachmentSlot: RGAttachmentSlot,
  ) => number;

  /**
   * Resolve the render target ID {@param renderTargetID}, and return the resolve texture ID.
   *
   * To bind the image of a render target in a rendering pass, it first must be "resolved" to
   * a texture. Please remember to attach the resolve texture to a pass where it is used with
   * {@see GfxrPassScope::attachResolveTexture}. When in the pass's execution or post callbacks,
   * you can retrieve a proper {@param GfxTexture} for a resolve texture ID with
   * {@see GfxrPassScope::getResolveTextureForID}}.
   *
   * This just looks up the last pass that drew to the render target {@param renderTargetID},
   * and then calls {@see resolveRenderTargetPassAttachmentSlot} using the information it found.
   */
  resolveRenderTarget: (renderTargetID: number) => number;

  /**
   * Specify that the render target ID {@param renderTargetID} should be resolved to an
   * externally-provided texture. The texture must have been allocated by the user, and it must
   * match the dimensions of the render target.
   *
   * Warning: This API might change in the near future.
   */
  resolveRenderTargetToExternalTexture: (
    renderTargetID: number,
    texture: Texture,
  ) => void;

  /**
   * Return the description that a render target was created with. This allows the creator to
   * not have to pass information to any dependent modules to derive from it.
   */
  getRenderTargetDescription: (
    renderTargetID: number,
  ) => Readonly<RGRenderTargetDescription>;

  /**
   * Internal API.
   */
  getDebug: () => RGGraphBuilderDebug;
}

export interface RGGraphBuilderDebug {
  getPasses: () => IRenderGraphPass[];
  getPassDebugThumbnails: (pass: IRenderGraphPass) => boolean[];
  getPassRenderTargetID: (
    pass: IRenderGraphPass,
    slot: RGAttachmentSlot,
  ) => number;
  getRenderTargetIDDebugName: (renderTargetID: number) => string;
}
