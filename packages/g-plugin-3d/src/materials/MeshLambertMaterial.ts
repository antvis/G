import type { CSSRGB } from '@antv/g-lite';
import { parseColor } from '@antv/g-lite';
import type { Device, Texture } from '@antv/g-device-api';
import frag from '../shaders/material.lambert.frag';
import vert from '../shaders/material.lambert.vert';
import type { IMeshBasicMaterial } from './MeshBasicMaterial';
import { MeshBasicMaterial } from './MeshBasicMaterial';

export interface IMeshLambertMaterial extends IMeshBasicMaterial {
  emissive: string;
  bumpMap: Texture;
  bumpScale: number;
  doubleSide: boolean;
}

enum Uniform {
  EMISSIVE = 'u_Emissive',
  BUMP_SCALE = 'u_BumpScale',
  BUMP_MAP = 'u_BumpMap',
}

export class MeshLambertMaterial extends MeshBasicMaterial<IMeshLambertMaterial> {
  get emissive() {
    return this.props.emissive;
  }
  set emissive(v) {
    this.props.emissive = v;
    const emissiveColor = parseColor(v) as CSSRGB;
    this.setUniforms({
      [Uniform.EMISSIVE]: [
        Number(emissiveColor.r) / 255,
        Number(emissiveColor.g) / 255,
        Number(emissiveColor.b) / 255,
      ],
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

  constructor(device: Device, props?: Partial<IMeshLambertMaterial>) {
    super(device, {
      vertexShader: vert,
      fragmentShader: frag,
      emissive: 'black',
      bumpScale: 1,
      doubleSide: false,
      ...props,
    });

    const { bumpMap, doubleSide, emissive } = this;

    const emissiveColor = parseColor(emissive) as CSSRGB;
    this.setUniforms({
      u_Placeholder: null,
      [Uniform.EMISSIVE]: [
        Number(emissiveColor.r) / 255,
        Number(emissiveColor.g) / 255,
        Number(emissiveColor.b) / 255,
      ],
    });

    if (bumpMap) {
      this.bumpMap = bumpMap;
    }

    this.doubleSide = doubleSide;

    this.defines = {
      ...this.defines,
      USE_LIGHT: true,
    };
  }
}
