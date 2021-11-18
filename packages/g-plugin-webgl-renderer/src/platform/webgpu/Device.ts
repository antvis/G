import { GPUTextureUsage } from './constants';
import {
  SwapChain,
  Device,
  Sampler,
  Buffer,
  BindingLayoutDescriptor,
  ViewportOrigin,
  ClipSpaceNearZ,
  makeTextureDescriptor2D,
  WrapMode,
  TexFilterMode,
  MipFilterMode,
  TextureDescriptor,
  SamplerDescriptor,
  RenderTargetDescriptor,
  RenderTarget,
  TextureDimension,
  TextureUsage,
  ProgramDescriptorSimple,
  Program,
  BindingsDescriptor,
  Bindings,
  InputLayoutDescriptor,
  InputLayout,
  VertexBufferDescriptor,
  IndexBufferDescriptor,
  InputState,
  RenderPipelineDescriptor,
  RenderPipeline,
  Readback,
  RenderPassDescriptor,
  RenderPass,
  DeviceLimits,
  VendorInfo,
  DebugGroup,
  ComputePipelineDescriptor,
  ComputePipeline,
  ComputePass,
  ComputePassDescriptor,
} from '../interfaces';
import {
  BindGroupLayout,
  Attachment_WebGPU,
  TextureSharedDescriptor,
  TextureShared_WebGPU,
  IDevice_WebGPU,
} from './interfaces';

import { BufferDescriptor, Resource, ResourceType, Texture } from '../interfaces';
import { Bindings_WebGPU } from './Bindings';
import { Buffer_WebGPU } from './Buffer';
import { InputLayout_WebGPU } from './InputLayout';
import { Program_WebGPU } from './Program';
import { RenderPass_WebGPU } from './RenderPass';
import { Sampler_WebGPU } from './Sampler';
import { Texture_WebGPU } from './Texture';
import { InputState_WebGPU } from './InputState';
import { RenderPipeline_WebGPU } from './RenderPipeline';
import { Readback_WebGPU } from './Readback';
import {
  getPlatformBuffer,
  isFormatTextureCompressionBC,
  translateDepthStencilState,
  translateImageLayout,
  translatePrimitiveState,
  translateTargets,
  translateTextureDimension,
  translateTextureFormat,
  translateTextureUsage,
} from './utils';
import { assert, align, bindingLayoutDescriptorEqual } from '../utils';
import { HashMap, nullHashFunc } from '../../render/HashMap';
import { Format } from '../format';
import { ComputePass_WebGPU } from './ComputePass';
import { ComputePipeline_WebGPU } from './ComputePipeline';
import type { glsl_compile as glsl_compile_ } from '../../../../../rust/pkg/index';

export class Device_WebGPU implements SwapChain, Device, IDevice_WebGPU {
  private swapChainWidth = 0;
  private swapChainHeight = 0;
  private swapChainTextureUsage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST;
  private _resourceUniqueId: number = 0;

  private renderPassPool: RenderPass_WebGPU[] = [];
  private computePassPool: ComputePass_WebGPU[] = [];
  fallbackTexture: Texture;
  fallbackSampler: Sampler;
  private _featureTextureCompressionBC: boolean = false;

  private _bindGroupLayoutCache = new HashMap<BindingLayoutDescriptor, BindGroupLayout>(
    bindingLayoutDescriptorEqual,
    nullHashFunc,
  );

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
  private canvasContext: GPUCanvasContext;
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

    this.fallbackTexture = this.createTexture(
      makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
    );
    this.fallbackSampler = this.createSampler({
      wrapS: WrapMode.Clamp,
      wrapT: WrapMode.Clamp,
      minFilter: TexFilterMode.Point,
      magFilter: TexFilterMode.Point,
      mipFilter: MipFilterMode.NoMip,
    });

    // Firefox doesn't support GPUDevice.features yet...
    if (this.device.features)
      this._featureTextureCompressionBC = this.device.features.has('texture-compression-bc');

    this.device.onuncapturederror = (event) => {
      console.error(event.error);
    };
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

  present(): void {}

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
    return attachment;
  }

  createProgram(descriptor: ProgramDescriptorSimple): Program {
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

  // private createBindGroupLayoutInternal(bindingLayout: BindingLayoutDescriptor): BindGroupLayout {
  //   const entries: GPUBindGroupLayoutEntry[][] = [[], []];

  //   /**
  //    * entries order: Storage(read-only storage) Uniform Sampler
  //    * @see https://www.w3.org/TR/webgpu/#enumdef-gpubufferbindingtype
  //    */
  //   let entriesIndex = 0;
  //   for (let i = 0; i < bindingLayout.numReadOnlyStorageBuffers; i++) {
  //     entries[entriesIndex].push({
  //       binding: entries[entriesIndex].length,
  //       visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
  //       buffer: { type: 'read-only-storage' },
  //     });
  //   }
  //   if (bindingLayout.numReadOnlyStorageBuffers) {
  //     entriesIndex++;
  //   }

  //   for (let i = 0; i < bindingLayout.numStorageBuffers; i++) {
  //     entries[entriesIndex].push({
  //       binding: entries[entriesIndex].length,
  //       visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
  //       buffer: { type: 'storage' },
  //     });
  //   }
  //   if (bindingLayout.numStorageBuffers) {
  //     entriesIndex++;
  //   }

  //   for (let i = 0; i < bindingLayout.numUniformBuffers; i++) {
  //     entries[entriesIndex].push({
  //       binding: entries[entriesIndex].length,
  //       visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
  //       buffer: { type: 'uniform', hasDynamicOffset: true },
  //     });
  //   }
  //   if (bindingLayout.numUniformBuffers) {
  //     entriesIndex++;
  //   }

  //   for (let i = 0; i < bindingLayout.numSamplers; i++) {
  //     // TODO(jstpierre): This doesn't work for depth textures
  //     entries[entriesIndex].push({
  //       binding: entries[entriesIndex].length,
  //       visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
  //       texture: { sampleType: 'float' },
  //     });
  //     entries[entriesIndex].push({
  //       binding: entries[entriesIndex].length,
  //       visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
  //       sampler: { type: 'filtering' },
  //     });
  //   }
  //   if (bindingLayout.numSamplers) {
  //     entriesIndex++;
  //   }

  //   const gpuBindGroupLayout = entries.map((entries) =>
  //     this.device.createBindGroupLayout({ entries }),
  //   );
  //   return { gpuBindGroupLayout };
  // }

  // private createBindGroupLayout(bindingLayout: BindingLayoutDescriptor): BindGroupLayout {
  //   let gpuBindGroupLayout = this._bindGroupLayoutCache.get(bindingLayout);
  //   if (gpuBindGroupLayout === null) {
  //     gpuBindGroupLayout = this.createBindGroupLayoutInternal(bindingLayout);
  //     this._bindGroupLayoutCache.add(bindingLayout, gpuBindGroupLayout);
  //   }
  //   return gpuBindGroupLayout;
  // }

  createBindings(descriptor: BindingsDescriptor): Bindings {
    if (descriptor.pipeline) {
    }

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
      descriptor,
    });
  }

  ensureRenderPipeline(renderPipeline: RenderPipeline_WebGPU) {
    if (renderPipeline.isCreating) return;

    if (renderPipeline.gpuRenderPipeline !== null) return;

    const descriptor = renderPipeline.descriptor;
    const program = descriptor.program as Program_WebGPU;
    const vertexStage = program.vertexStage,
      fragmentStage = program.fragmentStage;
    if (vertexStage === null || fragmentStage === null) return;

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
    const attachment = o as Attachment_WebGPU;
    attachment.gpuTexture.destroy();
  }

  createRenderPass(renderPassDescriptor: RenderPassDescriptor): RenderPass {
    let pass = this.renderPassPool.pop();
    if (pass === undefined) pass = new RenderPass_WebGPU();
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

  submitPass(o: RenderPass | ComputePass): void {
    const queue = this.device.queue;

    const pass = o as RenderPass_WebGPU | ComputePass_WebGPU;
    const commands = pass.finish();
    queue.submit([commands]);
    pass.commandEncoder = null;

    if (o instanceof RenderPass_WebGPU) {
      this.renderPassPool.push(o);
    } else {
      this.computePassPool.push(o as ComputePass_WebGPU);
    }
  }

  uploadTextureData(texture_: Texture, firstMipLevel: number, levelDatas: ArrayBufferView[]): void {
    const texture = texture_ as Texture_WebGPU;
    const destination: GPUImageCopyTexture = {
      texture: texture.gpuTexture,
    };
    const layout: GPUImageDataLayout = {};
    const size: GPUExtent3DStrict = { width: 0, height: 0, depthOrArrayLayers: 1 };

    for (let i = 0; i < levelDatas.length; i++) {
      const mipLevel = firstMipLevel + i;
      destination.mipLevel = mipLevel;

      const mipWidth = texture.width >>> mipLevel;
      const mipHeight = texture.height >>> mipLevel;

      size.width = mipWidth;
      size.height = mipHeight;

      translateImageLayout(layout, texture.pixelFormat, mipWidth, mipHeight);

      this.device.queue.writeTexture(destination, levelDatas[i], layout, size);
    }
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

  queryTextureFormatSupported(format: Format): boolean {
    if (isFormatTextureCompressionBC(format)) return this._featureTextureCompressionBC;
    return true;
  }

  queryPipelineReady(o: RenderPipeline): boolean {
    const renderPipeline = o as RenderPipeline_WebGPU;
    this.ensureRenderPipeline(renderPipeline);
    return renderPipeline.gpuRenderPipeline !== null;
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
    const attachment = o as Attachment_WebGPU;
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
      const r = o as Attachment_WebGPU;
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
}
