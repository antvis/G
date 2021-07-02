import { IAttribute, IElements, IModel, IModelDrawOptions, IModelInitializationOptions, IUniform } from '..';
import regl from 'regl';
import { extractUniforms } from '../../../utils/uniform';
import {
  blendEquationMap,
  blendFuncMap,
  cullFaceMap,
  depthFuncMap,
  gl,
  primitiveMap,
  stencilFuncMap,
  stencilOpMap,
} from '../constants';
import ReglAttribute from './ReglAttribute';
import ReglElements from './ReglElements';
import ReglFramebuffer from './ReglFramebuffer';
import ReglTexture2D from './ReglTexture2D';

const PROP_PREFIX = '__regl__';

/**
 * adaptor for regl.DrawCommand
 */
export default class ReglModel implements IModel {
  private reGl: regl.Regl;
  private drawCommand: regl.DrawCommand;
  private uniforms: {
    [key: string]: IUniform;
  } = {};
  private attributes: {
    [key: string]: IAttribute;
  } = {};
  private elements: IElements;
  private count: number;
  private instances: number;

  constructor(reGl: regl.Regl, options: IModelInitializationOptions) {
    this.reGl = reGl;
    const {
      vs,
      fs,
      attributes,
      uniforms,
      primitive,
      count,
      elements,
      depth,
      blend,
      stencil,
      cull,
      instances,
      scissor,
      // @ts-ignore
      viewport,
    } = options;
    const reglUniforms: { [key: string]: IUniform } = {};
    if (uniforms) {
      this.uniforms = extractUniforms(uniforms);
      Object.keys(uniforms).forEach((uniformName) => {
        // use regl prop API
        // @ts-ignore
        reglUniforms[uniformName] = reGl.prop(uniformName);
      });
    }

    const reglAttributes: { [key: string]: regl.Attribute } = {};
    if (attributes) {
      this.attributes = attributes;
      Object.keys(attributes).forEach((name: string) => {
        // use regl prop API
        // @ts-ignore
        reglAttributes[name] = reGl.prop(name);
      });
    }

    const drawParams: regl.DrawConfig = {
      attributes: reglAttributes,
      frag: fs,
      uniforms: reglUniforms,
      vert: vs,
      primitive: primitiveMap[primitive === undefined ? gl.TRIANGLES : primitive],
    };
    if (instances) {
      this.instances = instances;
      // @ts-ignore
      drawParams.instances = reGl.prop(`${PROP_PREFIX}instances`);
    }

    // elements 中可能包含 count，此时不应传入
    if (count) {
      this.count = count;
      // @ts-ignore
      drawParams.count = reGl.prop(`${PROP_PREFIX}count`);
    }

    if (elements) {
      this.elements = elements;
      // @ts-ignore
      drawParams.elements = reGl.prop(`${PROP_PREFIX}elements`);
    }

    if (scissor) {
      drawParams.scissor = scissor;
    }

    if (viewport) {
      drawParams.viewport = viewport;
    }

    this.initDepthDrawParams({ depth }, drawParams);
    this.initBlendDrawParams({ blend }, drawParams);
    this.initStencilDrawParams({ stencil }, drawParams);
    this.initCullDrawParams({ cull }, drawParams);

    this.drawCommand = reGl(drawParams);
  }

  public addUniforms(uniforms: { [key: string]: IUniform }) {
    this.uniforms = {
      ...this.uniforms,
      ...extractUniforms(uniforms),
    };
  }

  /**
   * support batch-rendering, eg. draw([prop1, prop2])
   * @see https://github.com/regl-project/regl/blob/gh-pages/API.md#batch-rendering
   */
  public draw(options: IModelDrawOptions | IModelDrawOptions[]) {
    let batches: IModelDrawOptions[] = [];
    if (!Array.isArray(options)) {
      batches = [options];
    } else {
      batches = options;
    }

    const batchProps = batches.map((batch) => {
      const reglDrawProps: {
        [key: string]: regl.Framebuffer | regl.Texture2D | number | number[] | boolean;
      } = {};

      const attributes: {
        [key: string]: IAttribute;
      } = {
        ...this.attributes,
        ...batch.attributes,
      };
      Object.keys(attributes).forEach((attributeName: string) => {
        // @ts-ignore
        reglDrawProps[attributeName] = (attributes[attributeName] as ReglAttribute).get();
      });

      const uniforms: {
        [key: string]: IUniform;
      } = {
        ...this.uniforms,
        ...extractUniforms(batch.uniforms || {}),
      };

      Object.keys(uniforms).forEach((uniformName: string) => {
        const type = typeof uniforms[uniformName];
        if (
          type === 'boolean' ||
          type === 'number' ||
          Array.isArray(uniforms[uniformName]) ||
          // @ts-ignore
          uniforms[uniformName].BYTES_PER_ELEMENT
        ) {
          reglDrawProps[uniformName] = uniforms[uniformName] as number | number[] | boolean;
        } else if (type === 'string') {
          // TODO: image url
        } else {
          reglDrawProps[uniformName] = (uniforms[uniformName] as ReglFramebuffer | ReglTexture2D).get();
        }
      });

      if (this.elements) {
        // @ts-ignore
        reglDrawProps[`${PROP_PREFIX}elements`] = ((batch.elements || this.elements) as ReglElements).get();
      }

      const count = batch.count || this.count;
      if (count) {
        // @ts-ignore
        reglDrawProps[`${PROP_PREFIX}count`] = count;
      }

      // @ts-ignore     
      const instances = batch.instances || this.instances;
      if (instances) {
        reglDrawProps[`${PROP_PREFIX}instances`] = instances;
      }

      return reglDrawProps;
    });

    this.drawCommand(batchProps);
  }

  public destroy() {
    // don't need do anything since we will call `rendererService.cleanup()`
  }

  /**
   * @see https://github.com/regl-project/regl/blob/gh-pages/API.md#depth-buffer
   */
  private initDepthDrawParams({ depth }: Pick<IModelInitializationOptions, 'depth'>, drawParams: regl.DrawConfig) {
    if (depth) {
      drawParams.depth = {
        enable: depth.enable === undefined ? true : !!depth.enable,
        mask: depth.mask === undefined ? true : !!depth.mask,
        func: depthFuncMap[depth.func || gl.LESS],
        range: depth.range || [0, 1],
      };
    }
  }

  /**
   * @see https://github.com/regl-project/regl/blob/gh-pages/API.md#blending
   */
  private initBlendDrawParams({ blend }: Pick<IModelInitializationOptions, 'blend'>, drawParams: regl.DrawConfig) {
    if (blend) {
      const { enable, func, equation, color = [0, 0, 0, 0] } = blend;
      // @ts-ignore
      drawParams.blend = {
        enable: !!enable,
        func: {
          srcRGB: blendFuncMap[(func && func.srcRGB) || gl.SRC_ALPHA],
          srcAlpha: blendFuncMap[(func && func.srcAlpha) || gl.SRC_ALPHA],
          dstRGB: blendFuncMap[(func && func.dstRGB) || gl.ONE_MINUS_SRC_ALPHA],
          dstAlpha: blendFuncMap[(func && func.dstAlpha) || gl.ONE_MINUS_SRC_ALPHA],
        },
        equation: {
          rgb: blendEquationMap[(equation && equation.rgb) || gl.FUNC_ADD],
          alpha: blendEquationMap[(equation && equation.alpha) || gl.FUNC_ADD],
        },
        color,
      };
    }
  }

  /**
   * @see https://github.com/regl-project/regl/blob/gh-pages/API.md#stencil
   */
  private initStencilDrawParams(
    { stencil }: Pick<IModelInitializationOptions, 'stencil'>,
    drawParams: regl.DrawConfig
  ) {
    if (stencil) {
      const {
        enable,
        mask = -1,
        func = {
          cmp: gl.ALWAYS,
          ref: 0,
          mask: -1,
        },
        opFront = {
          fail: gl.KEEP,
          zfail: gl.KEEP,
          zpass: gl.KEEP,
        },
        opBack = {
          fail: gl.KEEP,
          zfail: gl.KEEP,
          zpass: gl.KEEP,
        },
      } = stencil;
      drawParams.stencil = {
        enable: !!enable,
        mask,
        func: {
          ...func,
          cmp: stencilFuncMap[func.cmp],
        },
        opFront: {
          fail: stencilOpMap[opFront.fail],
          zfail: stencilOpMap[opFront.zfail],
          zpass: stencilOpMap[opFront.zpass],
        },
        opBack: {
          fail: stencilOpMap[opBack.fail],
          zfail: stencilOpMap[opBack.zfail],
          zpass: stencilOpMap[opBack.zpass],
        },
      };
    }
  }

  /**
   * @see https://github.com/regl-project/regl/blob/gh-pages/API.md#culling
   */
  private initCullDrawParams({ cull }: Pick<IModelInitializationOptions, 'cull'>, drawParams: regl.DrawConfig) {
    if (cull) {
      const { enable, face = gl.BACK } = cull;
      drawParams.cull = {
        enable: !!enable,
        face: cullFaceMap[face],
      };
    }
  }
}
