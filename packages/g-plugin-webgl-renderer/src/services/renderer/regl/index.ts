/**
 * render w/ regl
 * @see https://github.com/regl-project/regl/blob/gh-pages/API.md
 */
import {
  IAttribute,
  IAttributeInitializationOptions,
  IBuffer,
  IBufferInitializationOptions,
  IClearOptions,
  IElements,
  IElementsInitializationOptions,
  IFramebuffer,
  IFramebufferInitializationOptions,
  IModel,
  IModelInitializationOptions,
  IReadPixelsOptions,
  IRendererConfig,
  RenderingEngine,
  ITexture2D,
  ITexture2DInitializationOptions,
} from '../';
import { injectable } from 'inversify';
import regl from 'regl';
import ReglAttribute from './ReglAttribute';
import ReglBuffer from './ReglBuffer';
import ReglElements from './ReglElements';
import ReglFramebuffer from './ReglFramebuffer';
import ReglModel from './ReglModel';
import ReglTexture2D from './ReglTexture2D';
import { gl } from '../constants';
import { overrideContextType } from './webgl2-compatible';
import { TranspileTarget } from '../../shader-module';

// @see https://stackoverflow.com/questions/54401577/check-if-webgl2-is-supported-and-enabled-in-clients-browser
const isWebGL2Supported = () => !!document.createElement('canvas').getContext('webgl2');

/**
 * regl rendering engine
 */
@injectable()
export class WebGLEngine implements RenderingEngine {
  public supportWebGPU = false;
  public useWGSL = false;
  private $canvas: HTMLCanvasElement;
  private gl: regl.Regl;

  shaderLanguage: TranspileTarget = TranspileTarget.GLSL1;

  public init(cfg: IRendererConfig): void {
    this.$canvas = cfg.canvas!;

    const createRegl = () =>
      regl({
        canvas: cfg.canvas,
        attributes: {
          alpha: true,
          // use TAA instead of MSAA
          // @see https://www.khronos.org/registry/webgl/specs/1.0/#5.2.1
          antialias: cfg.antialias,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,
        },
        pixelRatio: cfg.dpr || 1,
        // TODO: use extensions
        extensions: [
          'OES_element_index_uint',
          'OES_texture_float',
          'OES_standard_derivatives', // wireframe
          'angle_instanced_arrays', // VSM shadow map
        ],
        optionalExtensions: ['EXT_texture_filter_anisotropic', 'EXT_blend_minmax', 'WEBGL_depth_texture'],
      });

    const useWebgl1 = cfg.disableWebGL2 || !isWebGL2Supported();
    if (useWebgl1) {
      this.gl = createRegl();
    } else {
      this.gl = overrideContextType(createRegl);
      this.shaderLanguage = TranspileTarget.GLSL3;
    }
  }

  public isFloatSupported() {
    // @see https://github.com/antvis/GWebGPUEngine/issues/26
    // @ts-ignore
    return this.gl.limits.readFloat;
  }

  public createModel = (options: IModelInitializationOptions): IModel => {
    return new ReglModel(this.gl, options);
  };

  public createAttribute = (options: IAttributeInitializationOptions): IAttribute =>
    new ReglAttribute(this.gl, options);

  public createBuffer = (options: IBufferInitializationOptions): IBuffer => new ReglBuffer(this.gl, options);

  public createElements = (options: IElementsInitializationOptions): IElements => new ReglElements(this.gl, options);

  public createTexture2D = (options: ITexture2DInitializationOptions): ITexture2D =>
    new ReglTexture2D(this.gl, options);

  public createFramebuffer = (options: IFramebufferInitializationOptions) => new ReglFramebuffer(this.gl, options);

  public useFramebuffer = (
    { framebuffer, ...rest }: { framebuffer: IFramebuffer | null },
    drawCommands: () => void
  ) => {
    this.gl({
      framebuffer: framebuffer ? (framebuffer as ReglFramebuffer).get() : null,
      ...rest,
    })(drawCommands);
  };

  // public createComputeModel = async (
  //   context: GLSLContext,
  // ): Promise<IComputeModel> => {
  //   return new ReglComputeModel(this.gl, context);
  // };

  public clear = (options: IClearOptions) => {
    // @see https://github.com/regl-project/regl/blob/gh-pages/API.md#clear-the-draw-buffer
    const { color, depth, stencil, framebuffer = null } = options;
    // @ts-ignore
    const reglClearOptions: regl.ClearOptions = options;

    reglClearOptions.framebuffer = framebuffer === null ? framebuffer : (framebuffer as ReglFramebuffer).get();

    this.gl.clear(reglClearOptions);
  };

  public setScissor = (
    scissor: Partial<{
      enable: boolean;
      box: { x: number; y: number; width: number; height: number };
    }>
  ) => {
    if (this.gl && this.gl._gl) {
      // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/scissor
      if (scissor.enable && scissor.box) {
        this.gl._gl.enable(gl.SCISSOR_TEST);
        this.gl._gl.scissor(scissor.box.x, scissor.box.y, scissor.box.width, scissor.box.height);
      } else {
        this.gl._gl.disable(gl.SCISSOR_TEST);
        // this.gl._refresh();
      }
      // this.gl._refresh();
    }
  };

  public viewport = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => {
    if (this.gl && this.gl._gl) {
      // use WebGL context directly
      // @see https://github.com/regl-project/regl/blob/gh-pages/API.md#unsafe-escape-hatch
      this.gl._gl.viewport(x, y, width, height);
      // this.gl._refresh();
    }
  };

  public readPixels = (options: IReadPixelsOptions) => {
    const { framebuffer, x, y, width, height } = options;
    const readPixelsOptions: regl.ReadOptions = {
      x,
      y,
      width,
      height,
    };
    if (framebuffer) {
      readPixelsOptions.framebuffer = (framebuffer as ReglFramebuffer).get();
    }
    return this.gl.read(readPixelsOptions);
  };

  public getCanvas = () => {
    return this.$canvas;
  };

  public getGLContext = () => {
    return this.gl._gl;
  };

  public getViewportSize = () => {
    return {
      width: this.gl._gl.drawingBufferWidth,
      height: this.gl._gl.drawingBufferHeight,
    };
  };

  public destroy = () => {
    if (this.gl) {
      // @see https://github.com/regl-project/regl/blob/gh-pages/API.md#clean-up
      this.gl.destroy();
    }
  };

  public beforeRender() {
    //
  }

  public afterRender() {
    //
  }
}
