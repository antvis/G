import { parseColor, Tuple4Number } from '@antv/g';
import { Format, Texture2D, VertexAttributeLocation } from '@antv/g-plugin-webgl-renderer';
import { MeshBasicMaterial, IMeshBasicMaterial } from './MeshBasicMaterial';
import vert from '../shaders/material.phong.vert';
import frag from '../shaders/material.phong.frag';

export interface IMeshPhongMaterial extends IMeshBasicMaterial {
  emissive: string;
  shininess: number;
  specular: string;
  specularMap: string | TexImageSource | Texture2D;
  bumpMap: string | TexImageSource | Texture2D;
  bumpScale: number;
  doubleSide: boolean;
}

enum Uniform {
  EMISSIVE = 'u_Emissive',
  SHININESS = 'u_Shininess',
  SPECULAR = 'u_Specular',
  BUMP_SCALE = 'u_BumpScale',
  SPECULAR_MAP = 'u_SpecularMap',
  BUMP_MAP = 'u_BumpMap',
}

enum SamplerLocation {
  BUMP_MAP = 1,
  SPECULAR_MAP,
}

export class MeshPhongMaterial extends MeshBasicMaterial<IMeshPhongMaterial> {
  get emissive() {
    return this.props.emissive;
  }
  set emissive(v) {
    this.props.emissive = v;
    const emissiveColor = parseColor(v).value as Tuple4Number;
    this.setUniforms({
      [Uniform.EMISSIVE]: emissiveColor.slice(0, 3) as [number, number, number],
    });
  }

  get shininess() {
    return this.props.shininess;
  }
  set shininess(v) {
    this.props.shininess = v;
    this.setUniforms({
      [Uniform.SHININESS]: v,
    });
  }

  get specular() {
    return this.props.specular;
  }
  set specular(v) {
    this.props.specular = v;
    const specularColor = parseColor(v).value as Tuple4Number;
    this.setUniforms({
      [Uniform.SPECULAR]: specularColor.slice(0, 3) as [number, number, number],
    });
  }

  get specularMap() {
    return this.props.specularMap;
  }
  set specularMap(v) {
    if (this.props.map !== v) {
      this.props.specularMap = v;
      this.programDirty = true;
    }

    this.defines.USE_SPECULARMAP = !!v;
    if (v) {
      this.addTexture(v, Uniform.SPECULAR_MAP, SamplerLocation.SPECULAR_MAP);
    } else {
      this.removeTexture(Uniform.SPECULAR_MAP);
    }
  }

  get bumpMap() {
    return this.props.bumpMap;
  }
  set bumpMap(v) {
    if (this.props.map !== v) {
      this.props.bumpMap = v;
      this.programDirty = true;
    }

    this.defines.USE_BUMPMAP = !!v;
    if (v) {
      this.addTexture(v, Uniform.BUMP_MAP, SamplerLocation.BUMP_MAP);
      this.setUniforms({
        [Uniform.BUMP_SCALE]: this.bumpScale,
      });
    } else {
      this.removeTexture(Uniform.BUMP_MAP);
      this.setUniforms({
        [Uniform.BUMP_SCALE]: null,
      });
    }
  }
  get bumpScale() {
    return this.props.bumpScale;
  }
  set bumpScale(v) {
    this.props.bumpScale = v;
    this.setUniforms({
      [Uniform.BUMP_SCALE]: v,
    });
  }

  get doubleSide() {
    return this.props.doubleSide;
  }
  set doubleSide(v) {
    this.props.doubleSide = v;
    this.defines.USE_DOUBLESIDE = v;
  }

  constructor(props?: Partial<IMeshPhongMaterial>) {
    super({
      vertexShader: vert,
      fragmentShader: frag,
      emissive: 'black',
      shininess: 30,
      specular: '#111111',
      bumpScale: 1,
      doubleSide: false,
      ...props,
    });

    const { specularMap, bumpMap, doubleSide, emissive, shininess, specular } = this;

    const emissiveColor = parseColor(emissive).value as Tuple4Number;
    const specularColor = parseColor(specular).value as Tuple4Number;
    this.setUniforms({
      u_Placeholder: null,
      [Uniform.EMISSIVE]: emissiveColor.slice(0, 3) as [number, number, number],
      [Uniform.SHININESS]: shininess,
      [Uniform.SPECULAR]: specularColor.slice(0, 3) as [number, number, number],
    });

    if (specularMap) {
      this.specularMap = specularMap;
    }

    if (bumpMap) {
      this.bumpMap = bumpMap;
    }

    this.doubleSide = doubleSide;

    this.defines = {
      ...this.defines,
      NORMAL: VertexAttributeLocation.MAX + 1,
    };
  }
}
