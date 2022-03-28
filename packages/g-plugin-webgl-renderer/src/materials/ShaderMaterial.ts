import { VertexAttributeLocation } from '../meshes/Instanced';
import { Device } from '../platform';
import { enumToObject } from '../utils/enum';
import { Material, IMaterial } from './Material';

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
      ...enumToObject(VertexAttributeLocation),
    };
  }
}
