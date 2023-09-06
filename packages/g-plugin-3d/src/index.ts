import { AbstractRendererPlugin } from '@antv/g-lite';
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
  GL,
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
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
  VertexStepMode,
  WrapMode,
} from '@antv/g-plugin-device-renderer';

export * from './geometries';
export * from './lights';
export * from './materials';
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
  VertexStepMode,
  WrapMode,
};

export class Plugin extends AbstractRendererPlugin {
  name = '3d';

  init(): void {}
  destroy(): void {}
}
