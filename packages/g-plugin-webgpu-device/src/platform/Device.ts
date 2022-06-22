import type {
  BindingLayoutDescriptor,
  BindingLayoutSamplerDescriptor,
  Bindings,
  BindingsDescriptor,
  Buffer,
  BufferDescriptor,
  ComputePass,
  ComputePassDescriptor,
  ComputePipeline,
  ComputePipelineDescriptor,
  DebugGroup,
  Device,
  DeviceLimits,
  IndexBufferDescriptor,
  InputLayout,
  InputLayoutDescriptor,
  InputState,
  Program,
  ProgramDescriptor,
  ProgramDescriptorSimple,
  QueryPool,
  QueryPoolType,
  Readback,
  RenderPass,
  RenderPassDescriptor,
  RenderPipeline,
  RenderPipelineDescriptor,
  RenderTarget,
  RenderTargetDescriptor,
  Resource,
  Sampler,
  SamplerDescriptor,
  SwapChain,
  Texture,
  TextureDescriptor,
  VendorInfo,
  VertexBufferDescriptor,
} from '@antv/g-plugin-device-renderer';
import {
  assert,
  bindingLayoutDescriptorEqual,
  ClipSpaceNearZ,
  defaultBindingLayoutSamplerDescriptor,
  Format,
  HashMap,
  MipFilterMode,
  nullHashFunc,
  ResourceType,
  SamplerFormatKind,
  TexFilterMode,
  TextureDimension,
  TextureUsage,
  ViewportOrigin,
  WrapMode,
} from '@antv/g-plugin-device-renderer';
import type { glsl_compile as glsl_compile_ } from '../../../../rust/pkg/glsl_wgsl_compiler';
import { Bindings_WebGPU } from './Bindings';
import { Buffer_WebGPU } from './Buffer';
import { ComputePass_WebGPU } from './ComputePass';
import { ComputePipeline_WebGPU } from './ComputePipeline';
import { GPUTextureUsage } from './constants';
import { InputLayout_WebGPU } from './InputLayout';
import { InputState_WebGPU } from './InputState';
import type {
  Attachment_WebGPU,
  BindGroupLayout,
  IDevice_WebGPU,
  TextureSharedDescriptor,
  TextureShared_WebGPU,
} from './interfaces';
import { Program_WebGPU } from './Program';
// import { FullscreenAlphaClear } from './FullscreenAlphaClear';
import { QueryPool_WebGPU } from './QueryPool';
import { Readback_WebGPU } from './Readback';
import { RenderPass_WebGPU } from './RenderPass';
import { RenderPipeline_WebGPU } from './RenderPipeline';
import { Sampler_WebGPU } from './Sampler';
import { Texture_WebGPU } from './Texture';
import {
  getFormatBlockSize,
  isFormatTextureCompressionBC,
  translateBindGroupTextureBinding,
  translateDepthStencilState,
  translatePrimitiveState,
  translateTargets,
  translateTextureDimension,
  translateTextureFormat,
  translateTextureUsage,
} from './utils';

export class Device_WebGPU implements SwapChain, IDevice_WebGPU {
  private swapChainWidth = 0;
  private swapChainHeight = 0;
  private swapChainTextureUsage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST;
  private _resourceUniqueId: number = 0;

  private renderPassPool: RenderPass_WebGPU[] = [];
  private computePassPool: ComputePass_WebGPU[] = [];

  bindGroupLayoutCache = new HashMap<BindingLayoutDescriptor, BindGroupLayout>(
    bindingLayoutDescriptorEqual,
    nullHashFunc,
  );

  private fallbackTexture2D: Texture_WebGPU;
  private fallbackTexture2DDepth: Texture_WebGPU;
  private fallbackTexture2DArray: Texture_WebGPU;
  private fallbackTexture3D: Texture_WebGPU;
  private fallbackTextureCube: Texture_WebGPU;
  fallbackSampler: Sampler;
  private featureTextureCompressionBC: boolean = false;

  // private fullscreenAlphaClear: FullscreenAlphaClear;

  // VendorInfo
  readonly platformString: string = 'WebGPU';
  readonly glslVersion = `#version 440`;
  readonly explicitBindingLocations = true;
  readonly separateSamplerTextures = true;
  readonly viewportOrigin = ViewportOrigin.UpperLeft;
  readonly clipSpaceNearZ = ClipSpaceNearZ.Zero;
  readonly supportsSyncPipelineCompilation: boolean = false;
  readonly supportMRT: boolean = true;

  private adapter: GPUAdapter;
  device: GPUDevice;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  canvasContext: GPUCanvasContext;
  glsl_compile: typeof glsl_compile_;

  constructor(
    adapter: GPUAdapter,
    device: GPUDevice,
    canvas: HTMLCanvasElement | OffscreenCanvas,
    canvasContext: GPUCanvasContext,
    glsl_compile: typeof glsl_compile_,
  ) {
    this.adapter = adapter;
    this.device = device;
    this.canvas = canvas;
    this.canvasContext = canvasContext;
    this.glsl_compile = glsl_compile;

    this.fallbackTexture2D = this.createFallbackTexture(
      TextureDimension.n2D,
      SamplerFormatKind.Float,
    );
    this.fallbackTexture2DDepth = this.createFallbackTexture(
      TextureDimension.n2D,
      SamplerFormatKind.Depth,
    );
    this.fallbackTexture2DArray = this.createFallbackTexture(
      TextureDimension.n2DArray,
      SamplerFormatKind.Float,
    );
    this.fallbackTexture3D = this.createFallbackTexture(
      TextureDimension.n3D,
      SamplerFormatKind.Float,
    );
    this.fallbackTextureCube = this.createFallbackTexture(
      TextureDimension.Cube,
      SamplerFormatKind.Float,
    );

    this.fallbackSampler = this.createSampler({
      wrapS: WrapMode.Clamp,
      wrapT: WrapMode.Clamp,
      minFilter: TexFilterMode.Point,
      magFilter: TexFilterMode.Point,
      mipFilter: MipFilterMode.NoMip,
    });

    // Firefox doesn't support GPUDevice.features yet...
    if (this.device.features) {
      this.featureTextureCompressionBC = this.device.features.has('texture-compression-bc');
    }

    this.device.onuncapturederror = (event) => {
      console.error(event.error);
    };

    // this.fullscreenAlphaClear = new FullscreenAlphaClear(this.device);
  }

  // SwapChain
  configureSwapChain(width: number, height: number): void {
    if (this.swapChainWidth === width && this.swapChainHeight === height) return;
    this.swapChainWidth = width;
    this.swapChainHeight = height;
    // @see https://www.w3.org/TR/webgpu/#canvas-configuration
    this.canvasContext.configure({
      device: this.device,
      format: 'bgra8unorm',
      usage: this.swapChainTextureUsage,
      // @see https://developer.chrome.com/blog/new-in-chrome-94/#canvas-colorspace
      // colorSpace: 'srgb',
      // @see https://www.w3.org/TR/webgpu/#enumdef-gpucanvascompositingalphamode
      compositingAlphaMode: 'premultiplied',
    });
  }

  getOnscreenTexture(): Texture {
    // @see https://www.w3.org/TR/webgpu/#dom-gpucanvascontext-getcurrenttexture
    const gpuTexture = this.canvasContext.getCurrentTexture();
    const gpuTextureView = gpuTexture.createView();

    const texture = new Texture_WebGPU({
      id: 0,
      device: this,
      descriptor: {
        pixelFormat: Format.U8_RGBA_RT,
        width: this.swapChainWidth,
        height: this.swapChainHeight,
        depth: 0,
        dimension: TextureDimension.n2D,
        numLevels: 1,
        usage: this.swapChainTextureUsage,
      },
      skipCreate: true,
    });

    texture.depthOrArrayLayers = 1;
    texture.sampleCount = 1;
    texture.gpuTexture = gpuTexture;
    texture.gpuTextureView = gpuTextureView;

    return texture;
  }

  getDevice(): Device {
    return this;
  }

  getCanvas(): HTMLCanvasElement | OffscreenCanvas {
    return this.canvas;
  }

  present(): void {
    // this.fullscreenAlphaClear.render(
    //   this.device,
    //   this.canvasContext.getCurrentTexture().createView(),
    // );
  }

  private getNextUniqueId(): number {
    return ++this._resourceUniqueId;
  }

  createBuffer(descriptor: BufferDescriptor): Buffer {
    return new Buffer_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createTexture(descriptor: TextureDescriptor): Texture {
    return new Texture_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpudevice-createsampler
   * @see https://www.w3.org/TR/webgpu/#GPUSamplerDescriptor
   */
  createSampler(descriptor: SamplerDescriptor): Sampler {
    return new Sampler_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createRenderTarget(descriptor: RenderTargetDescriptor): RenderTarget {
    const texture = new Texture_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor: {
        ...descriptor,
        dimension: TextureDimension.n2D,
        numLevels: 1,
        depth: 1,
        usage: TextureUsage.RenderTarget,
      },
    }) as unknown as Attachment_WebGPU;

    texture.depthOrArrayLayers = 1;
    texture.type = ResourceType.RenderTarget;
    return texture;
  }

  createRenderTargetFromTexture(texture: Texture): RenderTarget {
    const {
      pixelFormat,
      width,
      height,
      depthOrArrayLayers,
      sampleCount,
      numLevels,
      gpuTexture,
      gpuTextureView,
      usage,
    } = texture as Texture_WebGPU;

    assert(!!(usage & GPUTextureUsage.RENDER_ATTACHMENT));

    const attachment = new Texture_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor: {
        pixelFormat,
        width,
        height,
        depth: depthOrArrayLayers,
        dimension: TextureDimension.n2D,
        numLevels,
        usage,
      },
      skipCreate: true,
    }) as unknown as Attachment_WebGPU;

    attachment.depthOrArrayLayers = depthOrArrayLayers;
    attachment.sampleCount = sampleCount;
    attachment.gpuTexture = gpuTexture;
    attachment.gpuTextureView = gpuTextureView;
    return attachment as unknown as RenderTarget;
  }

  createProgram(descriptor: ProgramDescriptor): Program {
    descriptor.ensurePreprocessed(this);
    return this.createProgramSimple(descriptor);
  }

  createProgramSimple(descriptor: ProgramDescriptorSimple): Program {
    return new Program_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createTextureShared(
    descriptor: TextureSharedDescriptor,
    texture: TextureShared_WebGPU,
    skipCreate: boolean,
  ) {
    const size: GPUExtent3D = {
      width: descriptor.width,
      height: descriptor.height,
      depthOrArrayLayers: descriptor.depthOrArrayLayers,
    };
    const mipLevelCount = descriptor.numLevels;
    const format = translateTextureFormat(descriptor.pixelFormat);
    const dimension = translateTextureDimension(descriptor.dimension);
    const usage = translateTextureUsage(descriptor.usage);

    texture.format = format;
    texture.dimension = descriptor.dimension;
    texture.pixelFormat = descriptor.pixelFormat;
    texture.width = descriptor.width;
    texture.height = descriptor.height;
    texture.depthOrArrayLayers = descriptor.depthOrArrayLayers;
    texture.numLevels = mipLevelCount;
    texture.usage = usage;
    texture.sampleCount = 1;

    if (!skipCreate) {
      const gpuTexture = this.device.createTexture({
        size,
        mipLevelCount,
        format,
        dimension,
        usage,
      });
      const gpuTextureView = gpuTexture.createView();
      texture.gpuTexture = gpuTexture;
      texture.gpuTextureView = gpuTextureView;
    }
  }

  getFallbackTexture(samplerEntry: BindingLayoutSamplerDescriptor): Texture {
    const dimension = samplerEntry.dimension,
      formatKind = samplerEntry.formatKind;
    if (dimension === TextureDimension.n2D)
      return formatKind === SamplerFormatKind.Depth
        ? this.fallbackTexture2DDepth
        : this.fallbackTexture2D;
    else if (dimension === TextureDimension.n2DArray) return this.fallbackTexture2DArray;
    else if (dimension === TextureDimension.n3D) return this.fallbackTexture3D;
    else if (dimension === TextureDimension.Cube) return this.fallbackTextureCube;
    else throw new Error('whoops');
  }

  private createFallbackTexture(
    dimension: TextureDimension,
    formatKind: SamplerFormatKind,
  ): Texture_WebGPU {
    const depth = dimension === TextureDimension.Cube ? 6 : 1;
    const pixelFormat = formatKind === SamplerFormatKind.Float ? Format.U8_RGBA_NORM : Format.D24;
    return this.createTexture({
      dimension,
      pixelFormat,
      usage: TextureUsage.Sampled,
      width: 1,
      height: 1,
      depth,
      numLevels: 1,
    }) as Texture_WebGPU;
  }

  createBindings(descriptor: BindingsDescriptor): Bindings {
    return new Bindings_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createInputLayout(descriptor: InputLayoutDescriptor): InputLayout {
    return new InputLayout_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createInputState(
    inputLayout: InputLayout,
    vertexBuffers: (VertexBufferDescriptor | null)[],
    indexBuffer: IndexBufferDescriptor | null,
  ): InputState {
    // InputState is a GL-only thing, as VAOs suck. We emulate it with a VAO-alike here.
    return new InputState_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      inputLayout,
      vertexBuffers,
      indexBuffer,
    });
  }

  createComputePipeline(descriptor: ComputePipelineDescriptor): ComputePipeline {
    return new ComputePipeline_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createRenderPipeline(descriptor: RenderPipelineDescriptor): RenderPipeline {
    return new RenderPipeline_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor: {
        ...descriptor,
        // isCreatingAsync: false,
      },
    });
  }

  createQueryPool(type: QueryPoolType, elemCount: number): QueryPool {
    return new QueryPool_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
      descriptor: {
        type,
        elemCount,
      },
    });
  }

  _createBindGroupLayout(bindingLayout: BindingLayoutDescriptor): BindGroupLayout {
    let gpuBindGroupLayout = this.bindGroupLayoutCache.get(bindingLayout);
    if (gpuBindGroupLayout === null) {
      gpuBindGroupLayout = this._createBindGroupLayoutInternal(bindingLayout);
      this.bindGroupLayoutCache.add(bindingLayout, gpuBindGroupLayout);
    }
    return gpuBindGroupLayout;
  }

  private _createBindGroupLayoutInternal(bindingLayout: BindingLayoutDescriptor): BindGroupLayout {
    const entries: GPUBindGroupLayoutEntry[][] = [[], []];

    if (bindingLayout.storageEntries) {
      for (let i = 0; i < bindingLayout.storageEntries.length; i++) {
        entries[0].push({
          binding: entries[0].length,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: bindingLayout.storageEntries[i].type },
        });
      }
    }

    for (let i = 0; i < bindingLayout.numUniformBuffers; i++)
      entries[0].push({
        binding: entries[0].length,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform', hasDynamicOffset: true },
      });

    for (let i = 0; i < bindingLayout.numSamplers; i++) {
      const samplerEntry =
        bindingLayout.samplerEntries !== undefined
          ? bindingLayout.samplerEntries[i]
          : defaultBindingLayoutSamplerDescriptor;
      entries[1].push({
        binding: entries[1].length,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        texture: translateBindGroupTextureBinding(samplerEntry),
      });
      entries[1].push({
        binding: entries[1].length,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        sampler: { type: 'filtering' },
      });
    }

    const gpuBindGroupLayout = entries.map((entries) =>
      this.device.createBindGroupLayout({ entries }),
    );
    return { gpuBindGroupLayout };
  }

  private _createPipelineLayout(bindingLayouts: BindingLayoutDescriptor[]): GPUPipelineLayout {
    const bindGroupLayouts = bindingLayouts.flatMap(
      (bindingLayout) => this._createBindGroupLayout(bindingLayout).gpuBindGroupLayout,
    );
    return this.device.createPipelineLayout({ bindGroupLayouts });
  }

  _createRenderPipeline(renderPipeline: RenderPipeline_WebGPU, async = false) {
    if (renderPipeline.isCreating) return;

    if (renderPipeline.gpuRenderPipeline !== null) return;

    const descriptor = renderPipeline.descriptor;
    const program = descriptor.program as Program_WebGPU;
    const vertexStage = program.vertexStage,
      fragmentStage = program.fragmentStage;
    if (vertexStage === null || fragmentStage === null) return;

    const layout = this._createPipelineLayout(descriptor.bindingLayouts);
    const primitive = translatePrimitiveState(descriptor.topology, descriptor.megaStateDescriptor);
    const targets = translateTargets(
      descriptor.colorAttachmentFormats,
      descriptor.megaStateDescriptor,
    );
    const depthStencil = translateDepthStencilState(
      descriptor.depthStencilAttachmentFormat,
      descriptor.megaStateDescriptor,
    );

    let buffers: GPUVertexBufferLayout[] | undefined = undefined;
    if (descriptor.inputLayout !== null)
      buffers = (descriptor.inputLayout as InputLayout_WebGPU).buffers;
    const sampleCount = descriptor.sampleCount;

    renderPipeline.isCreating = true;

    const gpuRenderPipeline: GPURenderPipelineDescriptor = {
      layout,
      vertex: {
        ...vertexStage,
        buffers,
      },
      primitive,
      depthStencil,
      multisample: {
        count: sampleCount,
      },
      fragment: {
        ...fragmentStage,
        targets,
      },
    };

    // TODO: async creation
    // @see https://www.w3.org/TR/webgpu/#dom-gpudevice-createrenderpipeline
    renderPipeline.gpuRenderPipeline = this.device.createRenderPipeline(gpuRenderPipeline);

    if (renderPipeline.name !== undefined)
      renderPipeline.gpuRenderPipeline.label = renderPipeline.name;
  }

  createReadback(): Readback {
    return new Readback_WebGPU({
      id: this.getNextUniqueId(),
      device: this,
    });
  }

  destroyRenderTarget(o: RenderTarget): void {
    const attachment = o as unknown as Attachment_WebGPU;
    attachment.gpuTexture.destroy();
  }

  createRenderPass(renderPassDescriptor: RenderPassDescriptor): RenderPass {
    let pass = this.renderPassPool.pop();
    if (pass === undefined) {
      pass = new RenderPass_WebGPU();
    }
    pass.commandEncoder = this.device.createCommandEncoder();
    pass.beginRenderPass(renderPassDescriptor);
    return pass;
  }

  createComputePass(computePassDescriptor: ComputePassDescriptor): ComputePass {
    let pass = this.computePassPool.pop();
    if (pass === undefined) pass = new ComputePass_WebGPU();
    pass.commandEncoder = this.device.createCommandEncoder();
    pass.beginComputePass(computePassDescriptor);
    return pass;
  }

  submitPass(_pass: RenderPass | ComputePass): void {
    const queue = this.device.queue;

    const pass = _pass as RenderPass_WebGPU | ComputePass_WebGPU;
    const commands = pass.finish();
    queue.submit([commands]);
    pass.commandEncoder = null;

    if (pass instanceof RenderPass_WebGPU) {
      this.renderPassPool.push(pass);
    } else {
      this.computePassPool.push(pass);
    }
  }

  copySubTexture2D(
    dst_: Texture,
    dstX: number,
    dstY: number,
    src_: Texture,
    srcX: number,
    srcY: number,
  ): void {
    const cmd = this.device.createCommandEncoder();

    const dst = dst_ as Texture_WebGPU;
    const src = src_ as Texture_WebGPU;
    const srcCopy: GPUImageCopyTexture = { texture: src.gpuTexture, origin: [srcX, srcY, 0] };
    const dstCopy: GPUImageCopyTexture = { texture: dst.gpuTexture, origin: [dstX, dstY, 0] };
    assert(!!(src.usage & GPUTextureUsage.COPY_SRC));
    assert(!!(dst.usage & GPUTextureUsage.COPY_DST));
    cmd.copyTextureToTexture(srcCopy, dstCopy, [src.width, src.height, 1]);

    this.device.queue.submit([cmd.finish()]);
  }

  queryLimits(): DeviceLimits {
    // TODO: GPUAdapter.limits
    // @see https://www.w3.org/TR/webgpu/#gpu-supportedlimits
    return {
      uniformBufferMaxPageWordSize: 0x1000,
      uniformBufferWordAlignment: 0x40,
      supportedSampleCounts: [1],
    };
  }

  queryTextureFormatSupported(format: Format, width: number, height: number): boolean {
    if (isFormatTextureCompressionBC(format)) {
      if (!this.featureTextureCompressionBC) return false;

      const bb = getFormatBlockSize(format);
      if (width % bb !== 0 || height % bb !== 0) return false;
      return this.featureTextureCompressionBC;
    }

    switch (format) {
      case Format.U16_RGBA_NORM:
        return false;
      case Format.F32_RGBA:
        return false; // unfilterable
    }

    return true;
  }

  queryPlatformAvailable(): boolean {
    return true;
  }

  queryVendorInfo(): VendorInfo {
    return this;
  }

  queryRenderPass(o: RenderPass): Readonly<RenderPassDescriptor> {
    const pass = o as RenderPass_WebGPU;
    return pass.descriptor;
  }

  queryRenderTarget(o: RenderTarget): Readonly<RenderTargetDescriptor> {
    const attachment = o as unknown as Attachment_WebGPU;
    return attachment;
  }

  setResourceName(o: Resource, s: string): void {
    o.name = s;

    if (o.type === ResourceType.Buffer) {
      const r = o as Buffer_WebGPU;
      r.gpuBuffer.label = s;
    } else if (o.type === ResourceType.Texture) {
      const r = o as Texture_WebGPU;
      r.gpuTexture.label = s;
      r.gpuTextureView.label = s;
    } else if (o.type === ResourceType.RenderTarget) {
      const r = o as unknown as Attachment_WebGPU;
      r.gpuTexture.label = s;
      r.gpuTextureView.label = s;
    } else if (o.type === ResourceType.Sampler) {
      const r = o as Sampler_WebGPU;
      r.gpuSampler.label = s;
    } else if (o.type === ResourceType.RenderPipeline) {
      const r = o as RenderPipeline_WebGPU;
      if (r.gpuRenderPipeline !== null) r.gpuRenderPipeline.label = s;
    }
  }

  setResourceLeakCheck(o: Resource, v: boolean): void {}

  checkForLeaks(): void {}

  programPatched(o: Program): void {}

  pushDebugGroup(debugGroup: DebugGroup): void {}

  popDebugGroup(): void {}

  pipelineQueryReady(o: RenderPipeline): boolean {
    const renderPipeline = o as RenderPipeline_WebGPU;
    return renderPipeline.gpuRenderPipeline !== null;
  }

  pipelineForceReady(o: RenderPipeline): void {
    const renderPipeline = o as RenderPipeline_WebGPU;
    this._createRenderPipeline(renderPipeline, false);
  }
}
