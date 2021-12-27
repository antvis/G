import { Material, Texture2D, CullMode, IMaterial } from '@antv/g-plugin-webgl-renderer';

export class ShaderMaterial extends Material {
  constructor(props?: Partial<IMaterial>) {
    super({
      cullMode: CullMode.Back,
      ...props,
    });

    this.defines = {
      ...this.defines,
      USE_UV: false,
      USE_MAP: false,
      USE_WIREFRAME: false,
      USE_FOG: false,
      USE_LIGHT: false,
    };
  }
}
