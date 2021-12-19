import { Material, Texture2D, MaterialProps, CullMode } from '@antv/g-plugin-webgl-renderer';
import vert from '../shaders/material.basic.vert';
import frag from '../shaders/material.basic.frag';

export interface MeshBasicMaterialProps extends MaterialProps {
  /**
   * color map, will override fill color
   */
  map?: string | TexImageSource | Texture2D;

  /**
   * AO map
   */
  aoMap?: string | TexImageSource | Texture2D;
}

/**
 * not affected by lights
 * @see https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
 */
export class MeshBasicMaterial extends Material<MeshBasicMaterialProps> {
  constructor(props?: MeshBasicMaterialProps) {
    super({
      vertexShader: vert,
      fragmentShader: frag,
      cullMode: CullMode.Back,
      ...props,
    });

    this.defines = {
      USE_UV: true,
      USE_MAP: false,
      USE_WIREFRAME: false,
      USE_FOG: false,
    };

    const { map, wireframe } = props || {};
    this.setMap(map);
    this.setWireframe(wireframe);
    this.setFog();
  }

  getUniformWordCount() {
    // vec3 u_Emissive;
    // float u_Shininess;
    // vec3 u_Specular;
    // vec3 u_AmbientLightColor;
    return 4 + 4 + 4;
  }

  protected setAttribute<Key extends keyof MeshBasicMaterialProps>(
    name: Key,
    value: MeshBasicMaterialProps[Key],
  ) {
    super.setAttribute(name, value);
    if (name === 'map') {
      this.setMap(value as MeshBasicMaterialProps['map']);
    } else if (
      name === 'fogType' ||
      name === 'fogColor' ||
      name === 'fogStart' ||
      name === 'fogEnd' ||
      name === 'fogDensity'
    ) {
      this.setFog();
    }
  }

  private setMap(map: string | TexImageSource | Texture2D) {
    // set MAP define
    this.defines.USE_MAP = !!map;

    this.addTexture(map, 'map');
  }

  private setWireframe(wireframe: boolean) {
    this.defines.USE_WIREFRAME = !!wireframe;
  }

  private setFog() {
    this.defines.USE_FOG = !!this.props.fogType;
  }
}
