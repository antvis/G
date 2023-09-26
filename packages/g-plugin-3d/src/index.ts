import { AbstractRendererPlugin } from '@antv/g-lite';
import {
  BufferGeometry,
  Fog,
  FogType,
  Light,
  Material,
  Mesh,
  ShaderMaterial,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from '@antv/g-plugin-device-renderer';
import {
  BlendFactor,
  BlendMode,
  BufferFrequencyHint,
  ChannelWriteMask,
  CompareFunction,
  CullMode,
  Format,
  FrontFace,
  GL,
  MipmapFilterMode,
  PrimitiveTopology,
  SamplerFormatKind,
  StencilOp,
  TextureDimension,
  TextureUsage,
  VertexStepMode,
  AddressMode,
} from '@antv/g-device-api';

export * from './geometries';
export * from './lights';
export * from './materials';
export {
  BlendFactor,
  BlendMode,
  BufferFrequencyHint,
  BufferGeometry,
  ChannelWriteMask,
  CompareFunction,
  CullMode,
  Fog,
  FogType,
  Format,
  FrontFace,
  Light,
  Material,
  Mesh,
  MipmapFilterMode,
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
  AddressMode,
};

export class Plugin extends AbstractRendererPlugin {
  name = '3d';

  init(): void {}
  destroy(): void {}
}
