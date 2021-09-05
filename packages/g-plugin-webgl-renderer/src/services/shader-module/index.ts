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
const extensionRegExp = /#extension.+\n/g;
const GLSL3_OUT_VARIABLE_NAME = 'gwebgl_out';

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

export enum TranspileTarget {
  GLSL1, // WebGL1
  GLSL3, // WebGL2
  WGSL, // WebGPU
}

export enum ShaderType {
  Vertex,
  Fragment,
  Compute,
}

export const ShaderModuleService = 'ShaderModuleService';
export interface ShaderModuleService {
  registerModule(moduleName: string, moduleParams: IModuleParams): void;
  getModule(moduleName: string): IModuleParams;

  /**
   * 注册内置 shader module
   */
  registerBuiltinModules(): void;
  destroy(): void;

  /**
   * transpile GLSL 1.0 to 3.0
   */
  transpile(
    content: string,
    type: ShaderType,
    target: TranspileTarget,
    defines?: Record<string, number | boolean>,
  ): string;
}

@injectable()
export class DefaultShaderModuleService implements ShaderModuleService {
  private moduleCache: { [key: string]: IModuleParams } = {};
  private rawContentCache: { [key: string]: IModuleParams } = {};

  registerBuiltinModules() {
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

  registerModule(moduleName: string, moduleParams: IModuleParams) {
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
  destroy() {
    this.moduleCache = {};
    this.rawContentCache = {};
  }
  getModule(moduleName: string): IModuleParams {
    if (this.moduleCache[moduleName]) {
      return this.moduleCache[moduleName];
    }

    const rawVS = this.rawContentCache[moduleName].vs || '';
    const rawFS = this.rawContentCache[moduleName].fs || '';

    const { content: vs, includeList: vsIncludeList } = this.processModule(rawVS, [], 'vs');
    const { content: fs, includeList: fsIncludeList } = this.processModule(rawFS, [], 'fs');
    // extract uniforms and their default values from GLSL
    const uniforms: {
      [key: string]: any;
    } = uniq(vsIncludeList.concat(fsIncludeList).concat(moduleName)).reduce((prev, cur: string) => {
      return {
        ...prev,
        ...this.rawContentCache[cur].uniforms,
      };
    }, {});

    this.moduleCache[moduleName] = {
      fs: fs.trim(),
      uniforms,
      vs: vs.trim(),
    };
    return this.moduleCache[moduleName];
  }

  transpile(
    content: string,
    type: ShaderType,
    target: TranspileTarget,
    defines?: Record<string, number | boolean>,
  ) {
    let header = '';
    if (target === TranspileTarget.GLSL3) {
      header = '#version 300 es';
      if (type === ShaderType.Vertex) {
        content = content.replace(/varying/g, 'out').replace(/attribute/g, 'in');
      } else if (type === ShaderType.Fragment) {
        content = content
          .replace(/varying/g, 'in')
          .replace(/gl_FragColor/g, GLSL3_OUT_VARIABLE_NAME)
          .replace(/texture2D/g, 'texture');

        content = `out vec4 ${GLSL3_OUT_VARIABLE_NAME};\n${content}`;
      }

      // remove built-in extensions in webgl2
      // @see https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
      const { content: extracted } = this.extractExtensions(content);
      content = extracted;
    }

    if (type === ShaderType.Fragment) {
      /**
       * set default precision for fragment shader
       * https://stackoverflow.com/questions/28540290/why-it-is-necessary-to-set-precision-for-the-fragment-shader
       */
      if (!precisionRegExp.test(content)) {
        content = globalDefaultprecision + content;
      }
    }

    // prepend #define
    const defineStatements = this.generateDefines(defines || {});

    return `${header}
${defineStatements}
${content}`;
  }

  private generateDefines(defines: Record<string, number | boolean>) {
    return Object.keys(defines)
      .map((name) => `#define ${name} ${Number(defines[name])}`)
      .join('\n');
  }

  private extractExtensions(shader: string) {
    const extensions: string[] = [];
    const content = shader.replace(extensionRegExp, (strMatch) => {
      extensions.push(strMatch);
      return '';
    });
    return {
      extensions: extensions.join(''),
      content,
    };
  }

  private processModule(
    rawContent: string,
    includeList: string[],
    type: 'vs' | 'fs',
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
