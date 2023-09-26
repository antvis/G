import type { IMaterial } from '@antv/g-plugin-device-renderer';
import { Material } from '@antv/g-plugin-device-renderer';
import { Texture, Device, CullMode } from '@antv/g-device-api';
import vert from '../shaders/point.vert';
import frag from '../shaders/point.frag';

enum Uniform {
  MAP = 'u_Map',
  PLACE_HOLDER = 'u_Placeholder',
  SIZE = 'u_Size',
}

export interface IPointMaterial extends IMaterial {
  /**
   * gl_PointSize
   */
  size?: number;

  /**
   * color map, will override fill color
   */
  map?: Texture;
}

/**
 * not affected by lights
 * @see https://threejs.org/docs/#api/en/materials/PointMaterial
 */
export class PointMaterial<T extends IPointMaterial> extends Material<T> {
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

  get size() {
    return this.props.size;
  }
  set size(v) {
    this.props.size = v;
    this.setUniforms({
      [Uniform.SIZE]: v,
    });
  }

  constructor(device: Device, props?: Partial<IPointMaterial>) {
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

    const { map, size } = props || {};
    if (map) {
      this.map = map;
    }

    this.setUniforms({
      [Uniform.PLACE_HOLDER]: [0, 0, 0, 0],
      [Uniform.SIZE]: size || 1,
    });
  }
}
