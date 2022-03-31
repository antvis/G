import type { Tuple4Number } from '@antv/g';
import { parseColor } from '@antv/g';
import type { Device, Texture } from '@antv/g-plugin-webgl-renderer';
import type { IMeshBasicMaterial } from './MeshBasicMaterial';
import { MeshBasicMaterial } from './MeshBasicMaterial';
import vert from '../shaders/material.phong.vert';
import frag from '../shaders/material.phong.frag';

export interface IMeshPhongMaterial extends IMeshBasicMaterial {
  emissive: string;
  shininess: number;
  specular: string;
  specularMap: Texture;
  bumpMap: Texture;
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
    this.setUniforms({
      [Uniform.SPECULAR_MAP]: v,
    });
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
    this.setUniforms({
      [Uniform.BUMP_MAP]: v,
      [Uniform.BUMP_SCALE]: this.bumpScale,
    });
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

  constructor(device: Device, props?: Partial<IMeshPhongMaterial>) {
    super(device, {
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
    };
  }
}
