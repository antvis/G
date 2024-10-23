/* eslint-disable max-classes-per-file */
import type { Device, RenderTarget, Texture } from '@antv/g-device-api';
import { assert, assertExists, fillArray } from '@antv/g-device-api';
import type {
  PassSetupFunc,
  RGGraphBuilder,
  RGGraphBuilderDebug,
} from './interfaces';
import { RGAttachmentSlot } from './interfaces';
import { RenderGraphPass } from './RenderGraphPass';
import { RGRenderTarget } from './RenderTarget';
import type { RGRenderTargetDescription } from './RenderTargetDescription';
import { SingleSampledTexture } from './SingleSampledTexture';

interface ResolveParam {
  resolveTo: Texture | null;
  store: boolean;
  level: number;
}

class GraphImpl {
  // [Symbol.species]?: 'RGGraph';

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

  // #region Resource Creation & Caching
  renderTargetDeadPool: RGRenderTarget[] = [];
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
  // #endregion

  // #region Graph Builder
  private currentGraph: GraphImpl | null = null;

  beginGraphBuilder() {
    assert(this.currentGraph === null);
    this.currentGraph = new GraphImpl();
  }

  pushPass(setupFunc: PassSetupFunc): void {
    const pass = new RenderGraphPass();
    setupFunc(pass);
    this.currentGraph.passes.push(pass);
  }

  createRenderTargetID(
    desc: Readonly<RGRenderTargetDescription>,
    debugName: string,
  ): number {
    this.currentGraph.renderTargetDebugNames.push(debugName);
    return this.currentGraph.renderTargetDescriptions.push(desc) - 1;
  }

  private createResolveTextureID(renderTargetID: number): number {
    return (
      this.currentGraph.resolveTextureRenderTargetIDs.push(renderTargetID) - 1
    );
  }

  /**
   * 查找最靠近输出的一个关联目标 RT 的 RGPass
   */
  private findMostRecentPassThatAttachedRenderTarget(
    renderTargetID: number,
  ): RenderGraphPass | null {
    for (let i = this.currentGraph.passes.length - 1; i >= 0; i--) {
      const pass = this.currentGraph.passes[i];
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

  private findPassForResolveRenderTarget(
    renderTargetID: number,
  ): RenderGraphPass {
    // Find the last pass that rendered to this render target, and resolve it now.

    // If you wanted a previous snapshot copy of it, you should have created a separate,
    // intermediate pass to copy that out. Perhaps we should have a helper for that use case?

    // If there was no pass that wrote to this RT, well there's no point in resolving it, is there?
    const renderPass = assertExists(
      this.findMostRecentPassThatAttachedRenderTarget(renderTargetID),
    );

    // Check which attachment we're in. This could possibly be explicit from the user, but it's
    // easy enough to find...
    const attachmentSlot: RGAttachmentSlot =
      renderPass.renderTargetIDs.indexOf(renderTargetID);

    // Check that the pass isn't resolving its attachment to another texture. Can't do both!
    assert(
      renderPass.resolveTextureOutputExternalTextures[attachmentSlot] ===
        undefined,
    );

    return renderPass;
  }

  resolveRenderTarget(renderTargetID: number): number {
    const renderPass = this.findPassForResolveRenderTarget(renderTargetID);
    const attachmentSlot: RGAttachmentSlot =
      renderPass.renderTargetIDs.indexOf(renderTargetID);
    return this.resolveRenderTargetPassAttachmentSlot(
      renderPass,
      attachmentSlot,
    );
  }

  resolveRenderTargetToExternalTexture(
    renderTargetID: number,
    texture: Texture,
    level = 0,
  ): void {
    const renderPass = this.findPassForResolveRenderTarget(renderTargetID);
    const attachmentSlot: RGAttachmentSlot =
      renderPass.renderTargetIDs.indexOf(renderTargetID);
    // We shouldn't be resolving to a resolve texture ID in this case.
    assert(renderPass.resolveTextureOutputIDs[attachmentSlot] === undefined);
    renderPass.resolveTextureOutputExternalTextures[attachmentSlot] = texture;
    renderPass.resolveTextureOutputExternalTextureLevel[attachmentSlot] = level;
  }

  getRenderTargetDescription(
    renderTargetID: number,
  ): Readonly<RGRenderTargetDescription> {
    return assertExists(
      this.currentGraph.renderTargetDescriptions[renderTargetID],
    );
  }
  // #endregion

  // #region Scheduling
  private renderTargetOutputCount: number[] = [];
  private renderTargetResolveCount: number[] = [];
  private resolveTextureUseCount: number[] = [];

  private renderTargetAliveForID: RGRenderTarget[] = [];
  private singleSampledTextureForResolveTextureID: SingleSampledTexture[] = [];

  private scheduleAddUseCount(graph: GraphImpl, pass: RenderGraphPass): void {
    for (let slot = 0; slot < pass.renderTargetIDs.length; slot++) {
      const renderTargetID = pass.renderTargetIDs[slot];
      if (renderTargetID === undefined) continue;

      this.renderTargetOutputCount[renderTargetID]++;

      if (pass.renderTargetExtraRefs[slot])
        this.renderTargetOutputCount[renderTargetID]++;
    }

    for (let i = 0; i < pass.resolveTextureInputIDs.length; i++) {
      const resolveTextureID = pass.resolveTextureInputIDs[i];
      if (resolveTextureID === undefined) continue;

      this.resolveTextureUseCount[resolveTextureID]++;

      const renderTargetID =
        graph.resolveTextureRenderTargetIDs[resolveTextureID];
      this.renderTargetResolveCount[renderTargetID]++;
    }
  }

  private acquireRenderTargetForID(
    graph: GraphImpl,
    renderTargetID: number | undefined,
  ): RGRenderTarget | null {
    if (renderTargetID === undefined) return null;

    assert(this.renderTargetOutputCount[renderTargetID] > 0);

    if (!this.renderTargetAliveForID[renderTargetID]) {
      const desc = graph.renderTargetDescriptions[renderTargetID];
      const newRenderTarget = this.acquireRenderTargetForDescription(desc);
      newRenderTarget.setDebugName(
        this.device,
        graph.renderTargetDebugNames[renderTargetID],
      );
      this.renderTargetAliveForID[renderTargetID] = newRenderTarget;
    }

    return this.renderTargetAliveForID[renderTargetID];
  }

  private releaseRenderTargetForID(
    renderTargetID: number | undefined,
    forOutput: boolean,
  ): RGRenderTarget | null {
    if (renderTargetID === undefined) return null;

    const renderTarget = assertExists(
      this.renderTargetAliveForID[renderTargetID],
    );

    if (forOutput) {
      assert(this.renderTargetOutputCount[renderTargetID] > 0);
      this.renderTargetOutputCount[renderTargetID]--;
    } else {
      assert(this.renderTargetResolveCount[renderTargetID] > 0);
      this.renderTargetResolveCount[renderTargetID]--;
    }

    if (
      this.renderTargetOutputCount[renderTargetID] === 0 &&
      this.renderTargetResolveCount[renderTargetID] === 0
    ) {
      // This was the last reference to this RT -- steal it from the alive list, and put it back into the pool.
      renderTarget.needsClear = true;

      this.renderTargetAliveForID[renderTargetID] = undefined;
      this.renderTargetDeadPool.push(renderTarget);
    }

    return renderTarget;
  }

  private acquireResolveTextureInputTextureForID(
    graph: GraphImpl,
    resolveTextureID: number,
  ): Texture {
    const renderTargetID =
      graph.resolveTextureRenderTargetIDs[resolveTextureID];

    assert(this.resolveTextureUseCount[resolveTextureID] > 0);
    this.resolveTextureUseCount[resolveTextureID]--;

    const renderTarget = assertExists(
      this.releaseRenderTargetForID(renderTargetID, false),
    );

    if (
      this.singleSampledTextureForResolveTextureID[resolveTextureID] !==
      undefined
    ) {
      // The resolved texture belonging to this RT is backed by our own single-sampled texture.

      const singleSampledTexture =
        this.singleSampledTextureForResolveTextureID[resolveTextureID];

      if (this.resolveTextureUseCount[resolveTextureID] === 0) {
        // Release this single-sampled texture back to the pool, if this is the last use of it.
        this.singleSampledTextureDeadPool.push(singleSampledTexture);
      }

      return singleSampledTexture.texture;
    }
    // The resolved texture belonging to this RT is backed by our render target.
    return assertExists(renderTarget.texture);
  }

  private determineResolveParam(
    graph: GraphImpl,
    pass: RenderGraphPass,
    slot: RGAttachmentSlot,
  ): ResolveParam {
    const renderTargetID = pass.renderTargetIDs[slot];
    const resolveTextureOutputID = pass.resolveTextureOutputIDs[slot];
    const externalTexture = pass.resolveTextureOutputExternalTextures[slot];

    // We should have either an output ID or an external texture, not both.
    const hasResolveTextureOutputID = resolveTextureOutputID !== undefined;
    const hasExternalTexture = externalTexture !== undefined;
    assert(!(hasResolveTextureOutputID && hasExternalTexture));

    let resolveTo: Texture | null = null;
    let store = false;
    let level = 0;

    if (this.renderTargetOutputCount[renderTargetID] > 1) {
      // A future pass is going to render to this RT, we need to store the results.
      store = true;
    }

    if (hasResolveTextureOutputID) {
      assert(
        graph.resolveTextureRenderTargetIDs[resolveTextureOutputID] ===
          renderTargetID,
      );
      assert(this.resolveTextureUseCount[resolveTextureOutputID] > 0);
      assert(this.renderTargetOutputCount[renderTargetID] > 0);

      const renderTarget = assertExists(
        this.renderTargetAliveForID[renderTargetID],
      );

      // If we're the last user of this RT, then we don't need to resolve -- the texture itself will be enough.
      // Note that this isn't exactly an exactly correct algorithm. If we have pass A writing to RenderTargetA,
      // pass B resolving RenderTargetA to ResolveTextureA, and pass C writing to RenderTargetA, then we don't
      // strictly need to copy, but in order to determine that at the time of pass A, we'd need a much fancier
      // schedule than just tracking refcounts...
      if (
        renderTarget.texture !== null &&
        this.renderTargetOutputCount[renderTargetID] === 1
      ) {
        resolveTo = null;
        store = true;
      } else {
        if (
          !this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]
        ) {
          const desc = assertExists(
            graph.renderTargetDescriptions[renderTargetID],
          );
          this.singleSampledTextureForResolveTextureID[resolveTextureOutputID] =
            this.acquireSingleSampledTextureForDescription(desc);
          this.device.setResourceName(
            this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]
              .texture,
            `${renderTarget.debugName} (Resolve ${resolveTextureOutputID})`,
          );
        }

        resolveTo =
          this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]
            .texture;
      }
    } else if (hasExternalTexture) {
      resolveTo = externalTexture;
      level = pass.resolveTextureOutputExternalTextureLevel[slot];
    } else {
      resolveTo = null;
    }

    return { resolveTo, store, level };
  }

  private schedulePass(graph: GraphImpl, pass: RenderGraphPass) {
    const depthStencilRenderTargetID =
      pass.renderTargetIDs[RGAttachmentSlot.DepthStencil];

    for (
      let slot = RGAttachmentSlot.Color0;
      slot <= RGAttachmentSlot.ColorMax;
      slot++
    ) {
      const colorRenderTargetID = pass.renderTargetIDs[slot];
      const colorRenderTarget = this.acquireRenderTargetForID(
        graph,
        colorRenderTargetID,
      );
      pass.renderTargets[slot] = colorRenderTarget;
      pass.descriptor.colorAttachment[slot] =
        colorRenderTarget !== null ? colorRenderTarget.attachment : null;
      pass.descriptor.colorAttachmentLevel[slot] =
        pass.renderTargetLevels[slot];
      const { resolveTo, store, level } = this.determineResolveParam(
        graph,
        pass,
        slot,
      );
      pass.descriptor.colorResolveTo[slot] = resolveTo;
      pass.descriptor.colorResolveToLevel[slot] = level;
      pass.descriptor.colorStore[slot] = store;
      pass.descriptor.colorClearColor[slot] =
        colorRenderTarget !== null && colorRenderTarget.needsClear
          ? graph.renderTargetDescriptions[colorRenderTargetID].colorClearColor
          : 'load';
    }

    const depthStencilRenderTarget = this.acquireRenderTargetForID(
      graph,
      depthStencilRenderTargetID,
    );
    pass.renderTargets[RGAttachmentSlot.DepthStencil] =
      depthStencilRenderTarget;
    pass.descriptor.depthStencilAttachment =
      depthStencilRenderTarget !== null
        ? depthStencilRenderTarget.attachment
        : null;
    const { resolveTo, store } = this.determineResolveParam(
      graph,
      pass,
      RGAttachmentSlot.DepthStencil,
    );
    pass.descriptor.depthStencilResolveTo = resolveTo;
    pass.descriptor.depthStencilStore = store;
    pass.descriptor.depthClearValue =
      depthStencilRenderTarget !== null && depthStencilRenderTarget.needsClear
        ? graph.renderTargetDescriptions[depthStencilRenderTargetID]
            .depthClearValue
        : 'load';
    pass.descriptor.stencilClearValue =
      depthStencilRenderTarget !== null && depthStencilRenderTarget.needsClear
        ? graph.renderTargetDescriptions[depthStencilRenderTargetID]
            .stencilClearValue
        : 'load';

    let rtWidth = 0;
    let rtHeight = 0;
    let rtSampleCount = 0;
    for (let i = 0; i < pass.renderTargets.length; i++) {
      const renderTarget = pass.renderTargets[i];
      if (!renderTarget) continue;

      const width = renderTarget.width >>> pass.renderTargetLevels[i];
      const height = renderTarget.height >>> pass.renderTargetLevels[i];

      if (rtWidth === 0) {
        rtWidth = width;
        rtHeight = height;
        rtSampleCount = renderTarget.sampleCount;
      }

      assert(width === rtWidth);
      assert(height === rtHeight);
      assert(renderTarget.sampleCount === rtSampleCount);
      renderTarget.needsClear = false;
    }

    if (rtWidth > 0 && rtHeight > 0) {
      pass.viewportX *= rtWidth;
      pass.viewportY *= rtHeight;
      pass.viewportW *= rtWidth;
      pass.viewportH *= rtHeight;
    }

    for (let i = 0; i < pass.resolveTextureInputIDs.length; i++) {
      const resolveTextureID = pass.resolveTextureInputIDs[i];
      pass.resolveTextureInputTextures[i] =
        this.acquireResolveTextureInputTextureForID(graph, resolveTextureID);
    }

    for (let i = 0; i < pass.renderTargetIDs.length; i++)
      this.releaseRenderTargetForID(pass.renderTargetIDs[i], true);

    for (let slot = 0; slot < pass.renderTargetExtraRefs.length; slot++)
      if (pass.renderTargetExtraRefs[slot])
        this.releaseRenderTargetForID(pass.renderTargetIDs[slot], true);
  }

  private scheduleGraph(graph: GraphImpl): void {
    assert(this.renderTargetOutputCount.length === 0);
    assert(this.renderTargetResolveCount.length === 0);
    assert(this.resolveTextureUseCount.length === 0);

    // Go through and increment the age of everything in our dead pools to mark that it's old.
    for (let i = 0; i < this.renderTargetDeadPool.length; i++)
      this.renderTargetDeadPool[i].age++;
    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++)
      this.singleSampledTextureDeadPool[i].age++;

    // Schedule our resources -- first, count up all uses of resources, then hand them out.

    // Initialize our accumulators.
    fillArray(
      this.renderTargetOutputCount,
      graph.renderTargetDescriptions.length,
      0,
    );
    fillArray(
      this.renderTargetResolveCount,
      graph.renderTargetDescriptions.length,
      0,
    );
    fillArray(
      this.resolveTextureUseCount,
      graph.resolveTextureRenderTargetIDs.length,
      0,
    );

    // Count.
    for (let i = 0; i < graph.passes.length; i++)
      this.scheduleAddUseCount(graph, graph.passes[i]);

    // Now hand out resources.
    for (let i = 0; i < graph.passes.length; i++)
      this.schedulePass(graph, graph.passes[i]);

    // Double-check that all resources were handed out.
    for (let i = 0; i < this.renderTargetOutputCount.length; i++)
      assert(this.renderTargetOutputCount[i] === 0);
    for (let i = 0; i < this.renderTargetResolveCount.length; i++)
      assert(this.renderTargetResolveCount[i] === 0);
    for (let i = 0; i < this.resolveTextureUseCount.length; i++)
      assert(this.resolveTextureUseCount[i] === 0);
    for (let i = 0; i < this.renderTargetAliveForID.length; i++)
      assert(this.renderTargetAliveForID[i] === undefined);

    // Now go through and kill anything that's over our age threshold (hasn't been used in a bit)
    const ageThreshold = 1;

    for (let i = 0; i < this.renderTargetDeadPool.length; i++) {
      if (this.renderTargetDeadPool[i].age >= ageThreshold) {
        this.renderTargetDeadPool[i].destroy();
        this.renderTargetDeadPool.splice(i--, 1);
      }
    }

    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++) {
      if (this.singleSampledTextureDeadPool[i].age >= ageThreshold) {
        this.singleSampledTextureDeadPool[i].destroy();
        this.singleSampledTextureDeadPool.splice(i--, 1);
      }
    }

    // Clear out our transient scheduling state.
    this.renderTargetResolveCount.length = 0;
    this.renderTargetOutputCount.length = 0;
    this.resolveTextureUseCount.length = 0;
  }
  // #endregion

  // #region Execution
  private execPass(pass: RenderGraphPass): void {
    assert(this.currentPass === null);
    this.currentPass = pass;

    const renderPass = this.device.createRenderPass(pass.descriptor);
    renderPass.pushDebugGroup(pass.debugName);

    renderPass.setViewport(
      pass.viewportX,
      pass.viewportY,
      pass.viewportW,
      pass.viewportH,
    );

    if (pass.execFunc !== null) pass.execFunc(renderPass, this);

    renderPass.popDebugGroup();
    this.device.submitPass(renderPass);

    if (pass.postFunc !== null) pass.postFunc(this);

    this.currentPass = null;
  }

  private execGraph(graph: GraphImpl) {
    this.scheduleGraph(graph);

    this.device.beginFrame();
    graph.passes.forEach((pass) => {
      this.execPass(pass);
    });
    this.device.endFrame();
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
  // #endregion

  // #region GfxrGraphBuilderDebug
  getPasses(): RenderGraphPass[] {
    return this.currentGraph.passes;
  }

  getPassDebugThumbnails(pass: RenderGraphPass): boolean[] {
    return pass.debugThumbnails;
  }

  getPassRenderTargetID(pass: RenderGraphPass, slot: RGAttachmentSlot): number {
    return pass.renderTargetIDs[slot];
  }

  getRenderTargetIDDebugName(renderTargetID: number): string {
    return this.currentGraph.renderTargetDebugNames[renderTargetID];
  }
  // #endregion

  // #region GfxrPassScope
  getResolveTextureForID(resolveTextureID: number): Texture {
    const currentGraphPass = this.currentPass;
    const i = currentGraphPass.resolveTextureInputIDs.indexOf(resolveTextureID);
    assert(i >= 0);
    return assertExists(currentGraphPass.resolveTextureInputTextures[i]);
  }

  getRenderTargetAttachment(slot: RGAttachmentSlot): RenderTarget | null {
    const currentGraphPass = this.currentPass;
    const renderTarget = currentGraphPass.renderTargets[slot];
    if (!renderTarget) return null;
    return renderTarget.attachment;
  }

  getRenderTargetTexture(slot: RGAttachmentSlot): Texture | null {
    const currentGraphPass = this.currentPass;
    const renderTarget = currentGraphPass.renderTargets[slot];
    if (!renderTarget) return null;
    return renderTarget.texture;
  }
  // #endregion

  newGraphBuilder(): RGGraphBuilder {
    this.beginGraphBuilder();
    return this;
  }

  destroy(): void {
    // At the time this is called, we shouldn't have anything alive.
    for (let i = 0; i < this.renderTargetAliveForID.length; i++)
      assert(this.renderTargetAliveForID[i] === undefined);
    for (
      let i = 0;
      i < this.singleSampledTextureForResolveTextureID.length;
      i++
    )
      assert(this.singleSampledTextureForResolveTextureID[i] === undefined);

    for (let i = 0; i < this.renderTargetDeadPool.length; i++)
      this.renderTargetDeadPool[i].destroy();
    for (let i = 0; i < this.singleSampledTextureDeadPool.length; i++)
      this.singleSampledTextureDeadPool[i].destroy();
  }
}
