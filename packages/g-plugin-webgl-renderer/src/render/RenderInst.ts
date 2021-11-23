import {
  RenderPipelineDescriptor,
  BindingsDescriptor,
  InputState,
  PrimitiveTopology,
  Program,
  MegaStateDescriptor,
  InputLayout,
  BindingLayoutDescriptor,
  SamplerBinding,
  Device,
  RenderPass,
} from '../platform';
import {
  assert,
  assertExists,
  copyMegaState,
  defaultMegaState,
  nArray,
  setBitFlagEnabled,
  setMegaStateFlags,
} from '../platform/utils';
import { DynamicUniformBuffer } from './DynamicUniformBuffer';
import { RenderCache } from './RenderCache';

export const enum RenderInstFlags {
  Indexed = 1 << 0,
  AllowSkippingIfPipelineNotReady = 1 << 1,

  // Mostly for error checking.
  Template = 1 << 2,
  Draw = 1 << 3,

  // Which flags are inherited from templates...
  InheritedFlags = Indexed | AllowSkippingIfPipelineNotReady,
}

export class RenderInst {
  sortKey: number = 0;

  // Debugging pointer for whomever wants it...
  debug: any = null;

  // Pipeline building.
  renderPipelineDescriptor: RenderPipelineDescriptor;

  // Bindings building.
  private uniformBuffer: DynamicUniformBuffer;
  private bindingDescriptors: BindingsDescriptor[] = nArray(1, () => ({
    bindingLayout: null!,
    samplerBindings: [],
    uniformBufferBindings: [],
  }));
  private dynamicUniformBufferByteOffsets: number[] = nArray(4, () => 0);

  flags: RenderInstFlags = 0;
  private inputState: InputState | null = null;
  private drawStart: number = 0;
  private drawCount: number = 0;
  private drawInstanceCount: number = 0;

  constructor() {
    this.renderPipelineDescriptor = {
      bindingLayouts: [],
      inputLayout: null,
      megaStateDescriptor: copyMegaState(defaultMegaState),
      program: null!,
      topology: PrimitiveTopology.Triangles,
      colorAttachmentFormats: [],
      depthStencilAttachmentFormat: null,
      sampleCount: 1,
    };

    this.reset();
  }

  /**
   * Resets a render inst to be boring, so it can re-enter the pool.
   * Normally, you should not need to call this.
   */
  reset(): void {
    this.sortKey = 0;
    this.flags = RenderInstFlags.AllowSkippingIfPipelineNotReady;
    this.inputState = null;
    this.renderPipelineDescriptor.inputLayout = null;
  }

  /**
   * Copies the fields from another render inst {@param o} to this render inst.
   * Normally, you should not need to call this.
   */
  setFromTemplate(o: RenderInst): void {
    setMegaStateFlags(
      this.renderPipelineDescriptor.megaStateDescriptor,
      o.renderPipelineDescriptor.megaStateDescriptor,
    );
    this.renderPipelineDescriptor.program = o.renderPipelineDescriptor.program;
    this.renderPipelineDescriptor.inputLayout = o.renderPipelineDescriptor.inputLayout;
    this.renderPipelineDescriptor.topology = o.renderPipelineDescriptor.topology;
    this.renderPipelineDescriptor.colorAttachmentFormats.length = Math.max(
      this.renderPipelineDescriptor.colorAttachmentFormats.length,
      o.renderPipelineDescriptor.colorAttachmentFormats.length,
    );
    for (let i = 0; i < o.renderPipelineDescriptor.colorAttachmentFormats.length; i++)
      this.renderPipelineDescriptor.colorAttachmentFormats[i] =
        o.renderPipelineDescriptor.colorAttachmentFormats[i];
    this.renderPipelineDescriptor.depthStencilAttachmentFormat =
      o.renderPipelineDescriptor.depthStencilAttachmentFormat;
    this.renderPipelineDescriptor.sampleCount = o.renderPipelineDescriptor.sampleCount;
    this.inputState = o.inputState;
    this.uniformBuffer = o.uniformBuffer;
    this.drawCount = o.drawCount;
    this.drawStart = o.drawStart;
    this.drawInstanceCount = o.drawInstanceCount;
    this.flags =
      (this.flags & ~RenderInstFlags.InheritedFlags) | (o.flags & RenderInstFlags.InheritedFlags);
    this.sortKey = o.sortKey;
    const tbd = this.bindingDescriptors[0],
      obd = o.bindingDescriptors[0];
    if (obd.bindingLayout !== null) this.setBindingLayout(obd.bindingLayout);
    for (
      let i = 0;
      i < Math.min(tbd.uniformBufferBindings.length, obd.uniformBufferBindings.length);
      i++
    )
      tbd.uniformBufferBindings[i].wordCount =
        o.bindingDescriptors[0].uniformBufferBindings[i].wordCount;
    this.setSamplerBindingsFromTextureMappings(obd.samplerBindings);
    for (let i = 0; i < o.dynamicUniformBufferByteOffsets.length; i++)
      this.dynamicUniformBufferByteOffsets[i] = o.dynamicUniformBufferByteOffsets[i];
  }

  /**
   * Set the {@see Program} that this render inst will render with. This is part of the automatic
   * pipeline building facilities. At render time, a pipeline will be automatically and constructed from
   * the pipeline parameters.
   */
  setProgram(program: Program): void {
    this.renderPipelineDescriptor.program = program;
  }

  /**
   * Set the {@see MegaStateDescriptor} that this render inst will render with. This is part of the automatic
   * pipeline building facilities. At render time, a pipeline will be automatically and constructed from
   * the pipeline parameters.
   */
  setMegaStateFlags(r: Partial<MegaStateDescriptor>): MegaStateDescriptor {
    setMegaStateFlags(this.renderPipelineDescriptor.megaStateDescriptor, r);
    return this.renderPipelineDescriptor.megaStateDescriptor;
  }

  /**
   * Retrieve the {@see MegaStateDescriptor} property bag that this will render with. This is similar to
   * {@see setMegaStateFlags} but allows you to set fields directly on the internal property bag, rather than
   * merge them. This can be slightly more efficient.
   */
  getMegaStateFlags(): MegaStateDescriptor {
    return this.renderPipelineDescriptor.megaStateDescriptor;
  }

  /**
   * Sets both the {@see InputLayout} and {@see InputState} to be used by this render instance.
   * The {@see InputLayout} is used to construct the pipeline as part of the automatic pipeline building
   * facilities, while {@see InputState} is used for the render.
   */
  setInputLayoutAndState(inputLayout: InputLayout | null, inputState: InputState | null): void {
    this.inputState = inputState;
    this.renderPipelineDescriptor.inputLayout = inputLayout;
  }

  private setBindingLayout(bindingLayout: BindingLayoutDescriptor): void {
    assert(bindingLayout.numUniformBuffers < this.dynamicUniformBufferByteOffsets.length);
    this.renderPipelineDescriptor.bindingLayouts[0] = bindingLayout;
    this.bindingDescriptors[0].bindingLayout = bindingLayout;

    for (
      let i = this.bindingDescriptors[0].uniformBufferBindings.length;
      i < bindingLayout.numUniformBuffers;
      i++
    )
      this.bindingDescriptors[0].uniformBufferBindings.push({ buffer: null!, wordCount: 0 });
    for (
      let i = this.bindingDescriptors[0].samplerBindings.length;
      i < bindingLayout.numSamplers;
      i++
    )
      this.bindingDescriptors[0].samplerBindings.push({
        sampler: null,
        texture: null,
        lateBinding: null,
      });
  }

  /**
   * Sets the {@see BindingLayoutDescriptor}s that this render inst will render with.
   */
  setBindingLayouts(bindingLayouts: BindingLayoutDescriptor[]): void {
    assert(bindingLayouts.length <= this.bindingDescriptors.length);
    assert(bindingLayouts.length === 1);
    this.setBindingLayout(bindingLayouts[0]);
  }

  drawIndexes(indexCount: number, indexStart: number = 0): void {
    this.flags = setBitFlagEnabled(this.flags, RenderInstFlags.Indexed, true);
    this.drawCount = indexCount;
    this.drawStart = indexStart;
    this.drawInstanceCount = 1;
    // this.drawInstanceCount = 0;
  }

  drawIndexesInstanced(indexCount: number, instanceCount: number, indexStart: number = 0): void {
    this.flags = setBitFlagEnabled(this.flags, RenderInstFlags.Indexed, true);
    this.drawCount = indexCount;
    this.drawStart = indexStart;
    this.drawInstanceCount = instanceCount;
  }

  drawPrimitives(primitiveCount: number, primitiveStart: number = 0): void {
    this.flags = setBitFlagEnabled(this.flags, RenderInstFlags.Indexed, false);
    this.drawCount = primitiveCount;
    this.drawStart = primitiveStart;
    this.drawInstanceCount = 1;
    // this.drawInstanceCount = 0;
  }

  setUniformBuffer(uniformBuffer: DynamicUniformBuffer): void {
    this.uniformBuffer = uniformBuffer;
  }

  /**
   * Allocates {@param wordCount} words from the uniform buffer and assigns it to the buffer
   * slot at index {@param bufferIndex}. As a convenience, this also directly returns the same
   * offset into the uniform buffer, in words, that would be returned by a subsequent call to
   * {@see getUniformBufferOffset}.
   */
  allocateUniformBuffer(bufferIndex: number, wordCount: number): number {
    assert(
      this.bindingDescriptors[0].bindingLayout.numUniformBuffers <
        this.dynamicUniformBufferByteOffsets.length,
    );
    this.dynamicUniformBufferByteOffsets[bufferIndex] =
      this.uniformBuffer.allocateChunk(wordCount) << 2;

    const dst = this.bindingDescriptors[0].uniformBufferBindings[bufferIndex];
    dst.wordCount = wordCount;
    return this.getUniformBufferOffset(bufferIndex);
  }

  /**
   * Returns the offset into the uniform buffer, in words, that is assigned to the buffer slot
   * at index {@param bufferIndex}, to be used with e.g. {@see mapUniformBufferF32}.
   */
  getUniformBufferOffset(bufferIndex: number) {
    const wordOffset = this.dynamicUniformBufferByteOffsets[bufferIndex] >>> 2;
    return wordOffset;
  }

  /**
   * Directly sets the uniform buffer assigned to the buffer slot at index {@param bufferIndex}
   * to be {@param wordOffset}. Use this if you have already allocated a uniform buffer chunk through
   * some other means and wish to directly assign it to this render inst.
   */
  setUniformBufferOffset(bufferIndex: number, wordOffset: number, wordCount: number): void {
    this.dynamicUniformBufferByteOffsets[bufferIndex] = wordOffset << 2;

    const dst = this.bindingDescriptors[0].uniformBufferBindings[bufferIndex];
    dst.wordCount = wordCount;
  }

  /**
   * This is a convenience wrapper for {@see RenderDynamicUniformBuffer.mapBufferF32}, but uses
   * the values previously assigned for the uniform buffer slot at index {@param bufferIndex}.
   * Like {@see RenderDynamicUniformBuffer.mapBufferF32}, this does not return a slice for the
   * buffer; you need to write to it with the correct uniform buffer offset; this will usually be
   * returned by {@see allocateUniformBuffer}.
   */
  mapUniformBufferF32(bufferIndex: number): Float32Array {
    return this.uniformBuffer.mapBufferF32();
  }

  /**
   * Retrieve the {@see RenderDynamicUniformBuffer} that this render inst will use to allocate.
   */
  getUniformBuffer(): DynamicUniformBuffer {
    return this.uniformBuffer;
  }

  /**
   * Sets the {@param SamplerBinding}s in use by this render instance.
   *
   * Note that {@see RenderInst} has a method of doing late binding, intended to solve cases where live render
   * targets are used, which can have difficult control flow consequences for users. Pass a string instead of a
   * SamplerBinding to record that it can be resolved later, and use {@see RenderInst.resolveLateSamplerBinding}
   * or equivalent to fill it in later.
   */
  setSamplerBindingsFromTextureMappings(m: (SamplerBinding | null)[]): void {
    for (let i = 0; i < this.bindingDescriptors[0].samplerBindings.length; i++) {
      const dst = this.bindingDescriptors[0].samplerBindings[i];
      const binding = m[i];

      if (binding === undefined || binding === null) {
        dst.texture = null;
        dst.sampler = null;
        dst.lateBinding = null;
        continue;
      }

      dst.texture = binding.texture;
      dst.sampler = binding.sampler;
      dst.lateBinding = binding.lateBinding;
    }
  }

  hasLateSamplerBinding(name: string): boolean {
    for (let i = 0; i < this.bindingDescriptors[0].samplerBindings.length; i++) {
      const dst = this.bindingDescriptors[0].samplerBindings[i];
      if (dst.lateBinding === name) return true;
    }

    return false;
  }

  /**
   * Resolve a previously registered "late bound" sampler binding for the given {@param name} to the provided
   * {@param binding}, as registered through {@see setSamplerBindingsFromTextureMappings}.
   *
   * This is intended to be called by high-level code, and is especially helpful when juggling render targets
   * for framebuffer effects.
   */
  resolveLateSamplerBinding(name: string, binding: SamplerBinding | null): void {
    for (let i = 0; i < this.bindingDescriptors[0].samplerBindings.length; i++) {
      const dst = this.bindingDescriptors[0].samplerBindings[i];
      if (dst.lateBinding === name) {
        if (binding === null) {
          dst.texture = null;
          dst.sampler = null;
        } else {
          assert(binding.lateBinding === null);
          dst.texture = binding.texture;
          if (binding.sampler !== null) dst.sampler = binding.sampler;
        }

        dst.lateBinding = null;
      }
    }
  }

  /**
   * Tests whether the underlying pipeline for this {@see RenderInst} is ready.
   *
   * By default, {@see RenderInstManager} will skip any insts with non-ready pipelines. If you wish
   * to override this and force the render inst to draw, please use {@see setAllowSkippingIfPipelineNotReady}.
   */
  queryPipelineReady(cache: RenderCache): boolean {
    const gfxPipeline = cache.createRenderPipeline(this.renderPipelineDescriptor);
    return cache.device.queryPipelineReady(gfxPipeline);
  }

  /**
   * Sets whether this render inst should be skipped if the render pipeline isn't ready.
   *
   * Some draws of objects can be skipped if the pipelines aren't ready. Others are more
   * crucial to draw, and so this can be set to force for the pipeline to become available.
   *
   * By default, this is true.
   */
  setAllowSkippingIfPipelineNotReady(v: boolean): void {
    this.flags = setBitFlagEnabled(this.flags, RenderInstFlags.AllowSkippingIfPipelineNotReady, v);
  }

  private setAttachmentFormatsFromRenderPass(device: Device, passRenderer: RenderPass): void {
    const passDescriptor = device.queryRenderPass(passRenderer);

    let sampleCount = -1;
    for (let i = 0; i < passDescriptor.colorAttachment.length; i++) {
      const colorAttachmentDescriptor =
        passDescriptor.colorAttachment[i] !== null
          ? device.queryRenderTarget(passDescriptor.colorAttachment[i]!)
          : null;
      this.renderPipelineDescriptor.colorAttachmentFormats[i] =
        colorAttachmentDescriptor !== null ? colorAttachmentDescriptor.pixelFormat : null;
      if (colorAttachmentDescriptor !== null) {
        if (sampleCount === -1) sampleCount = colorAttachmentDescriptor.sampleCount;
        else assert(sampleCount === colorAttachmentDescriptor.sampleCount);
      }
    }

    const depthStencilAttachmentDescriptor =
      passDescriptor.depthStencilAttachment !== null
        ? device.queryRenderTarget(passDescriptor.depthStencilAttachment)
        : null;
    this.renderPipelineDescriptor.depthStencilAttachmentFormat =
      depthStencilAttachmentDescriptor !== null
        ? depthStencilAttachmentDescriptor.pixelFormat
        : null;

    this.renderPipelineDescriptor.sampleCount = sampleCount;
  }

  drawOnPass(cache: RenderCache, passRenderer: RenderPass): boolean {
    const device = cache.device;
    this.setAttachmentFormatsFromRenderPass(device, passRenderer);

    const gfxPipeline = cache.createRenderPipeline(this.renderPipelineDescriptor);

    const pipelineReady = device.queryPipelineReady(gfxPipeline);
    if (!pipelineReady) {
      const needsToSkip = !device.queryVendorInfo().supportsSyncPipelineCompilation;
      if (needsToSkip || !!(this.flags & RenderInstFlags.AllowSkippingIfPipelineNotReady))
        return false;
    }

    passRenderer.setPipeline(gfxPipeline);

    passRenderer.setInputState(this.inputState);

    for (let i = 0; i < this.bindingDescriptors[0].uniformBufferBindings.length; i++)
      this.bindingDescriptors[0].uniformBufferBindings[i].buffer = assertExists(
        this.uniformBuffer.buffer,
      );

    // TODO: Support multiple binding descriptors.
    const gfxBindings = cache.createBindings({
      ...this.bindingDescriptors[0],
      pipeline: gfxPipeline,
    });
    passRenderer.setBindings(0, gfxBindings, this.dynamicUniformBufferByteOffsets);

    // if (this.drawInstanceCount > 0) {
    if (this.drawInstanceCount > 1) {
      assert(!!(this.flags & RenderInstFlags.Indexed));
      passRenderer.drawIndexedInstanced(this.drawCount, this.drawStart, this.drawInstanceCount);
    } else if (this.flags & RenderInstFlags.Indexed) {
      passRenderer.drawIndexed(this.drawCount, this.drawStart);
    } else {
      passRenderer.draw(this.drawCount, this.drawStart);
    }

    return true;
  }
}
