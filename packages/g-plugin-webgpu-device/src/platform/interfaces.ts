import type {
  Format,
  TextureDimension,
  TextureUsage,
  RenderTarget,
  Device,
} from '@antv/g-plugin-device-renderer';

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
  createTextureShared: (
    descriptor: TextureSharedDescriptor,
    texture: TextureShared_WebGPU,
    skipCreate: boolean,
  ) => void;
}
