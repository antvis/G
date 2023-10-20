import type { IMaterial } from '@antv/g-plugin-device-renderer';
import { Material } from '@antv/g-plugin-device-renderer';
import { Texture, Device, CullMode } from '@antv/g-device-api';
import vert from '../shaders/material.basic.vert';
import frag from '../shaders/material.basic.frag';

enum Uniform {
  MAP = 'u_Map',
  PLACE_HOLDER = 'u_Placeholder',
}

export interface IMeshBasicMaterial extends IMaterial {
  /**
   * color map, will override fill color
   */
  map?: Texture;

  /**
   * AO map
   */
  aoMap?: Texture;
}

/**
 * not affected by lights
 * @see https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
 */
export class MeshBasicMaterial<
  T extends IMeshBasicMaterial,
> extends Material<T> {
  /**
   * color map, will override fill color
   */
  get map() {
    return this.props.map;
  }
  set map(v) {
    if (this.props.map !== v) {
      this.props.map = v;
      this.programDirty = true;
    }

    this.setUniforms({
      [Uniform.MAP]: v,
    });
  }

  /**
   * AO map
   */
  get aoMap() {
    return this.props.aoMap;
  }
  set aoMap(v) {
    this.props.aoMap = v;
  }

  constructor(device: Device, props?: Partial<IMeshBasicMaterial>) {
    super(device, {
      vertexShader: vert,
      fragmentShader: frag,
      cullMode: CullMode.BACK,
      ...props,
    });

    this.defines = {
      ...this.defines,
      USE_UV: true,
      USE_MAP: false,
      USE_WIREFRAME: false,
      USE_FOG: false,
      USE_LIGHT: false,
    };

    const { map, wireframe } = props || {};
    if (map) {
      this.map = map;
    }
    this.wireframe = wireframe;

    this.setUniforms({
      [Uniform.PLACE_HOLDER]: [0, 0, 0, 0],
    });
  }
}
