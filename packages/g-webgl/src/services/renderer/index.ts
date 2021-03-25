import { Frustum } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { mat4, vec3 } from 'gl-matrix';
import { gl } from './constants';

export const RenderingEngine = Symbol('RenderingEngine');

export interface IBufferInitializationOptions {
  data: BufferData;

  /**
   * gl.DRAW_STATIC | gl.DYNAMIC_DRAW | gl.STREAM_DRAW
   */
  usage?: gl.STATIC_DRAW | gl.DYNAMIC_DRAW | gl.STREAM_DRAW;

  /**
   * gl.Float | gl.UNSIGNED_BYTE | ...
   */
  type?: gl.FLOAT | gl.UNSIGNED_BYTE;
  length?: number;
}

export interface IBuffer {
  /**
   * gl.bufferSubData
   */
  subData(options: {
    // 用于替换的数据
    data: BufferData;
    // 原 Buffer 替换位置，单位为 byte
    offset: number;
  }): void;

  /**
   * gl.deleteBuffer
   */
  destroy(): void;
}

export interface IAttributeInitializationOptions {
  buffer: IBuffer;

  /**
   * vertexAttribPointer 单位为 byte，默认值均为 0
   */
  offset?: number;
  stride?: number;

  /**
   * 每个顶点数据块大小，取值范围为 [1..4]
   */
  size?: number;

  /**
   * 是否需要归一化 [-1,1] 或者 [0,1]，默认值 false
   */
  normalized?: boolean;

  /**
   * gl.vertexAttribDivisorANGLE，自动开启 ANGLE_instanced_arrays 扩展
   */
  divisor?: number;

  /**
   * WebGPU
   */
  arrayStride?: number;
  stepMode?: GPUInputStepMode;
  attributes?: Iterable<GPUVertexAttributeDescriptor>;
}

export interface IAttribute {
  updateBuffer(options: {
    // 用于替换的数据
    data: BufferData;
    // 原 Buffer 替换位置，单位为 byte
    offset: number;
  }): void;
  destroy(): void;
}

export interface IElementsInitializationOptions {
  data: number[] | Uint8Array | Uint16Array | Uint32Array;

  /**
   * gl.DRAW_STATIC | gl.DYNAMIC_DRAW | gl.STREAM_DRAW
   */
  usage?: gl;

  /**
   * gl.UNSIGNED_BYTE  | gl.UNSIGNED_SHORT | gl.UNSIGNED_INT（开启 OES_element_index_uint 扩展）
   */
  type?: gl.UNSIGNED_BYTE | gl.UNSIGNED_SHORT | gl.UNSIGNED_INT;
  length?: number;
  primitive?: gl.POINTS | gl.LINES | gl.LINE_STRIP | gl.LINE_LOOP | gl.TRIANGLES | gl.TRIANGLE_STRIP | gl.TRIANGLE_FAN;
  count?: number;
}

export interface IElements {
  /**
   * gl.bufferSubData
   */
  subData(options: {
    // 用于替换的数据
    data: number[] | Uint8Array | Uint16Array | Uint32Array;
    // 原 Buffer 替换位置，单位为 byte
    offset: number;
  }): void;
  /**
   * gl.deleteBuffer
   */
  destroy(): void;
}

export interface IFramebufferInitializationOptions {
  width?: number;
  height?: number;

  /**
   * 布尔值用于开关 depth attachment，
   * 同时也支持 attach 一个 Texture2D 或者 RenderBuffer
   */
  depth?: boolean | ITexture2D | IRenderbuffer;

  /**
   * 布尔值用于开关 color attachment，
   * 同时也支持 attach 一个/一组 Texture2D 或者 RenderBuffer
   */
  color?: boolean | ITexture2D | IRenderbuffer;
  colors?: Array<ITexture2D | IRenderbuffer>;

  /**
   * 布尔值用于开关 depth attachment，
   * 同时也支持 attach 一个 RenderBuffer
   */
  stencil?: boolean | IRenderbuffer;
}

export interface IFramebuffer {
  resize(options: { width: number; height: number }): void;

  /**
   * gl.deleteRenderbuffer
   */
  destroy(): void;
}

export interface IBlendOptions {
  // gl.enable(gl.BLEND)
  enable: boolean;
  // gl.blendFunc
  func: BlendingFunctionSeparate;
  // gl.blendEquation
  equation: {
    rgb: gl.FUNC_ADD | gl.FUNC_SUBTRACT | gl.FUNC_REVERSE_SUBTRACT | gl.MIN_EXT | gl.MAX_EXT;
    alpha?: gl.FUNC_ADD | gl.FUNC_SUBTRACT | gl.FUNC_REVERSE_SUBTRACT | gl.MIN_EXT | gl.MAX_EXT;
  };
  // gl.blendColor
  color: [number, number, number, number];
}
type stencilOp = gl.ZERO | gl.KEEP | gl.REPLACE | gl.INVERT | gl.INCR | gl.DECR | gl.INCR_WRAP | gl.DECR_WRAP;

type BlendingFunctionCombined = Partial<{
  src:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
  dst:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
}>;

type BlendingFunctionSeparate = Partial<{
  srcRGB:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
  srcAlpha: number;
  dstRGB:
    | gl.ZERO
    | gl.ONE
    | gl.SRC_COLOR
    | gl.ONE_MINUS_SRC_COLOR
    | gl.SRC_ALPHA
    | gl.ONE_MINUS_SRC_ALPHA
    | gl.DST_COLOR
    | gl.ONE_MINUS_DST_COLOR
    | gl.DST_ALPHA
    | gl.ONE_MINUS_DST_ALPHA
    | gl.CONSTANT_COLOR
    | gl.ONE_MINUS_CONSTANT_COLOR
    | gl.CONSTANT_ALPHA
    | gl.ONE_MINUS_CONSTANT_ALPHA
    | gl.SRC_ALPHA_SATURATE;
  dstAlpha: number;
}>;

export interface IModelInitializationOptions {
  /**
   * Shader 字符串，假设此时已经经过 ShaderLib 处理
   */
  vs: string;
  fs: string;

  defines?: Record<string, number | boolean>;

  uniforms?: {
    [key: string]: IUniform;
  };

  attributes: {
    [key: string]: IAttribute;
  };

  /**
   * gl.POINTS | gl.TRIANGLES | ...
   * 默认值 gl.TRIANGLES
   */
  primitive?: gl.POINTS | gl.LINES | gl.LINE_LOOP | gl.LINE_STRIP | gl.TRIANGLES | gl.TRIANGLE_FAN | gl.TRIANGLE_STRIP;
  // 绘制的顶点数目
  count?: number;
  // 默认值为 0
  offset?: number;

  /**
   * gl.drawElements
   */
  elements?: IElements;
  /**
   * 绘制实例数目
   */
  instances?: number;

  colorMask?: [boolean, boolean, boolean, boolean];

  /**
   * depth buffer
   */
  depth?: Partial<{
    // gl.enable(gl.DEPTH_TEST)
    enable: boolean;
    // gl.depthMask
    mask: boolean;
    // gl.depthFunc
    func: gl.NEVER | gl.ALWAYS | gl.LESS | gl.LEQUAL | gl.GREATER | gl.GEQUAL | gl.EQUAL | gl.NOTEQUAL;
    // gl.depthRange
    range: [0, 1];
  }>;

  /**
   * blending
   */
  blend?: Partial<IBlendOptions>;

  /**
   * stencil
   */
  stencil?: Partial<{
    // gl.enable(gl.STENCIL_TEST)
    enable: boolean;
    // gl.stencilMask
    mask: number;
    func: {
      cmp: gl.NEVER | gl.ALWAYS | gl.LESS | gl.LEQUAL | gl.GREATER | gl.GEQUAL | gl.EQUAL | gl.NOTEQUAL;
      ref: number;
      mask: number;
    };
    opFront: {
      fail: stencilOp;
      zfail: stencilOp;
      zpass: stencilOp;
    };
    opBack: {
      fail: stencilOp;
      zfail: stencilOp;
      zpass: stencilOp;
    };
  }>;

  /**
   * cull
   */
  cull?: Partial<{
    // gl.enable(gl.CULL_FACE)
    enable: boolean;
    // gl.cullFace
    face: gl.FRONT | gl.BACK;
  }>;

  scissor?: Partial<{
    enable: boolean;
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

export interface IModelDrawOptions {
  uniforms?: {
    [key: string]: IUniform;
  };

  attributes?: {
    [key: string]: IAttribute;
  };
  elements?: IElements;

  blend?: IBlendOptions;
}

/**
 * 类似 THREE.Mesh，不同之处在于可以不依赖 THREE.Scene，单独执行封装的渲染命令。
 * 这些命令包括：
 * * 执行 Shader Program
 * * 开启/控制 WebGL 状态(gl.enable)例如 depth/stencil buffer、blending、cull 等
 * * 销毁资源，例如 buffer texture 等
 */
export interface IModel {
  addUniforms(uniforms: { [key: string]: IUniform }): void;
  draw(options: IModelDrawOptions): void;
  destroy(): void;
}

export interface IRenderbufferInitializationOptions {
  width: number;
  height: number;

  /**
   * gl.RGBA4 | gl.DEPTH_COMPONENT16...
   */
  format: gl.RGBA4 | gl.RGB565 | gl.RGB5_A1 | gl.DEPTH_COMPONENT16 | gl.STENCIL_INDEX8 | gl.DEPTH_STENCIL;
}

export interface IRenderbuffer {
  resize(options: { width: number; height: number }): void;

  /**
   * gl.deleteRenderbuffer
   */
  destroy(): void;
}

export interface ITexture2DInitializationOptions {
  /**
   * 纹理尺寸
   */
  width: number;
  height: number;

  /**
   * 纹理格式
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  format?:
    | gl.ALPHA
    | gl.LUMINANCE
    | gl.LUMINANCE_ALPHA
    | gl.RGB
    | gl.RGBA
    | gl.RGBA4
    | gl.RGB5_A1
    | gl.RGB565
    | gl.DEPTH_COMPONENT
    | gl.DEPTH_STENCIL;

  /**
   * 纹理数据类型，可能需要引入扩展，例如 ext.HALF_FLOAT_OES
   */
  type?: gl.UNSIGNED_BYTE | gl.UNSIGNED_SHORT | gl.UNSIGNED_INT | gl.FLOAT;

  /**
   * 纹理 pixel source
   */
  data?:
    | undefined
    | HTMLCanvasElement
    | HTMLImageElement
    | number[]
    | number[][]
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Uint8ClampedArray;

  /**
   * 纹理参数
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/texParameter
   */
  /* Sets magnification filter. Default: 'nearest' */
  mag?: gl.NEAREST | gl.LINEAR;
  /* Sets minification filter. Default: 'nearest' */
  min?:
    | gl.NEAREST
    | gl.LINEAR
    | gl.LINEAR_MIPMAP_LINEAR
    | gl.NEAREST_MIPMAP_LINEAR
    | gl.LINEAR_MIPMAP_NEAREST
    | gl.NEAREST_MIPMAP_NEAREST;
  /* Sets wrap mode on S axis. Default: 'clamp' */
  wrapS?: gl.REPEAT | gl.CLAMP_TO_EDGE | gl.MIRRORED_REPEAT;
  /* Sets wrap mode on T axis. Default: 'clamp' */
  wrapT?: gl.REPEAT | gl.CLAMP_TO_EDGE | gl.MIRRORED_REPEAT;
  aniso?: number;

  /**
   * 以下为 gl.pixelStorei 参数
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
   */
  /* Flips textures vertically when uploading. Default: false */
  flipY?: boolean;
  /* Sets unpack alignment per row. 1, 2, 4, 8 Default: 1 */
  alignment?: 1 | 2 | 4 | 8;
  /* Premultiply alpha when unpacking. Default: false */
  premultiplyAlpha?: boolean;
  /* color space flag for pixel unpacking. gl.BROWSER_DEFAULT_WEBGL | gl.NONE */
  colorSpace?: gl.NONE | gl.BROWSER_DEFAULT_WEBGL;

  mipmap?: boolean | gl.DONT_CARE | gl.NICEST | gl.FASTEST;

  // @see https://gpuweb.github.io/gpuweb/#gputextureusage
  usage?: gl.COPY_DST | gl.COPY_SRC | gl.RENDER_ATTACHMENT | gl.STORAGE | gl.SAMPLED;
}

export interface ITexture2D {
  get(): unknown;
  update(): void;
  resize(options: { width: number; height: number }): void;

  /**
   * 写入 subimage
   * gl.texSubImage2D gl.copyTexSubImage2D
   */
  // subImageData(options: {
  //   pixels,
  //   x,
  //   y,
  //   width,
  //   height,
  //   level,
  //   type,
  //   format
  // });

  /**
   * gl.deleteTexture
   */
  destroy(): void;
}

interface IStruct {
  [structPropName: string]: number | number[] | boolean | IStruct | IStruct[];
}

export type IUniform = BufferData | boolean | IFramebuffer | ITexture2D | IStruct;

export interface ICamera {
  getFrustum(): Frustum;
  getViewTransform(): mat4;
  getWorldTransform(): mat4;
  getPerspective(): mat4;
  getPosition(): vec3;
  getProjectionMode(): string;
  rotate(azimuth: number, elevation: number, roll: number): void;
  pan(tx: number, ty: number): void;
  dolly(value: number): void;
  changeAzimuth(az: number): void;
  changeElevation(el: number): void;
}

export interface IScene {
  getEntities(): Entity[];
}

export interface IViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IView {
  getCamera(): ICamera;
  // getScene(): IScene;
  getViewport(): IViewport;
  getClearColor(): [number, number, number, number];
  setCamera(camera: ICamera): IView;
  // setScene(scene: IScene): IView;
  setViewport(viewport: IViewport): IView;
  setClearColor(clearColor: [number, number, number, number]): IView;
  pick(position: { x: number; y: number }, view: IView): number | undefined;
}

export interface IRendererConfig {
  canvas?: HTMLCanvasElement;

  /**
   * Whether to use WGSL instead of GLSL 450
   */
  useWGSL?: boolean;

  /**
   * 是否开启 multi pass
   */
  enableMultiPassRenderer?: boolean;
  // passes?: Array<IPass<unknown>>;
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  /**
   * Defines the category of adapter to use.
   * Is it the discrete or integrated device.
   */
  powerPreference?: GPUPowerPreference;

  /**
   * Defines the device descriptor used to create a device.
   */
  deviceDescriptor?: GPUDeviceDescriptor;

  /**
   * Defines the requested Swap Chain Format.
   */
  swapChainFormat?: GPUTextureFormat;

  /**
   * Defines wether MSAA is enabled on the canvas.
   */
  antialiasing?: boolean;

  /**
   * Whether to support ComputePipeline.
   */
  supportCompute?: boolean;
}

export interface IClearOptions {
  // gl.clearColor
  color?: [number, number, number, number];
  // gl.clearDepth 默认值为 1
  depth?: number;
  // gl.clearStencil 默认值为 0
  stencil?: number;
  // gl.bindFrameBuffer
  framebuffer?: IFramebuffer | null;
}

export interface IReadPixelsOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  // gl.bindFrameBuffer
  framebuffer?: IFramebuffer;
  data?: Uint8Array;
}

export type BufferData =
  | number
  | number[]
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | ITexture2D;

export interface RenderingEngine {
  supportWebGPU: boolean;
  useWGSL: boolean;
  init(cfg: IRendererConfig): Promise<void>;
  clear(options: IClearOptions): void;
  createModel(options: IModelInitializationOptions): Promise<IModel>;
  createAttribute(options: IAttributeInitializationOptions): IAttribute;
  createBuffer(options: IBufferInitializationOptions): IBuffer;
  createElements(options: IElementsInitializationOptions): IElements;
  createTexture2D(options: ITexture2DInitializationOptions | HTMLImageElement): ITexture2D;
  createFramebuffer(options: IFramebufferInitializationOptions): IFramebuffer;
  useFramebuffer(framebuffer: IFramebuffer | null, drawCommands: () => void): void;
  getCanvas(): HTMLCanvasElement;
  getGLContext(): WebGLRenderingContext;
  getViewportSize(): { width: number; height: number };
  viewport(size: { x: number; y: number; width: number; height: number }): void;
  readPixels(options: IReadPixelsOptions): Uint8Array;
  setScissor(
    scissor: Partial<{
      enable: boolean;
      box: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>
  ): void;
  destroy(): void;
  beginFrame(): void;
  endFrame(): void;

  // GPGPU
  // createComputeModel(context: GLSLContext): Promise<IComputeModel>;
}
