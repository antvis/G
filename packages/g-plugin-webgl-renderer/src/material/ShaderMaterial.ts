import { Material } from './Material';

export class ShaderMaterial extends Material {
  defines: Record<string, number | boolean> = {};

  vertexShader = '';
  fragmentShader = '';
}
