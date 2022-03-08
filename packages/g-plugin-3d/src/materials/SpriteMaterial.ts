import {
  Material,
  CullMode,
  IMaterial,
  VertexAttributeLocation,
  Texture,
  Device,
} from '@antv/g-plugin-webgl-renderer';
import vert from '../shaders/material.sprite.vert';
import frag from '../shaders/material.sprite.frag';

enum Uniform {
  MAP = 'u_Map',
  PLACE_HOLDER = 'u_Placeholder',
  POINT_SIZE = 'u_PointSize',
}
enum SamplerLocation {
  MAP = 0,
}

export interface ISpriteBasicMaterial extends IMaterial {
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
export class SpriteMaterial<T extends ISpriteBasicMaterial> extends Material<T> {
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

    this.defines.USE_MAP = !!v;
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

  constructor(device: Device, props?: Partial<ISpriteBasicMaterial>) {
    super(device, {
      vertexShader: vert,
      fragmentShader: frag,
      cullMode: CullMode.Back,
      ...props,
    });

    this.defines = {
      ...this.defines,
      USE_MAP: false,
      USE_FOG: false,
      USE_LIGHT: false,
      POSITION: VertexAttributeLocation.MAX,
      BARYCENTRIC: VertexAttributeLocation.MAX + 3,
    };

    const { map } = props || {};
    if (map) {
      this.map = map;
    }

    this.setUniforms({
      [Uniform.PLACE_HOLDER]: [0, 0, 0, 0],
      [Uniform.POINT_SIZE]: 10.0,
    });
  }
}
