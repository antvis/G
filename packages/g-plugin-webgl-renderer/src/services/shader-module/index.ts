import { injectable } from 'inversify';
import { uniq } from '@antv/util';
import { extractUniforms } from '../../utils/shader-module';
import { IUniform } from '../renderer';

import instancingVert from './shaders/webgl.instancing.vert.glsl';
import instancingDeclarationVert from './shaders/webgl.instancing.declaration.vert.glsl';
import projectDeclarationVert from './shaders/webgl.project.declaration.vert.glsl';
import pickingFrag from './shaders/webgl.picking.frag.glsl';
import pickingVert from './shaders/webgl.picking.vert.glsl';
import sdf2dFrag from './shaders/webgl.sdf2d.frag.glsl';
import uvVert from './shaders/webgl.uv.vert.glsl';
import uvDeclarationVert from './shaders/webgl.uv.declaration.vert.glsl';
import uvDeclarationFrag from './shaders/webgl.uv.declaration.frag.glsl';
import mapFrag from './shaders/webgl.map.frag.glsl';
import mapDeclarationFrag from './shaders/webgl.map.declaration.frag.glsl';

const precisionRegExp = /precision\s+(high|low|medium)p\s+float/;
const globalDefaultprecision =
  '#ifdef GL_FRAGMENT_PRECISION_HIGH\n precision highp float;\n #else\n precision mediump float;\n#endif\n';
const includeRegExp = /#pragma include (["^+"]?["\ "[a-zA-Z_0-9](.*)"]*?)/g;

/**
 * 提供 ShaderModule 管理服务
 */

export interface IModuleParams {
  vs?: string;
  fs?: string;
  uniforms?: {
    [key: string]: IUniform;
  };
}

export const ShaderModuleService = Symbol('ShaderModuleService');
export interface ShaderModuleService {
  registerModule(moduleName: string, moduleParams: IModuleParams): void;
  getModule(moduleName: string): IModuleParams;

  /**
   * 注册内置 shader module
   */
  registerBuiltinModules(): void;
  destroy(): void;
}

@injectable()
export class DefaultShaderModuleService implements ShaderModuleService {
  private moduleCache: { [key: string]: IModuleParams } = {};
  private rawContentCache: { [key: string]: IModuleParams } = {};

  public registerBuiltinModules() {
    this.destroy();

    // register shader chunks
    this.registerModule('instancing.declaration', { vs: instancingDeclarationVert, fs: '' });
    this.registerModule('instancing', { vs: instancingVert, fs: '' });
    this.registerModule('project.declaration', { vs: projectDeclarationVert, fs: '' });
    this.registerModule('picking', { vs: pickingVert, fs: pickingFrag });
    this.registerModule('sdf_2d', { vs: '', fs: sdf2dFrag });
    this.registerModule('uv', { vs: uvVert, fs: '' });
    this.registerModule('uv.declaration', { vs: uvDeclarationVert, fs: uvDeclarationFrag });
    this.registerModule('map', { vs: '', fs: mapFrag });
    this.registerModule('map.declaration', { vs: '', fs: mapDeclarationFrag });
  }

  public registerModule(moduleName: string, moduleParams: IModuleParams) {
    // prevent registering the same module multiple times
    if (this.rawContentCache[moduleName]) {
      return;
    }

    const { vs = '', fs = '', uniforms: declaredUniforms } = moduleParams;
    const { content: extractedVS, uniforms: vsUniforms } = extractUniforms(vs);
    const { content: extractedFS, uniforms: fsUniforms } = extractUniforms(fs);

    this.rawContentCache[moduleName] = {
      fs: extractedFS,
      uniforms: {
        ...vsUniforms,
        ...fsUniforms,
        ...declaredUniforms,
      },
      vs: extractedVS,
    };
  }
  public destroy() {
    this.moduleCache = {};
    this.rawContentCache = {};
  }
  public getModule(moduleName: string): IModuleParams {
    if (this.moduleCache[moduleName]) {
      return this.moduleCache[moduleName];
    }

    const rawVS = this.rawContentCache[moduleName].vs || '';
    const rawFS = this.rawContentCache[moduleName].fs || '';

    const { content: vs, includeList: vsIncludeList } = this.processModule(rawVS, [], 'vs');
    const { content: fs, includeList: fsIncludeList } = this.processModule(rawFS, [], 'fs');
    let compiledFs = fs;
    // TODO: extract uniforms and their default values from GLSL
    const uniforms: {
      [key: string]: any;
    } = uniq(vsIncludeList.concat(fsIncludeList).concat(moduleName)).reduce((prev, cur: string) => {
      return {
        ...prev,
        ...this.rawContentCache[cur].uniforms,
      };
    }, {});

    /**
     * set default precision for fragment shader
     * https://stackoverflow.com/questions/28540290/why-it-is-necessary-to-set-precision-for-the-fragment-shader
     */
    if (!precisionRegExp.test(fs)) {
      compiledFs = globalDefaultprecision + fs;
    }

    this.moduleCache[moduleName] = {
      fs: compiledFs.trim(),
      uniforms,
      vs: vs.trim(),
    };
    return this.moduleCache[moduleName];
  }

  private processModule(
    rawContent: string,
    includeList: string[],
    type: 'vs' | 'fs'
  ): {
    content: string;
    includeList: string[];
  } {
    const compiled = rawContent.replace(includeRegExp, (_, strMatch) => {
      const includeOpt = strMatch.split(' ');
      const includeName = includeOpt[0].replace(/"/g, '');

      if (includeList.indexOf(includeName) > -1) {
        return '';
      }

      const txt = this.rawContentCache[includeName][type];
      includeList.push(includeName);

      const { content } = this.processModule(txt || '', includeList, type);
      return content;
    });

    return {
      content: compiled,
      includeList,
    };
  }
}
