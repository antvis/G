import { Material } from '@antv/g-plugin-webgl-renderer';
import vert from '../shaders/material.basic.vert';
import frag from '../shaders/material.basic.frag';

export interface MeshBasicMaterialProps {
  map?: string;
}

/**
 * not affected by lights
 * @see https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
 */
export class MeshBasicMaterial extends Material {
  map: string;

  constructor(props?: MeshBasicMaterialProps) {
    super();

    this.defines = {
      USE_UV: true,
      USE_MAP: true,
    };

    this.map = props?.map;

    this.vertexShader = vert;
    this.fragmentShader = frag;
  }
}
