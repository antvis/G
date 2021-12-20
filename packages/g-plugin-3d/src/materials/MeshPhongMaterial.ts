import { Texture2D } from '@antv/g-plugin-webgl-renderer';
import { MeshBasicMaterial, MeshBasicMaterialProps } from './MeshBasicMaterial';
import vert from '../shaders/material.phong.vert';
import frag from '../shaders/material.phong.frag';

export interface MeshPhongMaterialProps extends MeshBasicMaterialProps {
  emissive: string;
  shininess: number;
  specular: string;
  specularMap: string | TexImageSource | Texture2D;
  bumpMap: string | TexImageSource | Texture2D;
  bumpScale: number;
  doubleSide: boolean;
}

export class MeshPhongMaterial extends MeshBasicMaterial {
  constructor(props?: MeshPhongMaterialProps) {
    super({
      vertexShader: vert,
      fragmentShader: frag,
      emissive: 'black',
      specular: '#111111',
      shininess: 30,
      bumpScale: 1,
      doubleSide: false,
      ...props,
    });

    const { specularMap, bumpMap, doubleSide } = props || {};
    this.setSpecularMap(specularMap);
    this.setBumpMap(bumpMap);
    this.setDoubleSide(doubleSide);
  }

  protected setAttribute<Key extends keyof MeshPhongMaterialProps>(
    name: Key,
    value: MeshPhongMaterialProps[Key],
  ) {
    // @ts-ignore
    super.setAttribute(name, value);
    if (name === 'specularMap') {
      this.setSpecularMap(value as MeshPhongMaterialProps['specularMap']);
    } else if (name === 'bumpMap') {
      this.setBumpMap(value as MeshPhongMaterialProps['bumpMap']);
    } else if (name === 'doubleSide') {
      this.setDoubleSide(value as MeshPhongMaterialProps['doubleSide']);
    }
  }

  private setSpecularMap(map: string | TexImageSource | Texture2D) {
    this.defines.USE_SPECULARMAP = !!map;
    this.addTexture(map, 'specular-map');
  }

  private setBumpMap(map: string | TexImageSource | Texture2D) {
    this.defines.USE_BUMPMAP = !!map;
    this.addTexture(map, 'bump-map');
  }

  private setDoubleSide(enabled: boolean) {
    this.defines.USE_DOUBLESIDE = enabled;
  }

  getUniformWordCount() {
    // vec3 u_Emissive;
    // float u_Shininess;
    // vec3 u_Specular;
    // vec3 u_AmbientLightColor;
    return 4 + 4 + 4;
  }
}
