import { Material, IMaterial } from './Material';

export class ShaderMaterial extends Material {
  constructor(props?: Partial<IMaterial>) {
    super({
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
