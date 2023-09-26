import type { Device } from '@antv/g-device-api';
import type { IMaterial } from './Material';
import { Material } from './Material';

export class ShaderMaterial extends Material {
  constructor(device: Device, props?: Partial<IMaterial>) {
    super(device, {
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
