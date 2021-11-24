import { Format } from './format';
import { GL } from './constants';

export enum ResourceType {
  Buffer,
  Texture,
  RenderTarget,
  Sampler,
  Program,
  Bindings,
  InputLayout,
  InputState,
  RenderPipeline,
  ComputePipeline,
  Readback,
  QueryPool,
}

export interface Disposable {
  destroy(): void;
}
export interface ResourceBase extends Disposable {
  id: number;
  name?: string;
}
export interface Buffer extends ResourceBase {
  type: ResourceType.Buffer;
  setSubData(
    dstByteOffset: number,
    src: ArrayBufferView,
    srcByteOffset?: number,
    byteLength?: number,
  ): void;
}
export interface Texture extends ResourceBase {
  type: ResourceType.Texture;
  setImageData(data: TexImageSource | ArrayBufferView[], firstMipLevel?: number): void;
}
export interface RenderTarget extends ResourceBase {
  type: ResourceType.RenderTarget;
}
export interface Sampler extends ResourceBase {
  type: ResourceType.Sampler;
}
export interface Program extends ResourceBase {
  type: ResourceType.Program;
}
export interface Bindings extends ResourceBase {
  type: ResourceType.Bindings;
}
export interface InputLayout extends ResourceBase {
  type: ResourceType.InputLayout;
}
export interface InputState extends ResourceBase {
  type: ResourceType.InputState;
}
export interface RenderPipeline extends ResourceBase {
  type: ResourceType.RenderPipeline;
}
export interface QueryPool extends ResourceBase {
  type: ResourceType.QueryPool;

  queryResultOcclusion(dstOffs: number): boolean | null;
}
export interface Readback extends ResourceBase {
  type: ResourceType.Readback;

  readTexture(
    t: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    dst: ArrayBufferView,
    dstOffset?: number,
    length?: number,
  ): Promise<ArrayBufferView>;

  readBuffer(
    b: Buffer,
    srcByteOffset?: number,
    dst?: ArrayBufferView,
    dstOffset?: number,
    length?: number,
  ): Promise<ArrayBufferView>;
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
  | InputState
  | RenderPipeline
  | ComputePipeline
  | Readback;

export enum CompareMode {
  Never = GL.NEVER,
  Less = GL.LESS,
  Equal = GL.EQUAL,
  LessEqual = GL.LEQUAL,
  Greater = GL.GREATER,
  NotEqual = GL.NOTEQUAL,
  GreaterEqual = GL.GEQUAL,
  Always = GL.ALWAYS,
}

export enum FrontFaceMode {
  CCW = GL.CCW,
  CW = GL.CW,
}

export const enum CullMode {
  None,
  Front,
  Back,
  FrontAndBack,
}

export enum BlendFactor {
  Zero = GL.ZERO,
  One = GL.ONE,
  Src = GL.SRC_COLOR,
  OneMinusSrc = GL.ONE_MINUS_SRC_COLOR,
  Dst = GL.DST_COLOR,
  OneMinusDst = GL.ONE_MINUS_DST_COLOR,
  SrcAlpha = GL.SRC_ALPHA,
  OneMinusSrcAlpha = GL.ONE_MINUS_SRC_ALPHA,
  DstAlpha = GL.DST_ALPHA,
  OneMinusDstAlpha = GL.ONE_MINUS_DST_ALPHA,
}

export enum BlendMode {
  Add = GL.FUNC_ADD,
  Subtract = GL.FUNC_SUBTRACT,
  ReverseSubtract = GL.FUNC_REVERSE_SUBTRACT,
}

export const enum WrapMode {
  Clamp,
  Repeat,
  Mirror,
}
export const enum TexFilterMode {
  Point,
  Bilinear,
}
export const enum MipFilterMode {
  NoMip,
  Nearest,
  Linear,
}
export const enum PrimitiveTopology {
  Points,
  Triangles,
  TriangleStrip,
  Lines,
  LineStrip,
}

/**
 * @see https://www.w3.org/TR/webgpu/#GPUBufferDescriptor
 */
export interface BufferDescriptor {
  viewOrSize: ArrayBufferView | number;
  usage: BufferUsage;
  flags?: GPUBufferUsageFlags;
  hint?: BufferFrequencyHint;
}

/**
 * @see https://www.w3.org/TR/webgpu/#buffer-usage
 */
export const enum BufferUsage {
  Index = 0x01,
  Vertex = 0x02,
  Uniform = 0x03,
  Storage = 0x04,
}

export const enum BufferFrequencyHint {
  Static = 0x01,
  Dynamic = 0x02,
}

export const enum VertexBufferFrequency {
  PerVertex = 0x01,
  PerInstance = 0x02,
}

export const enum TextureDimension {
  n2D,
  n2DArray,
  n3D,
  Cube,
}

export const enum TextureUsage {
  Sampled = 0x01,
  RenderTarget = 0x02,
}

export const enum ChannelWriteMask {
  None = 0x00,
  Red = 0x01,
  Green = 0x02,
  Blue = 0x04,
  Alpha = 0x08,

  RGB = 0x07,
  AllChannels = 0x0f,
}

export enum StencilOp {
  Keep = GL.KEEP,
  Zero = GL.ZERO,
  Replace = GL.REPLACE,
  Invert = GL.INVERT,
  IncrementClamp = GL.INCR,
  DecrementClamp = GL.DECR,
  IncrementWrap = GL.INCR_WRAP,
  DecrementWrap = GL.DECR_WRAP,
}

export interface VertexBufferDescriptor {
  buffer: Buffer;
  byteOffset: number;
}

export interface IndexBufferDescriptor extends VertexBufferDescriptor {}

export interface VertexAttributeDescriptor {
  location: number;
  format: Format;
  bufferIndex: number;
  bufferByteOffset: number;
  byteStride?: number;
  divisor?: number;
}

export interface InputLayoutBufferDescriptor {
  byteStride: number;
  frequency: VertexBufferFrequency;
}

export interface TextureDescriptor {
  dimension: TextureDimension;
  pixelFormat: Format;
  width: number;
  height: number;
  depth: number;
  numLevels: number;
  usage: TextureUsage;
  immutable?: boolean;
}

export function makeTextureDescriptor2D(
  pixelFormat: Format,
  width: number,
  height: number,
  numLevels: number,
): TextureDescriptor {
  const dimension = TextureDimension.n2D,
    depth = 1;
  const usage = TextureUsage.Sampled;
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
  sampleCount: number;
  texture?: Texture;
}

export interface BufferBinding {
  buffer: Buffer;
  wordCount: number;
}

export interface SamplerBinding {
  texture: Texture | null;
  sampler: Sampler | null;
  lateBinding: string | null;
}

export const enum SamplerFormatKind {
  Float,
  Uint,
  Sint,
  Depth,
}

export interface BindingLayoutSamplerDescriptor {
  dimension: TextureDimension;
  formatKind: SamplerFormatKind;
}

export interface BindingLayoutDescriptor {
  numUniformBuffers?: number;
  numSamplers?: number;
  // numReadOnlyStorageBuffers?: number;
  // numStorageBuffers?: number;
  samplerEntries?: BindingLayoutSamplerDescriptor[];
}

export interface BindingsDescriptor {
  bindingLayout: BindingLayoutDescriptor;
  // infer from shader module @see https://www.w3.org/TR/webgpu/#dom-gpupipelinebase-getbindgrouplayout
  pipeline?: RenderPipeline | ComputePipeline;
  uniformBufferBindings?: BufferBinding[];
  samplerBindings?: SamplerBinding[];
}

export interface ProgramDescriptorSimple {
  preprocessedVert?: string;
  preprocessedFrag?: string;
  preprocessedCompute?: string;
}

export interface ProgramDescriptor extends ProgramDescriptorSimple {
  ensurePreprocessed(vendorInfo: VendorInfo): void;
  associate(device: Device, program: Program): void;
}

export interface InputLayoutDescriptor {
  vertexBufferDescriptors: (InputLayoutBufferDescriptor | null)[];
  vertexAttributeDescriptors: VertexAttributeDescriptor[];
  indexBufferFormat: Format | null;
}

export interface ChannelBlendState {
  blendMode: BlendMode;
  blendSrcFactor: BlendFactor;
  blendDstFactor: BlendFactor;
}

export interface AttachmentState {
  channelWriteMask: ChannelWriteMask;
  rgbBlendState: ChannelBlendState;
  alphaBlendState: ChannelBlendState;
}

export interface MegaStateDescriptor {
  attachmentsState: AttachmentState[];
  blendConstant: Color;
  depthCompare: CompareMode;
  depthWrite: boolean;
  stencilCompare: CompareMode;
  stencilWrite: boolean;
  stencilPassOp: StencilOp;
  cullMode: CullMode;
  frontFace: FrontFaceMode;
  polygonOffset: boolean;
}

export interface PipelineDescriptor {
  bindingLayouts: BindingLayoutDescriptor[];
  inputLayout: InputLayout | null;
  program: Program;
}

export interface RenderPipelineDescriptor extends PipelineDescriptor {
  topology: PrimitiveTopology;
  megaStateDescriptor: MegaStateDescriptor;

  // Attachment data.
  colorAttachmentFormats: (Format | null)[];
  depthStencilAttachmentFormat: Format | null;
  sampleCount: number;
}

export interface ComputePipelineDescriptor extends PipelineDescriptor {}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface RenderPassDescriptor {
  colorAttachment: (RenderTarget | null)[];
  colorClearColor: (Color | 'load')[];
  colorResolveTo: (Texture | null)[];
  colorStore: boolean[];
  depthStencilAttachment: RenderTarget | null;
  depthStencilResolveTo: Texture | null;
  depthStencilStore: boolean;
  depthClearValue: number | 'load';
  stencilClearValue: number | 'load';

  // Query system.
  occlusionQueryPool: QueryPool | null;
}

export interface ComputePassDescriptor {}

export interface DeviceLimits {
  uniformBufferWordAlignment: number;
  uniformBufferMaxPageWordSize: number;
  readonly supportedSampleCounts: number[];
}

export interface DebugGroup {
  name: string;
  drawCallCount: number;
  textureBindCount: number;
  bufferUploadCount: number;
  triangleCount: number;
}

export const enum ViewportOrigin {
  LowerLeft,
  UpperLeft,
}

export const enum ClipSpaceNearZ {
  NegativeOne,
  Zero,
}

export interface VendorInfo {
  readonly platformString: string;
  readonly glslVersion: string;
  readonly explicitBindingLocations: boolean;
  readonly separateSamplerTextures: boolean;
  readonly viewportOrigin: ViewportOrigin;
  readonly clipSpaceNearZ: ClipSpaceNearZ;
  readonly supportsSyncPipelineCompilation: boolean;
  readonly supportMRT: boolean;
}

export type PlatformFramebuffer = WebGLFramebuffer;

// Viewport in normalized coordinate space, from 0 to 1.
export interface NormalizedViewportCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SwapChain {
  // @see https://www.w3.org/TR/webgpu/#canvas-configuration
  configureSwapChain(
    width: number,
    height: number,
    platformFramebuffer?: PlatformFramebuffer,
  ): void;
  getDevice(): Device;
  getCanvas(): HTMLCanvasElement | OffscreenCanvas;
  getOnscreenTexture(): Texture;
  present(): void;
}

export interface RenderPass {
  // State management.
  setViewport(x: number, y: number, w: number, h: number): void;
  setScissor(x: number, y: number, w: number, h: number): void;
  setPipeline(pipeline: RenderPipeline): void;
  setBindings(bindingLayoutIndex: number, bindings: Bindings, dynamicByteOffsets: number[]): void;
  setInputState(inputState: InputState | null): void;
  setStencilRef(value: number): void;

  // Draw commands.
  draw(vertexCount: number, firstVertex: number): void;
  drawIndexed(indexCount: number, firstIndex: number): void;
  drawIndexedInstanced(indexCount: number, firstIndex: number, instanceCount: number): void;

  // Query system.
  beginOcclusionQuery(dstOffs: number): void;
  endOcclusionQuery(dstOffs: number): void;

  // Debug.
  beginDebugGroup(name: string): void;
  endDebugGroup(): void;
}

export interface ComputePass {
  setPipeline(pipeline: ComputePipeline): void;
  setBindings(bindingLayoutIndex: number, bindings: Bindings): void;
  /**
   * @see https://www.w3.org/TR/webgpu/#compute-pass-encoder-dispatch
   */
  dispatch(x: number, y?: number, z?: number): void;
}

export const enum QueryPoolType {
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
  createBuffer(descriptor: BufferDescriptor): Buffer;
  createTexture(descriptor: TextureDescriptor): Texture;
  createSampler(descriptor: SamplerDescriptor): Sampler;
  createRenderTarget(descriptor: RenderTargetDescriptor): RenderTarget;
  createRenderTargetFromTexture(texture: Texture): RenderTarget;
  createProgram(program: ProgramDescriptor): Program;
  createProgramSimple(program: ProgramDescriptorSimple): Program;
  createBindings(bindingsDescriptor: BindingsDescriptor): Bindings;
  createInputLayout(inputLayoutDescriptor: InputLayoutDescriptor): InputLayout;
  createInputState(
    inputLayout: InputLayout,
    buffers: (VertexBufferDescriptor | null)[],
    indexBuffer: IndexBufferDescriptor | null,
    program?: Program,
  ): InputState;
  createRenderPipeline(descriptor: RenderPipelineDescriptor): RenderPipeline;
  createComputePipeline(descriptor: ComputePipelineDescriptor): ComputePipeline;
  createReadback(): Readback;
  createQueryPool(type: QueryPoolType, elemCount: number): QueryPool;

  createRenderPass(renderPassDescriptor: RenderPassDescriptor): RenderPass;
  createComputePass(computePassDescriptor: ComputePassDescriptor): ComputePass;
  submitPass(pass: RenderPass | ComputePass): void;

  copySubTexture2D(
    dst: Texture,
    dstX: number,
    dstY: number,
    src: Texture,
    srcX: number,
    srcY: number,
  ): void;

  // Information queries.
  queryLimits(): DeviceLimits;
  queryTextureFormatSupported(format: Format, width: number, height: number): boolean;
  queryPipelineReady(o: RenderPipeline): boolean;
  queryPlatformAvailable(): boolean;
  queryVendorInfo(): VendorInfo;
  queryRenderPass(o: RenderPass): Readonly<RenderPassDescriptor>;
  queryRenderTarget(o: RenderTarget): Readonly<RenderTargetDescriptor>;

  // Debugging.
  setResourceName(o: Resource, s: string): void;
  setResourceLeakCheck(o: Resource, v: boolean): void;
  checkForLeaks(): void;
  programPatched(o: Program, descriptor: ProgramDescriptorSimple): void;
  pushDebugGroup(debugGroup: DebugGroup): void;
  popDebugGroup(): void;
}
