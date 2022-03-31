import type {
  TextureDimension,
  TextureUsage,
  RenderTarget,
  RenderPipeline,
  Texture,
  Sampler,
  Device,
  BindingLayoutSamplerDescriptor,
} from '../interfaces';
import type { Format } from '../format';

export interface TextureSharedDescriptor {
  dimension: TextureDimension;
  pixelFormat: Format;
  width: number;
  height: number;
  depthOrArrayLayers: number;
  numLevels: number;
  sampleCount: number;
  usage: TextureUsage;
}

export interface TextureShared_WebGPU {
  format: GPUTextureFormat;
  dimension: TextureDimension;
  pixelFormat: Format;
  width: number;
  height: number;
  depthOrArrayLayers: number;
  numLevels: number;
  sampleCount: number;
  usage: GPUTextureUsageFlags;
  gpuTexture: GPUTexture;
  gpuTextureView: GPUTextureView;
}

export interface Attachment_WebGPU extends TextureShared_WebGPU, RenderTarget {}

export interface BindGroupLayout {
  gpuBindGroupLayout: GPUBindGroupLayout[];
}

export interface IDevice_WebGPU extends Device {
  device: GPUDevice;
  fallbackSampler: Sampler;

  getFallbackTexture: (samplerEntry: BindingLayoutSamplerDescriptor) => Texture;
  createTextureShared: (
    descriptor: TextureSharedDescriptor,
    texture: TextureShared_WebGPU,
    skipCreate: boolean,
  ) => void;
  ensureRenderPipeline: (renderPipeline: RenderPipeline) => void;
  // createBindGroupLayout(bindingLayout: Partial<BindingLayoutDescriptor>): BindGroupLayout;
  // createPipelineLayout(bindingLayouts: BindingLayoutDescriptor[]): GPUPipelineLayout;
}
