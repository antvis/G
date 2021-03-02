import { Component } from '@antv/g-ecs';
import { BufferData, IModelInitializationOptions } from '../services/renderer';
import { gl } from '../services/renderer/constants';

export interface IUniformBinding {
  dirty: boolean;
  data: BufferData;
  binding?: number;
  name: string;
  format?: string;
  offset?: number;
  length?: number;
}

export class Material3D extends Component {
  public static tag = 'c-material-3d';

  public vertexShaderGLSL: string;

  public fragmentShaderGLSL: string;

  // control flow in shaders, eg. USE_UV, USE_MAP...
  public defines: Record<string, boolean | number> = {};

  public dirty = true;

  public uniforms: IUniformBinding[] = [];

  public cull: IModelInitializationOptions['cull'] = {
    enable: true,
    face: gl.BACK,
  };

  public depth: IModelInitializationOptions['depth'] = {
    enable: true,
  };

  public blend: IModelInitializationOptions['blend'];

  //   public entity: Entity;

  public type: string;

  public setDefines(defines: Record<string, boolean | number>) {
    this.defines = { ...this.defines, ...defines };
    return this;
  }

  public setCull(cull: IModelInitializationOptions['cull']) {
    this.cull = cull;
    return this;
  }

  public setDepth(depth: IModelInitializationOptions['depth']) {
    this.depth = depth;
    return this;
  }

  public setBlend(blend: IModelInitializationOptions['blend']) {
    this.blend = blend;
    return this;
  }

  public setUniform(name: string | Record<string, BufferData>, data?: BufferData) {
    if (typeof name !== 'string') {
      Object.keys(name).forEach((key) => this.setUniform(key, name[key]));
      return this;
    }

    const existedUniform = this.uniforms.find((u) => u.name === name);
    if (!existedUniform) {
      this.uniforms.push({
        name,
        dirty: true,
        data: data!,
      });
    } else {
      existedUniform.dirty = true;
      existedUniform.data = data!;
    }

    this.dirty = true;
    return this;
  }
}
