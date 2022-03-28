import type { RendererPlugin } from '@antv/g';
import { Module } from 'mana-syringe';
import type { Syringe } from 'mana-syringe';
import {
  BlendFactor,
  BlendMode,
  BufferFrequencyHint,
  BufferGeometry,
  ChannelWriteMask,
  CompareMode,
  CullMode,
  Fog,
  FogType,
  Format,
  FrontFaceMode,
  GPUMapMode,
  GPUTextureUsage,
  Light,
  Material,
  Mesh,
  MipFilterMode,
  PrimitiveTopology,
  SamplerFormatKind,
  ShaderMaterial,
  StencilOp,
  TextureDimension,
  TextureUsage,
  GL,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
  VertexBufferFrequency,
  WrapMode,
} from '@antv/g-plugin-webgl-renderer';

export * from './geometries';
export * from './materials';
export * from './lights';
export {
  BlendFactor,
  BlendMode,
  BufferFrequencyHint,
  BufferGeometry,
  ChannelWriteMask,
  CompareMode,
  CullMode,
  Fog,
  FogType,
  Format,
  FrontFaceMode,
  GPUMapMode,
  GPUTextureUsage,
  Light,
  Material,
  Mesh,
  MipFilterMode,
  PrimitiveTopology,
  SamplerFormatKind,
  ShaderMaterial,
  StencilOp,
  TextureDimension,
  TextureUsage,
  GL,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
  VertexBufferFrequency,
  WrapMode,
};

export const containerModule = Module((register) => {});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
