import { DefineValuePlaceholder, GLSLContext, KernelBundle } from '@antv/g-plugin-gpgpu';
import { isFinite } from 'lodash-es';
import { AST_TOKEN_TYPES, STORAGE_CLASS } from './ast/glsl-ast-node-types';
import { DataType, Program as ComputeProgram } from './ast/glsl-tree';
import { Node, Program as TSProgram } from './ast/ts-estree';
import { CodeGeneratorGLSL100 } from './backends/CodeGeneratorGLSL100';
import { CodeGeneratorGLSL450 } from './backends/CodeGeneratorGLSL450';
import { CodeGeneratorWGSL } from './backends/CodeGeneratorWGSL';
import { ICodeGenerator, Target } from './backends/ICodeGenerator';
import { parse } from './pegjs/g';
import { Transformer } from './Transformer';
import { getComponentSize } from './utils/data-type';

// export interface Program {
//   type: 'Program';
//   body: Node[];
// }

export { GLSLContext, DefineValuePlaceholder };

export interface ProgramParams {
  dispatch: [number, number, number];
  maxIteration: number;
  bindings: Array<{
    name: string;
    data: number | number[];
  }>;
}

export const FunctionPrependPlaceholder = '__FunctionPrependPlaceholder__';

export class Compiler {
  private target: Target = Target.GLSL100;

  private glslContext: GLSLContext = {
    name: '',
    dispatch: [1, 1, 1],
    threadGroupSize: [1, 1, 1],
    maxIteration: 1,
    defines: [],
    uniforms: [],
    globalDeclarations: [],
    output: {
      name: '',
    },
    needPingpong: false,
  };

  private generators: Record<Target, ICodeGenerator> = {
    [Target.GLSL100]: new CodeGeneratorGLSL100(),
    [Target.GLSL450]: new CodeGeneratorGLSL450(),
    [Target.WGSL]: new CodeGeneratorWGSL(),
  };

  private transformer: Transformer = new Transformer();

  public setTarget(target: Target) {
    this.target = target;
    this.transformer.target = target;
    this.clear();
  }

  public getContext() {
    return this.glslContext;
  }

  public getGenerator(): ICodeGenerator {
    return this.generators[this.target];
  }

  /**
   * 生成 AST
   */
  public parse(source: string): TSProgram | undefined {
    try {
      return parse(source);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error('[Parse error]:', e);

      throw e;
    }
  }

  /**
   * AST 变换
   * ESTree -> ShaderTree
   */
  public transform(program: TSProgram): ComputeProgram {
    return this.transformer.transform(program, this.glslContext);
  }

  /**
   * 代码生成
   */
  public generateCode(program: ComputeProgram): string {
    const generator = this.getGenerator();
    generator.clear();
    return generator.generate(program, this.glslContext);
  }

  public clear() {
    this.glslContext = {
      name: '',
      dispatch: [1, 1, 1],
      threadGroupSize: [1, 1, 1],
      maxIteration: 1,
      defines: [],
      uniforms: [],
      globalDeclarations: [],
      output: {
        name: '',
      },
      needPingpong: false,
    };
  }

  public compileBundle(
    gCode: string,
    targets: Target[] = [Target.WGSL, Target.GLSL450, Target.GLSL100],
  ): KernelBundle {
    const bundle = {
      shaders: {
        [Target.WGSL]: '',
        [Target.GLSL450]: '',
        [Target.GLSL100]: '',
      },
      context: undefined,
      toString: () => {
        return JSON.stringify(bundle).replace(/\\/g, '\\\\');
      },
    };

    targets.forEach((target) => {
      this.setTarget(target);

      const estree = this.parse(gCode)!;
      // TODO: 应该只需要 transform 一次
      const shaderTree = this.transform(estree);
      bundle.shaders[target] = this.generateCode(shaderTree);
    });

    // @ts-ignore
    bundle.context = this.getContext();

    return bundle;
  }
}
