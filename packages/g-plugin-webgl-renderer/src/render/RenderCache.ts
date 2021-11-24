import {
  AttachmentState,
  BindingLayoutDescriptor,
  Bindings,
  BindingsDescriptor,
  ChannelBlendState,
  Color,
  Device,
  InputLayout,
  InputLayoutDescriptor,
  MegaStateDescriptor,
  Program,
  ProgramDescriptorSimple,
  RenderPipeline,
  RenderPipelineDescriptor,
  Sampler,
  SamplerDescriptor,
  VendorInfo,
} from '../platform';
import { assert } from '../platform/utils';
import {
  bindingsDescriptorCopy,
  bindingsDescriptorEquals,
  inputLayoutDescriptorCopy,
  inputLayoutDescriptorEquals,
  renderPipelineDescriptorCopy,
  renderPipelineDescriptorEquals,
  samplerDescriptorEquals,
} from '../platform/utils/hash';
import { hashCodeNumberFinish, hashCodeNumberUpdate, HashMap, nullHashFunc } from './HashMap';

function programDescriptorSimpleEquals(
  a: ProgramDescriptorSimple,
  b: ProgramDescriptorSimple,
): boolean {
  assert(a.preprocessedVert !== '' && b.preprocessedVert !== '');
  assert(a.preprocessedFrag !== '' && b.preprocessedFrag !== '');
  return a.preprocessedVert === b.preprocessedVert && a.preprocessedFrag === b.preprocessedFrag;
}

function programDescriptorSimpleCopy(a: ProgramDescriptorSimple): ProgramDescriptorSimple {
  const preprocessedVert = a.preprocessedVert;
  const preprocessedFrag = a.preprocessedFrag;
  return { preprocessedVert, preprocessedFrag };
}

function renderBindingLayoutHash(hash: number, a: BindingLayoutDescriptor): number {
  hash = hashCodeNumberUpdate(hash, a.numUniformBuffers);
  hash = hashCodeNumberUpdate(hash, a.numSamplers);
  return hash;
}

function blendStateHash(hash: number, a: ChannelBlendState): number {
  hash = hashCodeNumberUpdate(hash, a.blendMode);
  hash = hashCodeNumberUpdate(hash, a.blendSrcFactor);
  hash = hashCodeNumberUpdate(hash, a.blendDstFactor);
  return hash;
}

function attachmentStateHash(hash: number, a: AttachmentState): number {
  hash = blendStateHash(hash, a.rgbBlendState);
  hash = blendStateHash(hash, a.alphaBlendState);
  hash = hashCodeNumberUpdate(hash, a.channelWriteMask);
  return hash;
}

function colorHash(hash: number, a: Color): number {
  hash = hashCodeNumberUpdate(hash, (a.r << 24) | (a.g << 16) | (a.b << 8) | a.a);
  return hash;
}

function megaStateDescriptorHash(hash: number, a: MegaStateDescriptor): number {
  for (let i = 0; i < a.attachmentsState.length; i++)
    hash = attachmentStateHash(hash, a.attachmentsState[i]);
  hash = colorHash(hash, a.blendConstant);
  hash = hashCodeNumberUpdate(hash, a.depthCompare);
  hash = hashCodeNumberUpdate(hash, a.depthWrite ? 1 : 0);
  hash = hashCodeNumberUpdate(hash, a.stencilCompare);
  hash = hashCodeNumberUpdate(hash, a.stencilPassOp);
  hash = hashCodeNumberUpdate(hash, a.stencilWrite ? 1 : 0);
  hash = hashCodeNumberUpdate(hash, a.cullMode);
  hash = hashCodeNumberUpdate(hash, a.frontFace ? 1 : 0);
  hash = hashCodeNumberUpdate(hash, a.polygonOffset ? 1 : 0);
  return hash;
}

function renderPipelineDescriptorHash(a: RenderPipelineDescriptor): number {
  let hash = 0;
  hash = hashCodeNumberUpdate(hash, a.program.id);
  if (a.inputLayout !== null) hash = hashCodeNumberUpdate(hash, a.inputLayout.id);
  for (let i = 0; i < a.bindingLayouts.length; i++)
    hash = renderBindingLayoutHash(hash, a.bindingLayouts[i]);
  hash = megaStateDescriptorHash(hash, a.megaStateDescriptor);
  for (let i = 0; i < a.colorAttachmentFormats.length; i++)
    hash = hashCodeNumberUpdate(hash, a.colorAttachmentFormats[i] || 0);
  hash = hashCodeNumberUpdate(hash, a.depthStencilAttachmentFormat || 0);
  return hashCodeNumberFinish(hash);
}

function bindingsDescriptorHash(a: BindingsDescriptor): number {
  let hash: number = 0;
  for (let i = 0; i < a.samplerBindings.length; i++) {
    const binding = a.samplerBindings[i];
    if (binding !== null && binding.texture !== null)
      hash = hashCodeNumberUpdate(hash, binding.texture.id);
  }
  for (let i = 0; i < a.uniformBufferBindings.length; i++) {
    const binding = a.uniformBufferBindings[i];
    if (binding !== null && binding.buffer !== null) {
      hash = hashCodeNumberUpdate(hash, binding.buffer.id);
      hash = hashCodeNumberUpdate(hash, binding.wordCount);
    }
  }
  return hashCodeNumberFinish(hash);
}

interface ProgramDescriptor extends ProgramDescriptorSimple {
  ensurePreprocessed(vendorInfo: VendorInfo): void;
}

export class RenderCache {
  device: Device;

  private bindingsCache = new HashMap<BindingsDescriptor, Bindings>(
    bindingsDescriptorEquals,
    bindingsDescriptorHash,
  );
  private renderPipelinesCache = new HashMap<RenderPipelineDescriptor, RenderPipeline>(
    renderPipelineDescriptorEquals,
    renderPipelineDescriptorHash,
  );
  private inputLayoutsCache = new HashMap<InputLayoutDescriptor, InputLayout>(
    inputLayoutDescriptorEquals,
    nullHashFunc,
  );
  private programCache = new HashMap<ProgramDescriptorSimple, Program>(
    programDescriptorSimpleEquals,
    nullHashFunc,
  );
  private samplerCache = new HashMap<SamplerDescriptor, Sampler>(
    samplerDescriptorEquals,
    nullHashFunc,
  );

  constructor(device: Device) {
    this.device = device;
  }

  createBindings(descriptor: BindingsDescriptor): Bindings {
    let bindings = this.bindingsCache.get(descriptor);
    if (bindings === null) {
      const descriptorCopy = bindingsDescriptorCopy(descriptor);
      bindings = this.device.createBindings(descriptorCopy);
      this.bindingsCache.add(descriptorCopy, bindings);
    }
    return bindings;
  }

  createRenderPipeline(descriptor: RenderPipelineDescriptor): RenderPipeline {
    let renderPipeline = this.renderPipelinesCache.get(descriptor);
    if (renderPipeline === null) {
      const descriptorCopy = renderPipelineDescriptorCopy(descriptor);
      renderPipeline = this.device.createRenderPipeline(descriptorCopy);
      this.renderPipelinesCache.add(descriptorCopy, renderPipeline);
    }
    return renderPipeline;
  }

  createInputLayout(descriptor: InputLayoutDescriptor): InputLayout {
    let inputLayout = this.inputLayoutsCache.get(descriptor);
    if (inputLayout === null) {
      const descriptorCopy = inputLayoutDescriptorCopy(descriptor);
      inputLayout = this.device.createInputLayout(descriptorCopy);
      this.inputLayoutsCache.add(descriptorCopy, inputLayout);
    }
    return inputLayout;
  }

  createProgramSimple(programDescriptorSimple: ProgramDescriptorSimple): Program {
    let program = this.programCache.get(programDescriptorSimple);
    if (program === null) {
      const descriptorCopy = programDescriptorSimpleCopy(programDescriptorSimple);
      program = this.device.createProgramSimple(descriptorCopy);
      this.programCache.add(descriptorCopy, program);

      // // TODO(jstpierre): Ugliness
      // if ('associate' in (programDescriptorSimple as any)) {
      //   const gfxProgramDescriptor = programDescriptorSimple as ProgramDescriptor;
      //   // @ts-ignore
      //   gfxProgramDescriptor.associate(this.device, program);
      //   (descriptorCopy as any).orig = gfxProgramDescriptor;
      // }
    }

    return program;
  }

  createProgram(programDescriptor: ProgramDescriptor): Program {
    programDescriptor.ensurePreprocessed(this.device.queryVendorInfo());
    return this.createProgramSimple(programDescriptor);
  }

  createSampler(descriptor: SamplerDescriptor): Sampler {
    let sampler = this.samplerCache.get(descriptor);
    if (sampler === null) {
      sampler = this.device.createSampler(descriptor);
      this.samplerCache.add(descriptor, sampler);
    }
    return sampler;
  }

  destroy(): void {
    for (const bindings of this.bindingsCache.values()) bindings.destroy();
    for (const renderPipeline of this.renderPipelinesCache.values()) renderPipeline.destroy();
    for (const inputLayout of this.inputLayoutsCache.values()) inputLayout.destroy();
    for (const program of this.programCache.values()) program.destroy();
    for (const sampler of this.samplerCache.values()) sampler.destroy();
    this.bindingsCache.clear();
    this.renderPipelinesCache.clear();
    this.inputLayoutsCache.clear();
    this.programCache.clear();
    this.samplerCache.clear();
  }
}
