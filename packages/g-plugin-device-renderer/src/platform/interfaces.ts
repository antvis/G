import type { EventEmitter } from 'eventemitter3';
import { GL } from './constants';
import type { Format } from './format';

export enum ResourceType {
  Buffer,
  Texture,
  RenderTarget,
  Sampler,
  Program,
  Bindings,
  InputLayout,
  RenderPipeline,
  ComputePipeline,
  Readback,
  QueryPool,
}

export interface Disposable {
  destroy: () => void;
}

export interface ResourceBase extends Disposable, EventEmitter {
  id: number;
  name?: string;
}
export interface Buffer extends ResourceBase {
  type: ResourceType.Buffer;
  setSubData: (
    dstByteOffset: number,
    src: Uint8Array,
    srcByteOffset?: number,
    byteLength?: number,
  ) => void;
}
export interface Texture extends ResourceBase {
  type: ResourceType.Texture;
  setImageData: (
    data: TexImageSource | ArrayBufferView[],
    firstMipLevel?: number,
  ) => void;
}
export interface RenderTarget extends ResourceBase {
  type: ResourceType.RenderTarget;
}
export interface Sampler extends ResourceBase {
  type: ResourceType.Sampler;
}
export interface Program extends ResourceBase {
  type: ResourceType.Program;
  setUniformsLegacy: (uniforms: Record<string, any>) => void;
}
export interface Bindings extends ResourceBase {
  type: ResourceType.Bindings;
}
export interface InputLayout extends ResourceBase {
  type: ResourceType.InputLayout;
}
export interface RenderPipeline extends ResourceBase {
  type: ResourceType.RenderPipeline;
}
export interface QueryPool extends ResourceBase {
  type: ResourceType.QueryPool;

  queryResultOcclusion: (dstOffs: number) => boolean | null;
}
export interface Readback extends ResourceBase {
  type: ResourceType.Readback;

  readTexture: (
    t: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    dst: ArrayBufferView,
    dstOffset?: number,
    length?: number,
  ) => Promise<ArrayBufferView>;

  readTextureSync: (
    t: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    dst: ArrayBufferView,
    dstOffset?: number,
    length?: number,
  ) => ArrayBufferView;

  readBuffer: (
    b: Buffer,
    srcByteOffset?: number,
    dst?: ArrayBufferView,
    dstOffset?: number,
    length?: number,
  ) => Promise<ArrayBufferView>;
}
export interface ComputePipeline extends ResourceBase {
  type: ResourceType.ComputePipeline;
}

export type Resource =
  | Buffer
  | Texture
  | RenderTarget
  | Sampler
  | Program
  | Bindings
  | InputLayout
  | RenderPipeline
  | ComputePipeline
  | Readback;

export enum CompareMode {
  NEVER = GL.NEVER,
  LESS = GL.LESS,
  EQUAL = GL.EQUAL,
  LEQUAL = GL.LEQUAL,
  GREATER = GL.GREATER,
  NOTEQUAL = GL.NOTEQUAL,
  GEQUAL = GL.GEQUAL,
  ALWAYS = GL.ALWAYS,
}

export enum FrontFace {
  CCW = GL.CCW,
  CW = GL.CW,
}

export enum CullMode {
  NONE,
  FRONT,
  BACK,
  FRONT_AND_BACK,
}

/**
 * Blend factor RGBA components.
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpublendfactor
 */
export enum BlendFactor {
  /**
   * (0, 0, 0, 0)
   */
  ZERO = GL.ZERO,
  /**
   * (1, 1, 1, 1)
   */
  ONE = GL.ONE,
  /**
   * (Rsrc, Gsrc, Bsrc, Asrc)
   */
  SRC = GL.SRC_COLOR,
  /**
   * (1 - Rsrc, 1 - Gsrc, 1 - Bsrc, 1 - Asrc)
   */
  ONE_MINUS_SRC = GL.ONE_MINUS_SRC_COLOR,
  /**
   * (Rdst, Gdst, Bdst, Adst)
   */
  DST = GL.DST_COLOR,
  /**
   * (1 - Rdst, 1 - Gdst, 1 - Bdst, 1 - Adst)
   */
  ONE_MINUS_DST = GL.ONE_MINUS_DST_COLOR,
  /**
   * (Asrc, Asrc, Asrc, Asrc)
   */
  SRC_ALPHA = GL.SRC_ALPHA,
  /**
   * (1 - Asrc, 1 - Asrc, 1 - Asrc, 1 - Asrc)
   */
  ONE_MINUS_SRC_ALPHA = GL.ONE_MINUS_SRC_ALPHA,
  /**
   * (Adst, Adst, Adst, Adst)
   */
  DST_ALPHA = GL.DST_ALPHA,
  /**
   * (1 - Adst, 1 - Adst, 1 - Adst, 1 - Adst)
   */
  ONE_MINUS_DST_ALPHA = GL.ONE_MINUS_DST_ALPHA,
  /**
   * (Rconst, Gconst, Bconst, Aconst)
   */
  CONST = GL.CONSTANT_COLOR,
  /**
   * (1 - Rconst, 1 - Gconst, 1 - Bconst, 1 - Aconst)
   */
  ONE_MINUS_CONSTANT = GL.ONE_MINUS_CONSTANT_COLOR,
  /**
   * (min(Asrc, 1 - Adst), min(Asrc, 1 - Adst), min(Asrc, 1 - Adst), 1)
   */
  SRC_ALPHA_SATURATE = GL.SRC_ALPHA_SATURATE,
}

/**
 * Defines the algorithm used to combine source and destination blend factors.
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpublendoperation
 */
export enum BlendMode {
  /**
   * RGBAsrc × RGBAsrcFactor + RGBAdst × RGBAdstFactor
   */
  ADD = GL.FUNC_ADD,
  /**
   * RGBAsrc × RGBAsrcFactor - RGBAdst × RGBAdstFactor
   */
  SUBSTRACT = GL.FUNC_SUBTRACT,
  /**
   * RGBAdst × RGBAdstFactor - RGBAsrc × RGBAsrcFactor
   */
  REVERSE_SUBSTRACT = GL.FUNC_REVERSE_SUBTRACT,
  // TODO: WebGL 1 should use ext
  // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation#parameters
  /**
   * min(RGBAsrc, RGBAdst)
   */
  MIN = GL.MIN,
  /**
   * max(RGBAsrc, RGBAdst)
   */
  MAX = GL.MAX,
}

export enum WrapMode {
  CLAMP,
  REPEAT,
  MIRROR,
}
export enum TexFilterMode {
  POINT,
  BILINEAR,
}
export enum MipFilterMode {
  NO_MIP,
  NEAREST,
  LINEAR,
}
export enum PrimitiveTopology {
  POINTS,
  TRIANGLES,
  TRIANGLE_STRIP,
  LINES,
  LINE_STRIP,
}

/**
 * @see https://www.w3.org/TR/webgpu/#GPUBufferDescriptor
 */
export interface BufferDescriptor {
  viewOrSize: ArrayBufferView | number;
  usage: BufferUsage;
  hint?: BufferFrequencyHint;
}

/**
 * @see https://www.w3.org/TR/webgpu/#buffer-usage
 */
export enum BufferUsage {
  MAP_READ = 0x0001,
  MAP_WRITE = 0x0002,
  COPY_SRC = 0x0004,
  COPY_DST = 0x0008,
  INDEX = 0x0010,
  VERTEX = 0x0020,
  UNIFORM = 0x0040,
  STORAGE = 0x0080,
  INDIRECT = 0x0100,
  QUERY_RESOLVE = 0x0200,
}

export enum BufferFrequencyHint {
  STATIC = 0x01,
  DYNAMIC = 0x02,
}

/**
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuvertexstepmode
 */
export enum VertexStepMode {
  VERTEX = 0x01,
  INSTANCE = 0x02,
}

export enum TextureEvent {
  LOADED = 'loaded',
}

export enum TextureDimension {
  TEXTURE_2D,
  TEXTURE_2D_ARRAY,
  TEXTURE_3D,
  TEXTURE_CUBE_MAP,
}

export enum TextureUsage {
  SAMPLED = 0x01,
  RENDER_TARGET = 0x02,
}

export enum ChannelWriteMask {
  NONE = 0x00,
  RED = 0x01,
  GREEN = 0x02,
  BLUE = 0x04,
  ALPHA = 0x08,
  RGB = 0x07,
  ALL = 0x0f,
}

/**
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpustenciloperation
 */
export enum StencilOp {
  KEEP = GL.KEEP,
  ZERO = GL.ZERO,
  REPLACE = GL.REPLACE,
  INVERT = GL.INVERT,
  INCREMENT_CLAMP = GL.INCR,
  DECREMENT_CLAMP = GL.DECR,
  INCREMENT_WRAP = GL.INCR_WRAP,
  DECREMENT_WRAP = GL.DECR_WRAP,
}

export interface VertexBufferDescriptor {
  buffer: Buffer;
  byteOffset?: number;
}

export type IndexBufferDescriptor = VertexBufferDescriptor;

export interface VertexAttributeDescriptor {
  location: number;
  format: Format;
  bufferIndex: number;
  bufferByteOffset: number;
  divisor?: number;
}

export interface InputLayoutBufferDescriptor {
  byteStride: number;
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpuvertexbufferlayout-stepmode
   */
  stepMode: VertexStepMode;
}

export interface TextureDescriptor {
  dimension?: TextureDimension;
  pixelFormat: Format;
  width: number;
  height: number;
  depth?: number;
  numLevels?: number;
  usage: TextureUsage;
  immutable?: boolean;
  pixelStore?: Partial<{
    packAlignment: number;
    unpackAlignment: number;
    unpackFlipY: boolean;
  }>;
}

export function makeTextureDescriptor2D(
  pixelFormat: Format,
  width: number,
  height: number,
  numLevels: number,
): TextureDescriptor {
  const dimension = TextureDimension.TEXTURE_2D,
    depth = 1;
  const usage = TextureUsage.SAMPLED;
  return { dimension, pixelFormat, width, height, depth, numLevels, usage };
}

export interface SamplerDescriptor {
  wrapS: WrapMode;
  wrapT: WrapMode;
  wrapQ?: WrapMode;
  minFilter: TexFilterMode;
  magFilter: TexFilterMode;
  mipFilter: MipFilterMode;
  minLOD?: number;
  maxLOD?: number;
  maxAnisotropy?: number;
  compareMode?: CompareMode;
}

export interface RenderTargetDescriptor {
  pixelFormat: Format;
  width: number;
  height: number;
  sampleCount?: number;
  texture?: Texture;
}

export interface BufferBinding {
  buffer: Buffer;
  wordCount: number;
}

export interface SamplerBinding {
  texture: Texture | null;
  sampler: Sampler | null;
}

export enum SamplerFormatKind {
  Float,
  Uint,
  Sint,
  Depth,
}

export type BufferBindingType = 'uniform' | 'storage' | 'read-only-storage';

export interface BindingLayoutSamplerDescriptor {
  dimension: TextureDimension;
  formatKind: SamplerFormatKind;
  comparison?: boolean;
}

export interface BindingLayoutStorageDescriptor {
  type: BufferBindingType;
}

export interface BindingLayoutDescriptor {
  numUniformBuffers?: number;
  numSamplers?: number;
  storageEntries?: BindingLayoutStorageDescriptor[]; // used in compute shader
  samplerEntries?: BindingLayoutSamplerDescriptor[];
}

export interface BindingsDescriptor {
  bindingLayout: BindingLayoutDescriptor;
  // infer from shader module @see https://www.w3.org/TR/webgpu/#dom-gpupipelinebase-getbindgrouplayout
  pipeline?: RenderPipeline | ComputePipeline;
  uniformBufferBindings?: BufferBinding[];
  samplerBindings?: SamplerBinding[];
  storageBufferBindings?: BufferBinding[];
}

/**
 * Support the following shaderStage: vertex | fragment | compute.
 */
export interface ProgramDescriptor {
  vertex?: {
    glsl?: string;
    wgsl?: string;
  };
  fragment?: {
    glsl?: string;
    wgsl?: string;
  };
  compute?: {
    wgsl: string;
  };
}

export interface ProgramDescriptorSimple {
  vert?: string;
  frag?: string;
  preprocessedVert?: string;
  preprocessedFrag?: string;
  preprocessedCompute?: string;
}

export interface InputLayoutDescriptor {
  vertexBufferDescriptors: (InputLayoutBufferDescriptor | null)[];
  vertexAttributeDescriptors: VertexAttributeDescriptor[];
  indexBufferFormat: Format | null;
  /**
   * Read attributes from linked program.
   */
  program: Program;
}

export interface ChannelBlendState {
  blendMode: BlendMode;
  blendSrcFactor: BlendFactor;
  blendDstFactor: BlendFactor;
}

export interface AttachmentState {
  channelWriteMask?: ChannelWriteMask;
  rgbBlendState: ChannelBlendState;
  alphaBlendState: ChannelBlendState;
}

export interface MegaStateDescriptor {
  attachmentsState: AttachmentState[];
  blendConstant?: Color;
  depthCompare?: CompareMode;
  depthWrite?: boolean;
  stencilCompare?: CompareMode;
  stencilWrite?: boolean;
  stencilPassOp?: StencilOp;
  stencilRef?: number;
  cullMode?: CullMode;
  frontFace?: FrontFace;
  polygonOffset?: boolean;
}

export interface PipelineDescriptor {
  bindingLayouts?: BindingLayoutDescriptor[];
  inputLayout: InputLayout | null;
  program: Program;
}

export interface RenderPipelineDescriptor extends PipelineDescriptor {
  topology?: PrimitiveTopology;
  megaStateDescriptor?: MegaStateDescriptor;

  // Attachment data.
  colorAttachmentFormats: (Format | null)[];
  depthStencilAttachmentFormat?: Format | null;
  sampleCount?: number;
}

export type ComputePipelineDescriptor = PipelineDescriptor;

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface RenderPassDescriptor {
  colorAttachment: (RenderTarget | null)[];
  colorAttachmentLevel?: number[];
  colorClearColor?: (Color | 'load')[];
  colorResolveTo: (Texture | null)[];
  colorResolveToLevel?: number[];
  colorStore?: boolean[];
  depthStencilAttachment?: RenderTarget | null;
  depthStencilResolveTo?: Texture | null;
  depthStencilStore?: boolean;
  depthClearValue?: number | 'load';
  stencilClearValue?: number | 'load';
  occlusionQueryPool?: QueryPool | null;
}

export interface DeviceLimits {
  uniformBufferWordAlignment: number;
  uniformBufferMaxPageWordSize: number;
  readonly supportedSampleCounts: number[];
  occlusionQueriesRecommended: boolean;
  computeShadersSupported: boolean;
}

export interface DebugGroup {
  name: string;
  drawCallCount: number;
  textureBindCount: number;
  bufferUploadCount: number;
  triangleCount: number;
}

export enum ViewportOrigin {
  LOWER_LEFT,
  UPPER_LEFT,
}

export enum ClipSpaceNearZ {
  NEGATIVE_ONE,
  ZERO,
}

export interface VendorInfo {
  readonly platformString: string;
  readonly glslVersion: string;
  readonly explicitBindingLocations: boolean;
  readonly separateSamplerTextures: boolean;
  readonly viewportOrigin: ViewportOrigin;
  readonly clipSpaceNearZ: ClipSpaceNearZ;
  readonly supportMRT: boolean;
}

export type PlatformFramebuffer = WebGLFramebuffer;

export interface SwapChain {
  // @see https://www.w3.org/TR/webgpu/#canvas-configuration
  configureSwapChain: (
    width: number,
    height: number,
    platformFramebuffer?: PlatformFramebuffer,
  ) => void;
  getDevice: () => Device;
  getCanvas: () => HTMLCanvasElement | OffscreenCanvas;
  getOnscreenTexture: () => Texture;
}

/**
 * @see https://www.w3.org/TR/webgpu/#debug-markers
 */
interface DebugCommandsMixin {
  pushDebugGroup: (groupLabel: string) => void;
  popDebugGroup: () => void;
  insertDebugMarker: (markerLabel: string) => void;
}

export interface RenderPass extends DebugCommandsMixin {
  // State management.
  setViewport: (x: number, y: number, w: number, h: number) => void;
  setScissor: (x: number, y: number, w: number, h: number) => void;
  setPipeline: (pipeline: RenderPipeline) => void;
  setBindings: (
    bindingLayoutIndex: number,
    bindings: Bindings,
    dynamicByteOffsets: number[],
  ) => void;
  setVertexInput: (
    inputLayout: InputLayout | null,
    buffers: (VertexBufferDescriptor | null)[] | null,
    indexBuffer: IndexBufferDescriptor | null,
  ) => void;
  setStencilRef: (value: number) => void;

  // Draw commands.
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpurendercommandsmixin-draw
   */
  draw: (
    vertexCount: number,
    instanceCount?: number,
    firstVertex?: number,
    firstInstance?: number,
  ) => void;
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpurendercommandsmixin-drawindexed
   */
  drawIndexed: (
    indexCount: number,
    instanceCount?: number,
    firstIndex?: number,
    baseVertex?: number,
    firstInstance?: number,
  ) => void;
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpurendercommandsmixin-drawindirect
   */
  drawIndirect: (indirectBuffer: Buffer, indirectOffset: number) => void;

  // Query system.
  beginOcclusionQuery: (dstOffs: number) => void;
  endOcclusionQuery: (dstOffs: number) => void;
}

/**
 * @see https://www.w3.org/TR/webgpu/#compute-passes
 */
export interface ComputePass extends DebugCommandsMixin {
  setPipeline: (pipeline: ComputePipeline) => void;
  setBindings: (
    bindingLayoutIndex: number,
    bindings: Bindings,
    dynamicByteOffsets: number[],
  ) => void;
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpucomputepassencoder-dispatchworkgroups
   */
  dispatchWorkgroups: (
    workgroupCountX: number,
    workgroupCountY?: number,
    workgroupCountZ?: number,
  ) => void;
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpucomputepassencoder-dispatchworkgroupsindirect
   */
  dispatchWorkgroupsIndirect: (
    indirectBuffer: Buffer,
    indirectOffset: number,
  ) => void;
}

export enum QueryPoolType {
  OcclusionConservative,
}
/**
 * Device represents a "virtual GPU"
 * @see https://www.w3.org/TR/webgpu/#gpu-device
 *
 * Support following backends:
 * * webgl1 CanvasWebGLRenderingContext
 * * WebGL2 CanvasWebGL2RenderingContext
 * * WebGPU GPUDevice
 *
 * A bit about the design of this API; all resources are "opaque", meaning you cannot look at the
 * implementation details or underlying fields of the resources, and most objects cannot have their
 * creation parameters modified after they are created. So, while buffers and textures can have their
 * contents changed through data upload passes, they cannot be resized after creation. Create a new object
 * and destroy the old one if you wish to "resize" it.
 */
export interface Device {
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpudevice-createbuffer
   */
  createBuffer: (descriptor: BufferDescriptor) => Buffer;
  createTexture: (descriptor: TextureDescriptor) => Texture;
  createSampler: (descriptor: SamplerDescriptor) => Sampler;
  createRenderTarget: (descriptor: RenderTargetDescriptor) => RenderTarget;
  createRenderTargetFromTexture: (texture: Texture) => RenderTarget;
  createProgram: (program: ProgramDescriptor) => Program;
  createBindings: (bindingsDescriptor: BindingsDescriptor) => Bindings;
  createInputLayout: (
    inputLayoutDescriptor: InputLayoutDescriptor,
  ) => InputLayout;
  createRenderPipeline: (
    descriptor: RenderPipelineDescriptor,
  ) => RenderPipeline;
  createComputePipeline: (
    descriptor: ComputePipelineDescriptor,
  ) => ComputePipeline;
  createReadback: () => Readback;
  createQueryPool: (type: QueryPoolType, elemCount: number) => QueryPool;

  createRenderPass: (renderPassDescriptor: RenderPassDescriptor) => RenderPass;
  createComputePass: () => ComputePass;

  beginFrame(): void;
  endFrame(): void;
  submitPass: (pass: RenderPass | ComputePass) => void;
  destroy(): void;

  // Render pipeline compilation control.
  pipelineQueryReady: (o: RenderPipeline) => boolean;
  pipelineForceReady: (o: RenderPipeline) => void;

  copySubTexture2D: (
    dst: Texture,
    dstX: number,
    dstY: number,
    src: Texture,
    srcX: number,
    srcY: number,
  ) => void;

  // Information queries.
  queryLimits: () => DeviceLimits;
  queryTextureFormatSupported: (
    format: Format,
    width: number,
    height: number,
  ) => boolean;
  queryPlatformAvailable: () => boolean;
  queryVendorInfo: () => VendorInfo;
  queryRenderPass: (o: RenderPass) => Readonly<RenderPassDescriptor>;
  queryRenderTarget: (o: RenderTarget) => Readonly<RenderTargetDescriptor>;

  // Debugging.
  setResourceName: (o: Resource, s: string) => void;
  setResourceLeakCheck: (o: Resource, v: boolean) => void;
  checkForLeaks: () => void;
  programPatched: (o: Program, descriptor: ProgramDescriptor) => void;
}
