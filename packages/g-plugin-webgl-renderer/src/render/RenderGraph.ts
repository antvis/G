import { Device, RenderTarget, Texture } from '../platform';
import { assert, assertExists, fillArray } from '../platform/utils';
import { PassSetupFunc, RGAttachmentSlot, RGGraphBuilder, RGGraphBuilderDebug } from './interfaces';
import { RenderGraphPass } from './RenderGraphPass';
import { RGRenderTarget } from './RenderTarget';
import { RGRenderTargetDescription } from './RenderTargetDescription';
import { SingleSampledTexture } from './SingleSampledTexture';

class GraphImpl {
  [Symbol.species]?: 'RGGraph';

  // Used for determining scheduling.
  renderTargetDescriptions: Readonly<RGRenderTargetDescription>[] = [];
  resolveTextureRenderTargetIDs: number[] = [];

  passes: RenderGraphPass[] = [];

  // Debugging.
  renderTargetDebugNames: string[] = [];
}

export class RenderGraph implements RGGraphBuilder {
  private device: Device;
  // For scope callbacks.
  private currentPass: RenderGraphPass | null = null;

  //#region Resource Creation & Caching
  private renderTargetDeadPool: RGRenderTarget[] = [];
  private singleSampledTextureDeadPool: SingleSampledTexture[] = [];

  constructor(device: Device) {
    this.device = device;
  }

  private acquireRenderTargetForDescription(
    desc: Readonly<RGRenderTargetDescription>,
  ): RGRenderTarget {
    for (let i = 0; i < this.renderTargetDeadPool.length; i++) {
      const freeRenderTarget = this.renderTargetDeadPool[i];
      if (freeRenderTarget.matchesDescription(desc)) {
        // Pop it off the list.
        freeRenderTarget.reset(desc);
        this.renderTargetDeadPool.splice(i--, 1);
        return freeRenderTarget;
      }
    }

    // Allocate a new render target.
    return new RGRenderTarget(this.device, desc);
  }

  private acquireSingleSampledTextureForDescription(
    desc: Readonly<RGRenderTargetDescription>,
  ): SingleSampledTexture {
    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++) {
      const freeSingleSampledTexture = this.singleSampledTextureDeadPool[i];
      if (freeSingleSampledTexture.matchesDescription(desc)) {
        // Pop it off the list.
        freeSingleSampledTexture.reset(desc);
        this.singleSampledTextureDeadPool.splice(i--, 1);
        return freeSingleSampledTexture;
      }
    }

    // Allocate a new resolve texture.
    return new SingleSampledTexture(this.device, desc);
  }
  //#endregion

  //#region Graph Builder
  private currentGraph: GraphImpl | null = null;

  beginGraphBuilder() {
    assert(this.currentGraph === null);
    this.currentGraph = new GraphImpl();
  }

  pushPass(setupFunc: PassSetupFunc): void {
    const pass = new RenderGraphPass();
    setupFunc(pass);
    this.currentGraph!.passes.push(pass);
  }

  createRenderTargetID(desc: Readonly<RGRenderTargetDescription>, debugName: string): number {
    this.currentGraph!.renderTargetDebugNames.push(debugName);
    return this.currentGraph!.renderTargetDescriptions.push(desc) - 1;
  }

  private createResolveTextureID(renderTargetID: number): number {
    return this.currentGraph!.resolveTextureRenderTargetIDs.push(renderTargetID) - 1;
  }

  /**
   * 查找最靠近输出的一个关联目标 RT 的 RGPass
   */
  private findMostRecentPassThatAttachedRenderTarget(
    renderTargetID: number,
  ): RenderGraphPass | null {
    for (let i = this.currentGraph!.passes.length - 1; i >= 0; i--) {
      const pass = this.currentGraph!.passes[i];
      if (pass.renderTargetIDs.includes(renderTargetID)) return pass;
    }

    return null;
  }

  resolveRenderTargetPassAttachmentSlot(
    pass: RenderGraphPass,
    attachmentSlot: RGAttachmentSlot,
  ): number {
    const renderPass = pass;

    if (renderPass.resolveTextureOutputIDs[attachmentSlot] === undefined) {
      const renderTargetID = renderPass.renderTargetIDs[attachmentSlot];
      const resolveTextureID = this.createResolveTextureID(renderTargetID);
      renderPass.resolveTextureOutputIDs[attachmentSlot] = resolveTextureID;
    }

    return renderPass.resolveTextureOutputIDs[attachmentSlot];
  }

  private findPassForResolveRenderTarget(renderTargetID: number): RenderGraphPass {
    // Find the last pass that rendered to this render target, and resolve it now.

    // If you wanted a previous snapshot copy of it, you should have created a separate,
    // intermediate pass to copy that out. Perhaps we should have a helper for that use case?

    // If there was no pass that wrote to this RT, well there's no point in resolving it, is there?
    const renderPass = assertExists(
      this.findMostRecentPassThatAttachedRenderTarget(renderTargetID),
    );

    // Check which attachment we're in. This could possibly be explicit from the user, but it's
    // easy enough to find...
    const attachmentSlot: RGAttachmentSlot = renderPass.renderTargetIDs.indexOf(renderTargetID);

    // Check that the pass isn't resolving its attachment to another texture. Can't do both!
    assert(renderPass.resolveTextureOutputExternalTextures[attachmentSlot] === undefined);

    return renderPass;
  }

  resolveRenderTarget(renderTargetID: number): number {
    const renderPass = this.findPassForResolveRenderTarget(renderTargetID);
    const attachmentSlot: RGAttachmentSlot = renderPass.renderTargetIDs.indexOf(renderTargetID);
    return this.resolveRenderTargetPassAttachmentSlot(renderPass, attachmentSlot);
  }

  resolveRenderTargetToExternalTexture(renderTargetID: number, texture: Texture): void {
    const renderPass = this.findPassForResolveRenderTarget(renderTargetID);
    const attachmentSlot: RGAttachmentSlot = renderPass.renderTargetIDs.indexOf(renderTargetID);
    // We shouldn't be resolving to a resolve texture ID in this case.
    assert(renderPass.resolveTextureOutputIDs[attachmentSlot] === undefined);
    renderPass.resolveTextureOutputExternalTextures[attachmentSlot] = texture;
  }

  getRenderTargetDescription(renderTargetID: number): Readonly<RGRenderTargetDescription> {
    return assertExists(this.currentGraph!.renderTargetDescriptions[renderTargetID]);
  }
  //#endregion

  //#region Scheduling
  private renderTargetUseCount: number[] = [];
  private resolveTextureUseCount: number[] = [];
  private resolveTextureConflict: boolean[] = [];

  private renderTargetAliveForID: RGRenderTarget[] = [];
  private singleSampledTextureForResolveTextureID: SingleSampledTexture[] = [];

  private scheduleAddUseCount(graph: GraphImpl, pass: RenderGraphPass): void {
    for (let i = 0; i < pass.renderTargetIDs.length; i++) {
      const renderTargetID = pass.renderTargetIDs[i];
      if (renderTargetID === undefined) continue;

      // 统计每个 RT 的使用量
      this.renderTargetUseCount[renderTargetID]++;
    }

    for (let i = 0; i < pass.resolveTextureInputIDs.length; i++) {
      const resolveTextureID = pass.resolveTextureInputIDs[i];
      if (resolveTextureID === undefined) continue;

      // 统计每个 texture 的使用量
      this.resolveTextureUseCount[resolveTextureID]++;

      const renderTargetID = graph.resolveTextureRenderTargetIDs[resolveTextureID];
      this.renderTargetUseCount[renderTargetID]++;

      this.resolveTextureConflict[resolveTextureID] = pass.renderTargetIDs.includes(renderTargetID);
    }
  }

  private acquireRenderTargetForID(
    graph: GraphImpl,
    renderTargetID: number | undefined,
  ): RGRenderTarget | null {
    if (renderTargetID === undefined) return null;

    assert(this.renderTargetUseCount[renderTargetID] > 0);

    if (!this.renderTargetAliveForID[renderTargetID]) {
      const desc = graph.renderTargetDescriptions[renderTargetID];
      const newRenderTarget = this.acquireRenderTargetForDescription(desc);
      newRenderTarget.debugName = graph.renderTargetDebugNames[renderTargetID];
      this.renderTargetAliveForID[renderTargetID] = newRenderTarget;
    }

    return this.renderTargetAliveForID[renderTargetID];
  }

  private releaseRenderTargetForID(renderTargetID: number | undefined): RGRenderTarget | null {
    if (renderTargetID === undefined) return null;

    assert(this.renderTargetUseCount[renderTargetID] > 0);

    const renderTarget = assertExists(this.renderTargetAliveForID[renderTargetID]);

    if (--this.renderTargetUseCount[renderTargetID] === 0) {
      // This was the last reference to this RT -- steal it from the alive list, and put it back into the pool.
      renderTarget.needsClear = true;

      delete this.renderTargetAliveForID[renderTargetID];
      this.renderTargetDeadPool.push(renderTarget);
    }

    return renderTarget;
  }

  private acquireResolveTextureInputTextureForID(
    graph: GraphImpl,
    resolveTextureID: number,
  ): Texture {
    const renderTargetID = graph.resolveTextureRenderTargetIDs[resolveTextureID];

    assert(this.resolveTextureUseCount[resolveTextureID] > 0);

    let shouldFree = false;
    if (--this.resolveTextureUseCount[resolveTextureID] === 0) shouldFree = true;

    const renderTarget = assertExists(this.releaseRenderTargetForID(renderTargetID));

    if (this.singleSampledTextureForResolveTextureID[resolveTextureID] !== undefined) {
      // The resolved texture belonging to this RT is backed by our own single-sampled texture.

      const singleSampledTexture = this.singleSampledTextureForResolveTextureID[resolveTextureID];

      if (shouldFree) {
        // Release this single-sampled texture back to the pool, if this is the last use of it.
        this.singleSampledTextureDeadPool.push(singleSampledTexture);
      }

      return singleSampledTexture.texture;
    } else {
      // The resolved texture belonging to this RT is backed by our render target.
      return assertExists(renderTarget.texture);
    }
  }

  private determineResolveToTexture(
    graph: GraphImpl,
    pass: RenderGraphPass,
    slot: RGAttachmentSlot,
  ): Texture | null {
    const renderTargetID = pass.renderTargetIDs[slot];
    const resolveTextureOutputID = pass.resolveTextureOutputIDs[slot];
    const externalTexture = pass.resolveTextureOutputExternalTextures[slot];

    // We should have either an output ID or an external texture, not both.
    const hasResolveTextureOutputID = resolveTextureOutputID !== undefined;
    const hasExternalTexture = externalTexture !== undefined;
    assert(!(hasResolveTextureOutputID && hasExternalTexture));

    if (hasResolveTextureOutputID) {
      assert(graph.resolveTextureRenderTargetIDs[resolveTextureOutputID] === renderTargetID);
      assert(this.resolveTextureUseCount[resolveTextureOutputID] > 0);

      const renderTarget = assertExists(this.renderTargetAliveForID[renderTargetID]);

      // No need to resolve -- we're already rendering into a texture-backed RT.
      if (renderTarget.texture !== null && !this.resolveTextureConflict[resolveTextureOutputID])
        return null;

      if (!this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]) {
        const desc = assertExists(graph.renderTargetDescriptions[renderTargetID]);
        this.singleSampledTextureForResolveTextureID[resolveTextureOutputID] =
          this.acquireSingleSampledTextureForDescription(desc);
        this.device.setResourceName(
          this.singleSampledTextureForResolveTextureID[resolveTextureOutputID].texture,
          renderTarget.debugName + ` (Resolve ${resolveTextureOutputID})`,
        );
      }

      return this.singleSampledTextureForResolveTextureID[resolveTextureOutputID].texture;
    } else if (hasExternalTexture) {
      return externalTexture;
    } else {
      return null;
    }
  }

  private schedulePass(graph: GraphImpl, pass: RenderGraphPass) {
    const depthStencilRenderTargetID = pass.renderTargetIDs[RGAttachmentSlot.DepthStencil];

    for (let slot = RGAttachmentSlot.Color0; slot <= RGAttachmentSlot.ColorMax; slot++) {
      const colorRenderTargetID = pass.renderTargetIDs[slot];
      const colorRenderTarget = this.acquireRenderTargetForID(graph, colorRenderTargetID);
      pass.renderTargets[slot] = colorRenderTarget;
      pass.descriptor.colorAttachment[slot] =
        colorRenderTarget !== null ? colorRenderTarget.attachment : null;
      pass.descriptor.colorResolveTo[slot] = this.determineResolveToTexture(graph, pass, slot);
      pass.descriptor.colorClearColor[slot] =
        colorRenderTarget !== null && colorRenderTarget.needsClear
          ? graph.renderTargetDescriptions[colorRenderTargetID].colorClearColor
          : 'load';
    }

    const depthStencilRenderTarget = this.acquireRenderTargetForID(
      graph,
      depthStencilRenderTargetID,
    );
    pass.renderTargets[RGAttachmentSlot.DepthStencil] = depthStencilRenderTarget;
    pass.descriptor.depthStencilAttachment =
      depthStencilRenderTarget !== null ? depthStencilRenderTarget.attachment : null;
    pass.descriptor.depthStencilResolveTo = this.determineResolveToTexture(
      graph,
      pass,
      RGAttachmentSlot.DepthStencil,
    );
    pass.descriptor.depthClearValue =
      depthStencilRenderTarget !== null && depthStencilRenderTarget.needsClear
        ? graph.renderTargetDescriptions[depthStencilRenderTargetID].depthClearValue
        : 'load';
    pass.descriptor.stencilClearValue =
      depthStencilRenderTarget !== null && depthStencilRenderTarget.needsClear
        ? graph.renderTargetDescriptions[depthStencilRenderTargetID].stencilClearValue
        : 'load';

    let rtWidth = 0,
      rtHeight = 0,
      rtSampleCount = 0;
    for (let i = 0; i < pass.renderTargets.length; i++) {
      const renderTarget = pass.renderTargets[i];
      if (!renderTarget) continue;

      if (rtWidth === 0) {
        rtWidth = renderTarget.width;
        rtHeight = renderTarget.height;
        rtSampleCount = renderTarget.sampleCount;
      }

      assert(renderTarget.width === rtWidth);
      assert(renderTarget.height === rtHeight);
      assert(renderTarget.sampleCount === rtSampleCount);
      renderTarget.needsClear = false;
    }

    if (rtWidth > 0 && rtHeight > 0) {
      const x = rtWidth * pass.viewport.x;
      const y = rtHeight * pass.viewport.y;
      const w = rtWidth * pass.viewport.w;
      const h = rtHeight * pass.viewport.h;
      pass.viewportX = x;
      pass.viewportY = y;
      pass.viewportW = w;
      pass.viewportH = h;
    }

    for (let i = 0; i < pass.resolveTextureInputIDs.length; i++) {
      const resolveTextureID = pass.resolveTextureInputIDs[i];
      pass.resolveTextureInputTextures[i] = this.acquireResolveTextureInputTextureForID(
        graph,
        resolveTextureID,
      );
    }

    // Now that we're done with the pass, release our render targets back to the pool.
    for (let i = 0; i < pass.renderTargetIDs.length; i++)
      this.releaseRenderTargetForID(pass.renderTargetIDs[i]);
  }

  private scheduleGraph(graph: GraphImpl): void {
    assert(this.renderTargetUseCount.length === 0);
    assert(this.resolveTextureUseCount.length === 0);

    // Go through and increment the age of everything in our dead pools to mark that it's old.
    for (let i = 0; i < this.renderTargetDeadPool.length; i++) this.renderTargetDeadPool[i].age++;
    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++)
      this.singleSampledTextureDeadPool[i].age++;

    // Schedule our resources -- first, count up all uses of resources, then hand them out.

    // Initialize our accumulators.
    fillArray(this.renderTargetUseCount, graph.renderTargetDescriptions.length, 0);
    fillArray(this.resolveTextureUseCount, graph.resolveTextureRenderTargetIDs.length, 0);
    fillArray(this.resolveTextureConflict, graph.resolveTextureRenderTargetIDs.length, false);

    // Count.
    for (let i = 0; i < graph.passes.length; i++) this.scheduleAddUseCount(graph, graph.passes[i]);

    // Now hand out resources.
    for (let i = 0; i < graph.passes.length; i++) this.schedulePass(graph, graph.passes[i]);

    // Double-check that all resources were handed out.
    for (let i = 0; i < this.renderTargetUseCount.length; i++)
      assert(this.renderTargetUseCount[i] === 0);
    for (let i = 0; i < this.resolveTextureUseCount.length; i++)
      assert(this.resolveTextureUseCount[i] === 0);
    for (let i = 0; i < this.renderTargetAliveForID.length; i++)
      assert(this.renderTargetAliveForID[i] === undefined);

    // Now go through and kill anything that's over our age threshold (hasn't been used in a bit)
    const ageThreshold = 1;

    for (let i = 0; i < this.renderTargetDeadPool.length; i++) {
      if (this.renderTargetDeadPool[i].age >= ageThreshold) {
        this.renderTargetDeadPool[i].destroy(this.device);
        this.renderTargetDeadPool.splice(i--, 1);
      }
    }

    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++) {
      if (this.singleSampledTextureDeadPool[i].age >= ageThreshold) {
        this.singleSampledTextureDeadPool[i].destroy(this.device);
        this.singleSampledTextureDeadPool.splice(i--, 1);
      }
    }

    // Clear out our transient scheduling state.
    this.renderTargetUseCount.length = 0;
    this.resolveTextureUseCount.length = 0;
  }
  //#endregion

  //#region Execution
  private execPass(pass: RenderGraphPass): void {
    assert(this.currentPass === null);
    this.currentPass = pass;

    const renderPass = this.device.createRenderPass(pass.descriptor);

    renderPass.setViewport(pass.viewportX, pass.viewportY, pass.viewportW, pass.viewportH);

    if (pass.execFunc !== null) pass.execFunc(renderPass, this);

    this.device.submitPass(renderPass);

    if (pass.postFunc !== null) pass.postFunc(this);

    this.currentPass = null;
  }

  private execGraph(graph: GraphImpl) {
    this.scheduleGraph(graph);
    graph.passes.forEach((pass) => {
      this.execPass(pass);
    });
    // Clear our transient scope state.
    this.singleSampledTextureForResolveTextureID.length = 0;
  }

  execute() {
    const graph = assertExists(this.currentGraph);
    this.execGraph(graph);
    this.currentGraph = null;
  }

  getDebug(): RGGraphBuilderDebug {
    return this;
  }
  //#endregion

  //#region GfxrGraphBuilderDebug
  getPasses(): RenderGraphPass[] {
    return this.currentGraph!.passes;
  }

  getPassDebugThumbnails(pass: RenderGraphPass): boolean[] {
    return pass.debugThumbnails;
  }

  getPassRenderTargetID(pass: RenderGraphPass, slot: RGAttachmentSlot): number {
    return (pass as RenderGraphPass).renderTargetIDs[slot];
  }

  getRenderTargetIDDebugName(renderTargetID: number): string {
    return this.currentGraph!.renderTargetDebugNames[renderTargetID];
  }
  //#endregion

  //#region GfxrPassScope
  getResolveTextureForID(resolveTextureID: number): Texture {
    const currentGraphPass = this.currentPass!;
    const i = currentGraphPass.resolveTextureInputIDs.indexOf(resolveTextureID);
    assert(i >= 0);
    return assertExists(currentGraphPass.resolveTextureInputTextures[i]);
  }

  getRenderTargetAttachment(slot: RGAttachmentSlot): RenderTarget | null {
    const currentGraphPass = this.currentPass!;
    const renderTarget = currentGraphPass.renderTargets[slot];
    if (!renderTarget) return null;
    return renderTarget.attachment;
  }

  getRenderTargetTexture(slot: RGAttachmentSlot): Texture | null {
    const currentGraphPass = this.currentPass!;
    const renderTarget = currentGraphPass.renderTargets[slot];
    if (!renderTarget) return null;
    return renderTarget.texture;
  }
  //#endregion

  newGraphBuilder(): RGGraphBuilder {
    this.beginGraphBuilder();
    return this;
  }

  destroy(): void {
    // At the time this is called, we shouldn't have anything alive.
    for (let i = 0; i < this.renderTargetAliveForID.length; i++)
      assert(this.renderTargetAliveForID[i] === undefined);
    for (let i = 0; i < this.singleSampledTextureForResolveTextureID.length; i++)
      assert(this.singleSampledTextureForResolveTextureID[i] === undefined);

    for (let i = 0; i < this.renderTargetDeadPool.length; i++)
      this.renderTargetDeadPool[i].destroy(this.device);
    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++)
      this.singleSampledTextureDeadPool[i].destroy(this.device);
  }
}
