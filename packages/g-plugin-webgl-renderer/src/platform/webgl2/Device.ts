import {
  Format,
  FormatCompFlags,
  getFormatCompFlags,
  FormatTypeFlags,
  getFormatTypeFlags,
  getFormatCompByteSize,
  getFormatFlags,
  FormatFlags,
} from '..';
import { White } from '../../utils/color';
import { GL } from '../constants';
import {
  AttachmentState,
  Bindings,
  BindingsDescriptor,
  Buffer,
  BufferDescriptor,
  ChannelWriteMask,
  ClipSpaceNearZ,
  CompareMode,
  ComputePass,
  ComputePassDescriptor,
  ComputePipeline,
  ComputePipelineDescriptor,
  CullMode,
  DebugGroup,
  Device,
  DeviceLimits,
  IndexBufferDescriptor,
  InputLayout,
  InputLayoutDescriptor,
  InputState,
  MegaStateDescriptor,
  MipFilterMode,
  PlatformFramebuffer,
  Program,
  ProgramDescriptorSimple,
  Readback,
  RenderPass,
  RenderPassDescriptor,
  RenderPipeline,
  RenderPipelineDescriptor,
  RenderTarget,
  RenderTargetDescriptor,
  Resource,
  ResourceType,
  Sampler,
  SamplerDescriptor,
  SwapChain,
  TexFilterMode,
  Texture,
  TextureDescriptor,
  TextureDimension,
  TextureUsage,
  VendorInfo,
  VertexBufferDescriptor,
  VertexBufferFrequency,
  ViewportOrigin,
} from '../interfaces';
import {
  colorCopy,
  colorEqual,
  copyMegaState,
  defaultMegaState,
  nullify,
  assert,
  assertExists,
  range,
  prependLineNo,
} from '../utils';
import { Bindings_GL } from './Bindings';
import { Buffer_GL } from './Buffer';
import { InputLayout_GL } from './InputLayout';
import { InputState_GL } from './InputState';
import {
  EXT_texture_compression_rgtc,
  GPlatformWebGL2Config,
  KHR_parallel_shader_compile,
  OES_draw_buffers_indexed,
} from './interfaces';
import { ProgramCompileState_GL, Program_GL } from './Program';
import { Readback_GL } from './Readback';
import { RenderPass_GL, RenderPassCmd } from './RenderPass';
import { RenderPipeline_GL } from './RenderPipeline';
import { RenderTarget_GL } from './RenderTarget';
import { ResourceCreationTracker } from './ResourceCreationTracker';
import { Sampler_GL } from './Sampler';
import { Texture_GL } from './Texture';
import {
  isFormatSizedInteger,
  getPlatformBuffer,
  getPlatformTexture,
  getPlatformSampler,
  assignPlatformName,
  findall,
  isBlendStateNone,
  isTextureFormatCompressed,
  isWebGL2,
} from './utils';

// This is a workaround for ANGLE not supporting UBOs greater than 64kb (the limit of D3D).
// https://bugs.chromium.org/p/angleproject/issues/detail?id=3388
const UBO_PAGE_MAX_BYTE_SIZE = 0x10000;

export class Device_GL implements SwapChain, Device {
  // Configuration
  private shaderDebug = false;
  private contextAttributes: WebGLContextAttributes;

  // GL extensions
  // @see https://developer.mozilla.org/zh-CN/docs/Web/API/OES_vertex_array_object
  OES_vertex_array_object: OES_vertex_array_object | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays
  ANGLE_instanced_arrays: ANGLE_instanced_arrays | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float
  OES_texture_float: OES_texture_float | null = null;
  // @see https://www.khronos.org/registry/webgl/extensions/OES_draw_buffers_indexed/
  OES_draw_buffers_indexed: OES_draw_buffers_indexed | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_draw_buffers
  WEBGL_draw_buffers: WEBGL_draw_buffers | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
  WEBGL_depth_texture: WEBGL_depth_texture | null = null;
  WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc | null = null;
  WEBGL_compressed_texture_s3tc_srgb: WEBGL_compressed_texture_s3tc_srgb | null = null;
  EXT_texture_compression_rgtc: EXT_texture_compression_rgtc | null = null;
  EXT_texture_filter_anisotropic: EXT_texture_filter_anisotropic | null = null;
  KHR_parallel_shader_compile: KHR_parallel_shader_compile | null = null;

  /**
   * @see https://github.com/shrekshao/MoveWebGL1EngineToWebGL2/blob/master/Move-a-WebGL-1-Engine-To-WebGL-2-Blog-2.md#uniform-buffer
   */
  uniformBufferMaxPageByteSize: number;

  // Object pools
  private renderPassPool: RenderPass_GL[] = [];

  // Swap Chain
  private scTexture: Texture_GL | null = null;
  private scPlatformFramebuffer: WebGLFramebuffer | null = null;

  // Device
  private currentActiveTexture: GLenum | null = null;
  currentBoundVAO: WebGLVertexArrayObject | null = null;
  private currentProgram: Program_GL | null = null;

  resourceCreationTracker: ResourceCreationTracker | null = null;
  private resourceUniqueId = 0;

  // Cached GL driver state
  private currentColorAttachments: (RenderTarget_GL | null)[] = [];
  private currentColorResolveTos: (Texture_GL | null)[] = [];
  private currentDepthStencilAttachment: RenderTarget_GL | null;
  private currentDepthStencilResolveTo: Texture_GL | null = null;
  private currentSampleCount: number = -1;
  private currentPipeline: RenderPipeline_GL;
  private currentInputState: InputState_GL;
  private currentMegaState: MegaStateDescriptor = copyMegaState(defaultMegaState);
  private currentSamplers: (WebGLSampler | null)[] = [];

  currentTextures: (WebGLTexture | null)[] = [];

  private currentUniformBuffers: Buffer[] = [];
  private currentUniformBufferByteOffsets: number[] = [];
  private currentUniformBufferByteSizes: number[] = [];

  // Pass Execution
  private debugGroupStack: DebugGroup[] = [];
  private resolveColorAttachmentsChanged: boolean = false;
  private resolveColorReadFramebuffer: WebGLFramebuffer;
  private resolveColorDrawFramebuffer: WebGLFramebuffer;
  private resolveDepthStencilAttachmentsChanged: boolean = false;
  private resolveDepthStencilReadFramebuffer: WebGLFramebuffer;
  private resolveDepthStencilDrawFramebuffer: WebGLFramebuffer;
  private renderPassDrawFramebuffer: WebGLFramebuffer;
  readbackFramebuffer: WebGLFramebuffer;
  private blackTexture!: WebGLTexture;

  // VendorInfo
  readonly platformString: string;
  readonly glslVersion: string;
  readonly explicitBindingLocations = false;
  readonly separateSamplerTextures = false;
  readonly viewportOrigin = ViewportOrigin.LowerLeft;
  readonly clipSpaceNearZ = ClipSpaceNearZ.NegativeOne;
  readonly supportsSyncPipelineCompilation: boolean = true;
  readonly supportMRT: boolean = false;

  // GLimits
  uniformBufferWordAlignment: number;
  uniformBufferMaxPageWordSize: number;
  supportedSampleCounts: number[] = [];

  gl: WebGLRenderingContext | WebGL2RenderingContext;

  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    configuration: GPlatformWebGL2Config,
  ) {
    this.gl = gl;
    this.contextAttributes = assertExists(gl.getContextAttributes());

    if (!isWebGL2(gl)) {
      this.OES_vertex_array_object = gl.getExtension('OES_vertex_array_object');
      this.ANGLE_instanced_arrays = gl.getExtension('ANGLE_instanced_arrays');
      this.OES_texture_float = gl.getExtension('OES_texture_float');
      this.WEBGL_draw_buffers = gl.getExtension('WEBGL_draw_buffers');
      this.WEBGL_depth_texture = gl.getExtension('WEBGL_depth_texture');
      // @see https://developer.mozilla.org/en-US/docs/Web/API/OES_element_index_uint
      gl.getExtension('OES_element_index_uint');

      if (this.WEBGL_draw_buffers) {
        this.supportMRT = true;
      }
    } else {
      this.supportMRT = true;
    }

    this.WEBGL_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc');
    this.WEBGL_compressed_texture_s3tc_srgb = gl.getExtension('WEBGL_compressed_texture_s3tc_srgb');
    this.EXT_texture_compression_rgtc = gl.getExtension('EXT_texture_compression_rgtc');
    this.EXT_texture_filter_anisotropic = gl.getExtension('EXT_texture_filter_anisotropic');
    this.KHR_parallel_shader_compile = gl.getExtension('KHR_parallel_shader_compile');
    this.OES_draw_buffers_indexed = gl.getExtension('OES_draw_buffers_indexed');

    if (isWebGL2(gl)) {
      this.platformString = 'WebGL2';
      this.glslVersion = '#version 300 es';
    } else {
      this.platformString = 'WebGL1';
      this.glslVersion = '#version 100'; // 100 es not supported
    }

    // Create our fake swap-chain texture.
    this.scTexture = new Texture_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor: {
        width: 0,
        height: 0,
        depth: 1,
        dimension: TextureDimension.n2D,
        numLevels: 1,
        usage: TextureUsage.RenderTarget,
        pixelFormat: this.contextAttributes.alpha === false ? Format.U8_RGB_RT : Format.U8_RGBA_RT,
      },
      fake: true,
    });
    this.scTexture.gl_target = null;
    this.scTexture.gl_texture = null;

    this.resolveColorReadFramebuffer = this.ensureResourceExists(gl.createFramebuffer());
    this.resolveColorDrawFramebuffer = this.ensureResourceExists(gl.createFramebuffer());
    this.resolveDepthStencilReadFramebuffer = this.ensureResourceExists(gl.createFramebuffer());
    this.resolveDepthStencilDrawFramebuffer = this.ensureResourceExists(gl.createFramebuffer());
    this.renderPassDrawFramebuffer = this.ensureResourceExists(gl.createFramebuffer());
    this.readbackFramebuffer = this.ensureResourceExists(gl.createFramebuffer());

    this.blackTexture = this.ensureResourceExists(gl.createTexture());
    gl.bindTexture(GL.TEXTURE_2D, this.blackTexture);
    gl.texImage2D(
      GL.TEXTURE_2D,
      0,
      isWebGL2(gl) ? gl.RGBA8 : gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(4),
    );

    // Adjust for GL defaults.
    this.currentMegaState.depthCompare = CompareMode.Less;
    this.currentMegaState.depthWrite = false;
    this.currentMegaState.attachmentsState[0].channelWriteMask = ChannelWriteMask.AllChannels;

    // We always have depth test enabled.
    gl.enable(gl.DEPTH_TEST);

    this.checkLimits();

    if (configuration.shaderDebug) this.shaderDebug = true;

    if (configuration.trackResources) this.resourceCreationTracker = new ResourceCreationTracker();
  }

  private getNextUniqueId(): number {
    return ++this.resourceUniqueId;
  }

  private checkLimits(): void {
    const gl = this.gl;

    if (isWebGL2(gl)) {
      this.uniformBufferMaxPageByteSize = Math.min(
        gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE),
        UBO_PAGE_MAX_BYTE_SIZE,
      );

      const supportedSampleCounts = gl.getInternalformatParameter(
        gl.RENDERBUFFER,
        gl.DEPTH32F_STENCIL8,
        gl.SAMPLES,
      );
      this.supportedSampleCounts = supportedSampleCounts ? [...supportedSampleCounts] : [];

      this.uniformBufferWordAlignment = gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT) / 4;
    } else {
      // mock ubo in WebGL1
      this.uniformBufferWordAlignment = 64;
      this.uniformBufferMaxPageByteSize = UBO_PAGE_MAX_BYTE_SIZE;
    }

    this.uniformBufferMaxPageWordSize = this.uniformBufferMaxPageByteSize / 4;

    if (!this.supportedSampleCounts.includes(1)) {
      this.supportedSampleCounts.push(1);
    }
    this.supportedSampleCounts.sort((a, b) => a - b);
  }

  //#region SwapChain
  configureSwapChain(
    width: number,
    height: number,
    platformFramebuffer?: PlatformFramebuffer,
  ): void {
    const texture = this.scTexture as Texture_GL;
    texture.width = width;
    texture.height = height;
    this.scPlatformFramebuffer = nullify(platformFramebuffer);
  }

  getDevice(): Device {
    return this;
  }

  getCanvas(): HTMLCanvasElement | OffscreenCanvas {
    return this.gl.canvas;
  }

  getOnscreenTexture(): Texture {
    return this.scTexture!;
  }

  present(): void {
    const gl = this.gl;

    // TODO: clear depth & stencil
    // @see https://github.com/visgl/luma.gl/blob/30a1039573/modules/webgl/src/classes/clear.ts

    const { r, g, b, a } = White;
    if (isWebGL2(gl)) {
      // Force alpha to white.
      if (this.currentMegaState.attachmentsState[0].channelWriteMask !== ChannelWriteMask.Alpha) {
        gl.colorMask(false, false, false, true);
        this.currentMegaState.attachmentsState[0].channelWriteMask = ChannelWriteMask.Alpha;
      }
      gl.clearBufferfv(gl.COLOR, 0, [r, g, b, a]);
    } else {
      gl.colorMask(true, true, true, true);
      gl.clearColor(r, g, b, a);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
  //#endregion

  //#region Device
  // @see https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
  translateTextureInternalFormat(fmt: Format): GLenum {
    switch (fmt) {
      case Format.ALPHA:
        return GL.ALPHA;
      case Format.F16_RGBA:
        return GL.RGBA16F;
      case Format.F32_R:
        return GL.R32F;
      case Format.F32_RG:
        return GL.RG32F;
      case Format.F32_RGB:
        return GL.RGB32F;
      case Format.F32_RGBA:
        return GL.RGBA32F;
      case Format.U16_R:
        return GL.R16UI;
      case Format.U32_R:
        return GL.R32UI;
      case Format.U16_RGBA_5551:
        return GL.RGB5_A1;
      case Format.U8_R_NORM:
        return GL.R8;
      case Format.U8_RG_NORM:
        return GL.RG8;
      case Format.U8_RGB_NORM:
      case Format.U8_RGB_RT:
        return GL.RGB8;
      case Format.U8_RGB_SRGB:
        return GL.SRGB8;
      case Format.U8_RGBA_NORM:
      case Format.U8_RGBA_RT:
        return isWebGL2(this.gl) ? GL.RGBA8 : GL.RGBA;
      case Format.U8_RGBA_SRGB:
      case Format.U8_RGBA_RT_SRGB:
        return GL.SRGB8_ALPHA8;
      case Format.S8_RGBA_NORM:
        return GL.RGBA8_SNORM;
      case Format.S8_RG_NORM:
        return GL.RG8_SNORM;
      case Format.U16_RGBA_5551:
        return GL.UNSIGNED_SHORT_5_5_5_1;
      case Format.BC1:
        return this.WEBGL_compressed_texture_s3tc!.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      case Format.BC1_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb!.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
      case Format.BC2:
        return this.WEBGL_compressed_texture_s3tc!.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      case Format.BC2_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb!.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
      case Format.BC3:
        return this.WEBGL_compressed_texture_s3tc!.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      case Format.BC3_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb!.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      case Format.BC4_UNORM:
        return this.EXT_texture_compression_rgtc!.COMPRESSED_RED_RGTC1_EXT;
      case Format.BC4_SNORM:
        return this.EXT_texture_compression_rgtc!.COMPRESSED_SIGNED_RED_RGTC1_EXT;
      case Format.BC5_UNORM:
        return this.EXT_texture_compression_rgtc!.COMPRESSED_RED_GREEN_RGTC2_EXT;
      case Format.BC5_SNORM:
        return this.EXT_texture_compression_rgtc!.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      case Format.D32F_S8:
        return GL.DEPTH32F_STENCIL8;
      case Format.D24_S8:
        return GL.DEPTH24_STENCIL8;
      case Format.D32F:
        return GL.DEPTH_COMPONENT32F;
      case Format.D24:
        return isWebGL2(this.gl) ? GL.DEPTH_COMPONENT24 : GL.DEPTH_COMPONENT;
      default:
        throw 'whoops';
    }
  }

  translateTextureType(fmt: Format): GLenum {
    const typeFlags: FormatTypeFlags = getFormatTypeFlags(fmt);
    switch (typeFlags) {
      case FormatTypeFlags.U8:
        return GL.UNSIGNED_BYTE;
      case FormatTypeFlags.U16:
        return GL.UNSIGNED_SHORT;
      case FormatTypeFlags.U32:
        return GL.UNSIGNED_INT;
      case FormatTypeFlags.S8:
        return GL.BYTE;
      case FormatTypeFlags.F16:
        return GL.HALF_FLOAT;
      case FormatTypeFlags.F32:
        return GL.FLOAT;
      case FormatTypeFlags.U16_PACKED_5551:
        return GL.UNSIGNED_SHORT_5_5_5_1;
      case FormatTypeFlags.D32F:
        return GL.FLOAT;
      case FormatTypeFlags.D24:
        return isWebGL2(this.gl) ? GL.UNSIGNED_INT_24_8 : GL.UNSIGNED_SHORT;
      case FormatTypeFlags.D24S8:
        return GL.UNSIGNED_INT_24_8;
      case FormatTypeFlags.D32FS8:
        return GL.FLOAT_32_UNSIGNED_INT_24_8_REV;
      default:
        throw 'whoops';
    }
  }

  translateTextureFormat(fmt: Format): GLenum {
    if (isTextureFormatCompressed(fmt)) return this.translateTextureInternalFormat(fmt);

    switch (fmt) {
      case Format.D24_S8:
      case Format.D32F_S8:
        return GL.DEPTH_STENCIL;
      case Format.D24:
      case Format.D32F:
        return GL.DEPTH_COMPONENT;
      default:
        break;
    }

    const isInteger = isFormatSizedInteger(fmt);

    const compFlags: FormatCompFlags = getFormatCompFlags(fmt);
    switch (compFlags) {
      case FormatCompFlags.A:
        return GL.ALPHA;
      case FormatCompFlags.R:
        return isInteger ? GL.RED_INTEGER : GL.RED;
      case FormatCompFlags.RG:
        return isInteger ? GL.RG_INTEGER : GL.RG;
      case FormatCompFlags.RGB:
        return isInteger ? GL.RGB_INTEGER : GL.RGB;
      case FormatCompFlags.RGBA:
        // TODO: Chrome throw error when readPixels RGBA_INTEGER and UNSIGNED_BYTE
        // @see https://github.com/KhronosGroup/WebGL/issues/2747
        // return isInteger ? GL.RGBA_INTEGER : GL.RGBA;
        return GL.RGBA;
    }
  }

  setActiveTexture(texture: GLenum): void {
    if (this.currentActiveTexture !== texture) {
      this.gl.activeTexture(texture);
      this.currentActiveTexture = texture;
    }
  }

  private bindVAO(vao: WebGLVertexArrayObject | null): void {
    if (this.currentBoundVAO !== vao) {
      if (isWebGL2(this.gl)) {
        this.gl.bindVertexArray(vao);
      } else {
        this.OES_vertex_array_object.bindVertexArrayOES(vao);
      }
      this.currentBoundVAO = vao;
    }
  }

  private programCompiled(program: Program_GL): void {
    assert(program.compileState !== ProgramCompileState_GL.NeedsCompile);

    if (program.compileState === ProgramCompileState_GL.Compiling) {
      program.compileState = ProgramCompileState_GL.NeedsBind;

      if (this.shaderDebug) this.checkProgramCompilationForErrors(program);
    }
  }

  private useProgram(program: Program_GL): void {
    if (this.currentProgram === program) return;

    this.programCompiled(program);
    this.gl.useProgram(program.gl_program);
    this.currentProgram = program;
  }

  ensureResourceExists<T>(resource: T | null): T {
    if (resource === null) {
      const error = this.gl.getError();
      throw new Error(`Created resource is null; GL error encountered: ${error}`);
    } else {
      return resource;
    }
  }

  createBuffer(descriptor: BufferDescriptor): Buffer {
    return new Buffer_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createTexture(descriptor: TextureDescriptor): Texture {
    return new Texture_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createSampler(descriptor: SamplerDescriptor): Sampler {
    return new Sampler_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createRenderTarget(descriptor: RenderTargetDescriptor): RenderTarget {
    return new RenderTarget_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createRenderTargetFromTexture(texture: Texture): RenderTarget {
    const { pixelFormat, width, height, numLevels } = texture as Texture_GL;
    // Render targets cannot have a mip chain currently.
    assert(numLevels === 1);

    return this.createRenderTarget({
      pixelFormat,
      width,
      height,
      sampleCount: 1,
      texture,
    }) as RenderTarget_GL;
  }

  createProgram(descriptor: ProgramDescriptorSimple): Program_GL {
    return new Program_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createBindings(descriptor: BindingsDescriptor): Bindings {
    const { bindingLayout, uniformBufferBindings, samplerBindings } = descriptor;
    assert(uniformBufferBindings.length >= bindingLayout.numUniformBuffers);
    assert(samplerBindings.length >= bindingLayout.numSamplers);

    return new Bindings_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createInputLayout(descriptor: InputLayoutDescriptor): InputLayout {
    return new InputLayout_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createInputState(
    _inputLayout: InputLayout,
    vertexBuffers: (VertexBufferDescriptor | null)[],
    indexBufferBinding: IndexBufferDescriptor | null,
  ): InputState {
    const inputLayout = _inputLayout as InputLayout_GL;

    return new InputState_GL({
      id: this.getNextUniqueId(),
      device: this,
      inputLayout,
      vertexBuffers,
      indexBufferBinding,
    });
  }

  createRenderPipeline(descriptor: RenderPipelineDescriptor): RenderPipeline {
    return new RenderPipeline_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createComputePass(computePassDescriptor: ComputePassDescriptor): ComputePass {
    throw new Error('Method not implemented.');
  }

  createComputePipeline(descriptor: ComputePipelineDescriptor): ComputePipeline {
    throw new Error('Method not implemented.');
  }

  // createReadback(byteCount: number): Readback {
  createReadback(): Readback {
    return new Readback_GL({
      id: this.getNextUniqueId(),
      device: this,
      // byteCount,
    });
  }

  createRenderPass(descriptor: RenderPassDescriptor): RenderPass_GL {
    let pass = this.renderPassPool.pop();
    if (pass === undefined) pass = new RenderPass_GL();

    const {
      colorAttachment,
      colorClearColor,
      colorResolveTo,
      depthStencilAttachment,
      depthClearValue,
      stencilClearValue,
      depthStencilResolveTo,
    } = descriptor;

    let depthClearValueF = -1;
    let stencilClearValueF = -1;
    if (depthStencilAttachment !== null) {
      const attachment = depthStencilAttachment as RenderTarget_GL;
      const flags = getFormatFlags(attachment.pixelFormat);
      if (!!(flags & FormatFlags.Depth) && depthClearValue !== 'load')
        depthClearValueF = depthClearValue;
      if (!!(flags & FormatFlags.Stencil) && stencilClearValue !== 'load')
        stencilClearValueF = stencilClearValue;
    }

    pass.descriptor = descriptor;

    pass.setRenderPassParameters(
      colorAttachment,
      colorResolveTo,
      colorClearColor,
      depthStencilAttachment,
      depthStencilResolveTo,
      depthClearValueF,
      stencilClearValueF,
    );
    return pass;
  }

  submitPass(o: RenderPass): void {
    if (o instanceof RenderPass_GL) {
      o.end();
      this.executeRenderPass(o.u32.b, o.f32.b, o.o);
      o.reset();
      this.renderPassPool.push(o);
    }
  }

  private uploadTextureDataInternal(
    texture: Texture,
    firstMipLevel: number,
    levelDatas: ArrayBufferView[],
    levelDatasOffs: number,
    levelDatasSize: number,
  ): void {
    const gl = this.gl;

    const { gl_texture, gl_target, pixelFormat, width, height, depth, numLevels } =
      texture as Texture_GL;
    const isCompressed = isTextureFormatCompressed(pixelFormat);

    // only WebGL2 support 3D & 2D_ARRAY
    // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture#parameters
    const is3D = isWebGL2(gl) && (gl_target === GL.TEXTURE_3D || gl_target === GL.TEXTURE_2D_ARRAY);
    const isCube = isWebGL2(gl)
      ? gl_target === GL.TEXTURE_CUBE_MAP
      : gl_target === GL.TEXTURE_CUBE_MAP;

    this.setActiveTexture(gl.TEXTURE0);
    this.currentTextures[0] = null;
    gl.bindTexture(gl_target, gl_texture);
    let w = width,
      h = height,
      d = depth;
    const maxMipLevel = Math.min(firstMipLevel + levelDatasSize, numLevels);

    const gl_format = this.translateTextureFormat(pixelFormat);

    for (let i = 0; i < maxMipLevel; i++) {
      if (i >= firstMipLevel) {
        const levelData = levelDatas[levelDatasOffs++] as ArrayBufferView;
        const compByteSize = isCompressed ? 1 : getFormatCompByteSize(pixelFormat);
        const sliceElementSize = levelData.byteLength / compByteSize / depth;

        if (is3D && isCompressed && isWebGL2(gl)) {
          // Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1004511
          for (let z = 0; z < depth; z++) {
            gl.compressedTexSubImage3D(
              gl_target,
              i,
              0,
              0,
              z,
              w,
              h,
              1,
              gl_format,
              levelData,
              z * sliceElementSize,
              sliceElementSize,
            );
          }
        } else if (isCube) {
          for (let z = 0; z < depth; z++) {
            const face_target = GL.TEXTURE_CUBE_MAP_POSITIVE_X + (z % 6);
            if (isCompressed) {
              gl.compressedTexSubImage2D(
                face_target,
                i,
                0,
                0,
                w,
                h,
                gl_format,
                levelData,
                z * sliceElementSize,
                sliceElementSize,
              );
            } else {
              const gl_type = this.translateTextureType(pixelFormat);
              gl.texSubImage2D(
                face_target,
                i,
                0,
                0,
                w,
                h,
                gl_format,
                gl_type,
                levelData,
                z * sliceElementSize,
              );
            }
          }
        } else if (is3D && isWebGL2(gl)) {
          if (isCompressed) {
            gl.compressedTexSubImage3D(gl_target, i, 0, 0, 0, w, h, d, gl_format, levelData);
          } else {
            const gl_type = this.translateTextureType(pixelFormat);
            gl.texSubImage3D(gl_target, i, 0, 0, 0, w, h, d, gl_format, gl_type, levelData);
          }
        } else {
          if (isCompressed) {
            gl.compressedTexSubImage2D(gl_target, i, 0, 0, w, h, gl_format, levelData);
          } else {
            const gl_type = this.translateTextureType(pixelFormat);
            gl.texSubImage2D(gl_target, i, 0, 0, w, h, gl_format, gl_type, levelData);
          }
        }
      }

      w = Math.max((w / 2) | 0, 1);
      h = Math.max((h / 2) | 0, 1);
    }
  }

  uploadTextureData(texture: Texture, firstMipLevel: number, levelDatas: ArrayBufferView[]): void {
    this.uploadTextureDataInternal(texture, firstMipLevel, levelDatas, 0, levelDatas.length);
  }

  queryLimits(): DeviceLimits {
    return this;
  }

  queryTextureFormatSupported(format: Format): boolean {
    switch (format) {
      case Format.BC1_SRGB:
      case Format.BC2_SRGB:
      case Format.BC3_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb !== null;
      case Format.BC1:
      case Format.BC2:
      case Format.BC3:
        return this.WEBGL_compressed_texture_s3tc !== null;
      case Format.BC4_UNORM:
      case Format.BC4_SNORM:
      case Format.BC5_UNORM:
      case Format.BC5_SNORM:
        return this.EXT_texture_compression_rgtc !== null;
      default:
        return true;
    }
  }

  private queryProgramReady(program: Program_GL): boolean {
    const gl = this.gl;

    if (program.compileState === ProgramCompileState_GL.NeedsCompile) {
      // This should not happen.
      throw 'whoops';
    }
    if (program.compileState === ProgramCompileState_GL.Compiling) {
      let complete: boolean;

      if (this.KHR_parallel_shader_compile !== null) {
        complete = gl.getProgramParameter(
          program.gl_program,
          this.KHR_parallel_shader_compile!.COMPLETION_STATUS_KHR,
        );
      } else {
        // If we don't have async shader compilation, assume all compilation is done immediately :/
        complete = true;
      }

      if (complete) this.programCompiled(program);

      return complete;
    }

    return (
      program.compileState === ProgramCompileState_GL.NeedsBind ||
      program.compileState === ProgramCompileState_GL.ReadyToUse
    );
  }

  queryPipelineReady(o: RenderPipeline): boolean {
    const pipeline = o as RenderPipeline_GL;
    return this.queryProgramReady(pipeline.program);
  }

  queryPlatformAvailable(): boolean {
    return this.gl.isContextLost();
  }

  queryVendorInfo(): VendorInfo {
    return this;
  }

  queryRenderPass(o: RenderPass): Readonly<RenderPassDescriptor> {
    const pass = o as RenderPass_GL;
    return pass.descriptor;
  }

  queryRenderTarget(o: RenderTarget): Readonly<RenderTargetDescriptor> {
    const renderTarget = o as RenderTarget_GL;
    return renderTarget;
  }
  //#endregion

  //#region Debugging

  setResourceName(o: Resource, name: string): void {
    o.name = name;

    if (o.type === ResourceType.Buffer) {
      const { gl_buffer_pages } = o as Buffer_GL;
      for (let i = 0; i < gl_buffer_pages.length; i++)
        assignPlatformName(gl_buffer_pages[i], `${name} Page ${i}`);
    } else if (o.type === ResourceType.Texture) {
      assignPlatformName(getPlatformTexture(o), name);
    } else if (o.type === ResourceType.Sampler) {
      assignPlatformName(getPlatformSampler(o), name);
    } else if (o.type === ResourceType.RenderTarget) {
      const { gl_renderbuffer } = o as RenderTarget_GL;
      if (gl_renderbuffer !== null) assignPlatformName(gl_renderbuffer, name);
    } else if (o.type === ResourceType.InputState) {
      assignPlatformName((o as InputState_GL).vao, name);
    }
  }

  setResourceLeakCheck(o: Resource, v: boolean): void {
    if (this.resourceCreationTracker !== null)
      this.resourceCreationTracker.setResourceLeakCheck(o, v);
  }

  checkForLeaks(): void {
    if (this.resourceCreationTracker !== null) this.resourceCreationTracker.checkForLeaks();
  }

  pushDebugGroup(debugGroup: DebugGroup): void {
    this.debugGroupStack.push(debugGroup);
  }

  popDebugGroup(): void {
    this.debugGroupStack.pop();
  }

  programPatched(o: Program, descriptor: ProgramDescriptorSimple): void {
    assert(this.shaderDebug);

    // const program = o as Program_GL;
    // const gl = this.gl;
    // gl.deleteProgram(program.gl_program);
    // program.descriptor = descriptor;
    // program.gl_program = this.ensureResourceExists(gl.createProgram());
    // program.compileState = ProgramCompileState_GL.NeedsCompile;
    // this.tryCompileProgram(program);
    // this.checkProgramCompilationForErrors(program);
  }

  getBufferData(buffer: Buffer, dstBuffer: ArrayBufferView, wordOffset: number = 0): void {
    const gl = this.gl;

    if (isWebGL2(gl)) {
      gl.bindBuffer(gl.COPY_READ_BUFFER, getPlatformBuffer(buffer, wordOffset * 4));
      gl.getBufferSubData(gl.COPY_READ_BUFFER, wordOffset * 4, dstBuffer);
    } else {
    }
  }
  //#endregion

  //#region Pass execution
  executeRenderPass(u32: Uint32Array, f32: Float32Array, gfxr: (object | null)[]): void {
    let iu32 = 0,
      if32 = 0,
      igfxr = 0;
    while (true) {
      const cmd = u32[iu32++] as RenderPassCmd;

      if (cmd === RenderPassCmd.setRenderPassParameters) {
        const numColorAttachments = u32[iu32++];
        this.setRenderPassParametersBegin(numColorAttachments);
        for (let i = 0; i < numColorAttachments; i++)
          this.setRenderPassParametersColor(
            i,
            gfxr[igfxr++] as RenderTarget_GL | null,
            gfxr[igfxr++] as Texture_GL | null,
          );
        this.setRenderPassParametersDepthStencil(
          gfxr[igfxr++] as RenderTarget_GL | null,
          gfxr[igfxr++] as Texture_GL | null,
        );
        this.validateCurrentAttachments();
        for (let i = 0; i < numColorAttachments; i++) {
          const shouldClear = !!u32[iu32++];
          if (!shouldClear) continue;
          this.setRenderPassParametersClearColor(
            i,
            f32[if32++],
            f32[if32++],
            f32[if32++],
            f32[if32++],
          );
        }
        this.setRenderPassParametersClearDepthStencil(f32[if32++], f32[if32++]);
      } else if (cmd === RenderPassCmd.setViewport) {
        this.setViewport(f32[if32++], f32[if32++], f32[if32++], f32[if32++]);
      } else if (cmd === RenderPassCmd.setScissor) {
        this.setScissor(f32[if32++], f32[if32++], f32[if32++], f32[if32++]);
      } else if (cmd === RenderPassCmd.setBindings) {
        const index = u32[iu32++],
          numOffsets = u32[iu32++];
        this.setBindings(index, gfxr[igfxr++] as Bindings, numOffsets, u32, iu32);
        iu32 += numOffsets;
      } else if (cmd === RenderPassCmd.setPipeline) {
        this.setPipeline(gfxr[igfxr++] as RenderPipeline);
      } else if (cmd === RenderPassCmd.setInputState) {
        this.setInputState(gfxr[igfxr++] as InputState | null);
      } else if (cmd === RenderPassCmd.setStencilRef) {
        this.setStencilRef(f32[if32++]);
      } else if (cmd === RenderPassCmd.setDebugPointer) {
        this.setDebugPointer(gfxr[igfxr++]);
      } else if (cmd === RenderPassCmd.draw) {
        this.draw(u32[iu32++], u32[iu32++]);
      } else if (cmd === RenderPassCmd.drawIndexed) {
        this.drawIndexed(u32[iu32++], u32[iu32++]);
      } else if (cmd === RenderPassCmd.drawIndexedInstanced) {
        this.drawIndexedInstanced(u32[iu32++], u32[iu32++], u32[iu32++]);
      } else if (cmd === RenderPassCmd.end) {
        this.endPass();
        return;
      } else {
        const m: RenderPassCmd.invalid = cmd;
        throw new Error('Invalid execution');
      }
    }
  }

  private debugGroupStatisticsDrawCall(count: number = 1): void {
    for (let i = this.debugGroupStack.length - 1; i >= 0; i--)
      this.debugGroupStack[i].drawCallCount += count;
  }

  debugGroupStatisticsBufferUpload(count: number = 1): void {
    for (let i = this.debugGroupStack.length - 1; i >= 0; i--)
      this.debugGroupStack[i].bufferUploadCount += count;
  }

  private debugGroupStatisticsTextureBind(count: number = 1): void {
    for (let i = this.debugGroupStack.length - 1; i >= 0; i--)
      this.debugGroupStack[i].textureBindCount += count;
  }

  private debugGroupStatisticsTriangles(count: number): void {
    for (let i = this.debugGroupStack.length - 1; i >= 0; i--)
      this.debugGroupStack[i].triangleCount += count;
  }

  private reportShaderError(shader: WebGLShader, str: string): boolean {
    const gl = this.gl;
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      console.error(prependLineNo(str));
      const debug_shaders = gl.getExtension('WEBGL_debug_shaders');
      if (debug_shaders) console.error(debug_shaders.getTranslatedShaderSource(shader));
      console.error(gl.getShaderInfoLog(shader));
    }
    return status;
  }

  private checkProgramCompilationForErrors(program: Program_GL): void {
    const gl = this.gl;

    const prog = program.gl_program!;
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const descriptor = program.descriptor;

      if (!this.reportShaderError(program.gl_shader_vert!, descriptor.preprocessedVert)) return;

      if (!this.reportShaderError(program.gl_shader_frag!, descriptor.preprocessedFrag)) return;

      // Neither shader had an error, report the program info log.
      console.error(gl.getProgramInfoLog(program.gl_program!));
    }
  }

  private bindFramebufferAttachment(
    framebuffer: GLenum,
    binding: GLenum,
    attachment: RenderTarget_GL | Texture_GL | null,
  ): void {
    const gl = this.gl;

    if (attachment === null) {
      gl.framebufferRenderbuffer(framebuffer, binding, gl.RENDERBUFFER, null);
    } else if (attachment.type === ResourceType.RenderTarget) {
      if (attachment.gl_renderbuffer !== null) {
        gl.framebufferRenderbuffer(
          framebuffer,
          binding,
          gl.RENDERBUFFER,
          attachment.gl_renderbuffer,
        );
      } else if (attachment.texture !== null) {
        const texture = attachment.texture as Texture_GL;
        gl.framebufferTexture2D(framebuffer, binding, GL.TEXTURE_2D, texture.gl_texture, 0);
      }
    } else if (attachment.type === ResourceType.Texture) {
      // TODO: use Tex2D array with gl.framebufferTextureLayer
      gl.framebufferTexture2D(
        framebuffer,
        binding,
        GL.TEXTURE_2D,
        getPlatformTexture(attachment),
        0,
      );
    }
  }

  private bindFramebufferDepthStencilAttachment(
    framebuffer: GLenum,
    attachment: RenderTarget_GL | Texture_GL | null,
  ): void {
    const gl = this.gl;

    const flags =
      attachment !== null
        ? getFormatFlags(attachment.pixelFormat)
        : FormatFlags.Depth | FormatFlags.Stencil;
    const depth = !!(flags & FormatFlags.Depth),
      stencil = !!(flags & FormatFlags.Stencil);
    if (depth && stencil) {
      this.bindFramebufferAttachment(framebuffer, gl.DEPTH_STENCIL_ATTACHMENT, attachment);
    } else if (depth) {
      this.bindFramebufferAttachment(framebuffer, gl.DEPTH_ATTACHMENT, attachment);
      this.bindFramebufferAttachment(framebuffer, gl.STENCIL_ATTACHMENT, null);
    } else if (stencil) {
      this.bindFramebufferAttachment(framebuffer, gl.STENCIL_ATTACHMENT, attachment);
      this.bindFramebufferAttachment(framebuffer, gl.DEPTH_ATTACHMENT, null);
    }
  }

  private validateCurrentAttachments(): void {
    let sampleCount = -1,
      width = -1,
      height = -1;

    for (let i = 0; i < this.currentColorAttachments.length; i++) {
      const attachment = this.currentColorAttachments[i];

      if (attachment === null) continue;

      if (sampleCount === -1) {
        sampleCount = attachment.sampleCount;
        width = attachment.width;
        height = attachment.height;
      } else {
        assert(sampleCount === attachment.sampleCount);
        assert(width === attachment.width);
        assert(height === attachment.height);
      }
    }

    if (this.currentDepthStencilAttachment !== null) {
      if (sampleCount === -1) {
        sampleCount = this.currentDepthStencilAttachment.sampleCount;
        width = this.currentDepthStencilAttachment.width;
        height = this.currentDepthStencilAttachment.height;
      } else {
        assert(sampleCount === this.currentDepthStencilAttachment.sampleCount);
        assert(width === this.currentDepthStencilAttachment.width);
        assert(height === this.currentDepthStencilAttachment.height);
      }
    }

    this.currentSampleCount = sampleCount;
  }

  private setRenderPassParametersBegin(numColorAttachments: number): void {
    const gl = this.gl;

    if (isWebGL2(gl)) {
      gl.bindFramebuffer(GL.DRAW_FRAMEBUFFER, this.renderPassDrawFramebuffer);
    } else {
      gl.bindFramebuffer(GL.FRAMEBUFFER, this.renderPassDrawFramebuffer);
    }
    for (let i = numColorAttachments; i < this.currentColorAttachments.length; i++) {
      const target = isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER;
      const attachment = isWebGL2(gl) ? GL.COLOR_ATTACHMENT0 : GL.COLOR_ATTACHMENT0_WEBGL;

      gl.framebufferRenderbuffer(target, attachment + i, GL.RENDERBUFFER, null);
      gl.framebufferTexture2D(target, attachment + i, GL.TEXTURE_2D, null, 0);
    }
    this.currentColorAttachments.length = numColorAttachments;

    if (isWebGL2(gl)) {
      gl.drawBuffers([
        GL.COLOR_ATTACHMENT0,
        GL.COLOR_ATTACHMENT1,
        GL.COLOR_ATTACHMENT2,
        GL.COLOR_ATTACHMENT3,
      ]);
    } else {
      // MRT @see https://github.com/shrekshao/MoveWebGL1EngineToWebGL2/blob/master/Move-a-WebGL-1-Engine-To-WebGL-2-Blog-1.md#multiple-render-targets
      this.WEBGL_draw_buffers.drawBuffersWEBGL([
        GL.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
        GL.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
        GL.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
        GL.COLOR_ATTACHMENT3_WEBGL, // gl_FragData[3]
      ]);
    }
  }

  private setRenderPassParametersColor(
    i: number,
    colorAttachment: RenderTarget_GL | null,
    colorResolveTo: Texture_GL | null,
  ): void {
    const gl = this.gl;

    if (this.currentColorAttachments[i] !== colorAttachment) {
      this.currentColorAttachments[i] = colorAttachment;
      this.bindFramebufferAttachment(
        isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
        (isWebGL2(gl) ? GL.COLOR_ATTACHMENT0 : GL.COLOR_ATTACHMENT0_WEBGL) + i,
        colorAttachment,
      );
      this.resolveColorAttachmentsChanged = true;
    }

    if (this.currentColorResolveTos[i] !== colorResolveTo) {
      this.currentColorResolveTos[i] = colorResolveTo;

      if (colorResolveTo !== null) this.resolveColorAttachmentsChanged = true;
    }
  }

  private setRenderPassParametersDepthStencil(
    depthStencilAttachment: RenderTarget | null,
    depthStencilResolveTo: Texture | null,
  ): void {
    const gl = this.gl;

    if (this.currentDepthStencilAttachment !== depthStencilAttachment) {
      this.currentDepthStencilAttachment = depthStencilAttachment as RenderTarget_GL | null;
      this.bindFramebufferDepthStencilAttachment(
        isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
        this.currentDepthStencilAttachment,
      );
      this.resolveDepthStencilAttachmentsChanged = true;
    }

    if (this.currentDepthStencilResolveTo !== depthStencilResolveTo) {
      this.currentDepthStencilResolveTo = depthStencilResolveTo as Texture_GL;

      if (depthStencilResolveTo !== null) this.resolveDepthStencilAttachmentsChanged = true;
    }
  }

  private setRenderPassParametersClearColor(
    slot: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    const gl = this.gl;

    if (this.OES_draw_buffers_indexed !== null) {
      const attachment = this.currentMegaState.attachmentsState[slot];
      if (attachment.channelWriteMask !== ChannelWriteMask.AllChannels) {
        this.OES_draw_buffers_indexed.colorMaskiOES(slot, true, true, true, true);
        attachment.channelWriteMask = ChannelWriteMask.AllChannels;
      }
    } else {
      const attachment = this.currentMegaState.attachmentsState[0];
      if (attachment.channelWriteMask !== ChannelWriteMask.AllChannels) {
        gl.colorMask(true, true, true, true);
        attachment.channelWriteMask = ChannelWriteMask.AllChannels;
      }
    }

    gl.disable(gl.SCISSOR_TEST);

    if (isWebGL2(gl)) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clearBuffer
      gl.clearBufferfv(gl.COLOR, slot, [r, g, b, a]);
    } else {
      gl.clearColor(r, g, b, a);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  private setRenderPassParametersClearDepthStencil(
    depthClearValue: number,
    stencilClearValue: number,
  ): void {
    const gl = this.gl;

    if (depthClearValue > -1) {
      assert(this.currentDepthStencilAttachment !== null);
      // GL clears obey the masks... bad API or worst API?
      if (!this.currentMegaState.depthWrite) {
        gl.depthMask(true);
        this.currentMegaState.depthWrite = true;
      }
      if (isWebGL2(gl)) {
        gl.clearBufferfv(gl.DEPTH, 0, [depthClearValue]);
      } else {
        gl.clearDepth(depthClearValue);
        gl.clear(gl.DEPTH_BUFFER_BIT);
      }
    }
    if (stencilClearValue > -1) {
      assert(this.currentDepthStencilAttachment !== null);
      if (!this.currentMegaState.stencilWrite) {
        gl.stencilMask(0xff);
        this.currentMegaState.stencilWrite = true;
      }
      if (isWebGL2(gl)) {
        gl.clearBufferiv(gl.STENCIL, 0, [stencilClearValue]);
      } else {
        gl.clearStencil(stencilClearValue);
        gl.clear(gl.STENCIL_BUFFER_BIT);
      }
    }
  }

  private setBindings(
    bindingLayoutIndex: number,
    bindings_: Bindings,
    dynamicByteOffsetsCount: number,
    dynamicByteOffsets: Uint32Array,
    dynamicByteOffsetsStart: number,
  ): void {
    const gl = this.gl;

    assert(bindingLayoutIndex < this.currentPipeline.bindingLayouts.bindingLayoutTables.length);
    const bindingLayoutTable =
      this.currentPipeline.bindingLayouts.bindingLayoutTables[bindingLayoutIndex];

    const { uniformBufferBindings, samplerBindings } = bindings_ as Bindings_GL;
    // Ignore extra bindings.
    assert(uniformBufferBindings.length >= bindingLayoutTable.numUniformBuffers);
    assert(samplerBindings.length >= bindingLayoutTable.numSamplers);
    assert(dynamicByteOffsetsCount >= uniformBufferBindings.length);

    for (let i = 0; i < uniformBufferBindings.length; i++) {
      const binding = uniformBufferBindings[i];
      if (binding.wordCount === 0) continue;
      const index = bindingLayoutTable.firstUniformBuffer + i;
      const buffer = binding.buffer as Buffer_GL;
      const byteOffset = dynamicByteOffsets[dynamicByteOffsetsStart + i];
      const byteSize = binding.wordCount * 4;
      if (
        buffer !== this.currentUniformBuffers[index] ||
        byteOffset !== this.currentUniformBufferByteOffsets[index] ||
        byteSize !== this.currentUniformBufferByteSizes[index]
      ) {
        const platformBufferByteOffset = byteOffset % buffer.pageByteSize;
        const platformBuffer = buffer.gl_buffer_pages[(byteOffset / buffer.pageByteSize) | 0];
        assert(platformBufferByteOffset + byteSize <= buffer.pageByteSize);

        if (isWebGL2(gl)) {
          gl.bindBufferRange(
            gl.UNIFORM_BUFFER,
            index,
            platformBuffer,
            platformBufferByteOffset,
            byteSize,
          );
        } else {
          // TODO: WebGL1 uniform
        }
        this.currentUniformBuffers[index] = buffer;
        this.currentUniformBufferByteOffsets[index] = byteOffset;
        this.currentUniformBufferByteSizes[index] = byteSize;
      }
    }

    for (let i = 0; i < samplerBindings.length; i++) {
      const binding = samplerBindings[i];
      const samplerIndex = bindingLayoutTable.firstSampler + i;
      const gl_sampler =
        binding !== null && binding.sampler !== null ? getPlatformSampler(binding.sampler) : null;
      const gl_texture =
        binding !== null && binding.texture !== null ? getPlatformTexture(binding.texture) : null;

      if (this.currentSamplers[samplerIndex] !== gl_sampler) {
        if (isWebGL2(gl)) {
          gl.bindSampler(samplerIndex, gl_sampler);
        }
        this.currentSamplers[samplerIndex] = gl_sampler;
      }

      if (this.currentTextures[samplerIndex] !== gl_texture) {
        this.setActiveTexture(gl.TEXTURE0 + samplerIndex);
        if (gl_texture !== null) {
          const { gl_target } = assertExists(binding).texture as Texture_GL;
          gl.bindTexture(gl_target, gl_texture);

          // In WebGL1 set tex's parameters @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
          if (!isWebGL2(gl)) {
            (binding.sampler as Sampler_GL)?.setTextureParameters(gl_target, gl_texture);
          }

          this.debugGroupStatisticsTextureBind();
        } else {
          gl.bindTexture(GL.TEXTURE_2D, this.blackTexture);
        }
        this.currentTextures[samplerIndex] = gl_texture;
      }
    }
  }

  private setViewport(x: number, y: number, w: number, h: number): void {
    const gl = this.gl;
    gl.viewport(x, y, w, h);
  }

  private setScissor(x: number, y: number, w: number, h: number): void {
    const gl = this.gl;
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, w, h);
  }

  private applyAttachmentStateIndexed(
    i: number,
    currentAttachmentState: AttachmentState,
    newAttachmentState: AttachmentState,
  ): void {
    const gl = this.gl;
    const dbi = this.OES_draw_buffers_indexed!;

    if (currentAttachmentState.channelWriteMask !== newAttachmentState.channelWriteMask) {
      dbi.colorMaskiOES(
        i,
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Red),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Green),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Blue),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Alpha),
      );
      currentAttachmentState.channelWriteMask = newAttachmentState.channelWriteMask;
    }

    const blendModeChanged =
      currentAttachmentState.rgbBlendState.blendMode !==
        newAttachmentState.rgbBlendState.blendMode ||
      currentAttachmentState.alphaBlendState.blendMode !==
        newAttachmentState.alphaBlendState.blendMode;
    const blendFuncChanged =
      currentAttachmentState.rgbBlendState.blendSrcFactor !==
        newAttachmentState.rgbBlendState.blendSrcFactor ||
      currentAttachmentState.alphaBlendState.blendSrcFactor !==
        newAttachmentState.alphaBlendState.blendSrcFactor ||
      currentAttachmentState.rgbBlendState.blendDstFactor !==
        newAttachmentState.rgbBlendState.blendDstFactor ||
      currentAttachmentState.alphaBlendState.blendDstFactor !==
        newAttachmentState.alphaBlendState.blendDstFactor;

    if (blendFuncChanged || blendModeChanged) {
      if (
        isBlendStateNone(currentAttachmentState.rgbBlendState) &&
        isBlendStateNone(currentAttachmentState.alphaBlendState)
      )
        dbi.enableiOES(i, gl.BLEND);
      else if (
        isBlendStateNone(newAttachmentState.rgbBlendState) &&
        isBlendStateNone(newAttachmentState.alphaBlendState)
      )
        dbi.disableiOES(i, gl.BLEND);
    }

    if (blendModeChanged) {
      dbi.blendEquationSeparateiOES(
        i,
        newAttachmentState.rgbBlendState.blendMode,
        newAttachmentState.alphaBlendState.blendMode,
      );
      currentAttachmentState.rgbBlendState.blendMode = newAttachmentState.rgbBlendState.blendMode;
      currentAttachmentState.alphaBlendState.blendMode =
        newAttachmentState.alphaBlendState.blendMode;
    }

    if (blendFuncChanged) {
      dbi.blendFuncSeparateiOES(
        i,
        newAttachmentState.rgbBlendState.blendSrcFactor,
        newAttachmentState.rgbBlendState.blendDstFactor,
        newAttachmentState.alphaBlendState.blendSrcFactor,
        newAttachmentState.alphaBlendState.blendDstFactor,
      );
      currentAttachmentState.rgbBlendState.blendSrcFactor =
        newAttachmentState.rgbBlendState.blendSrcFactor;
      currentAttachmentState.alphaBlendState.blendSrcFactor =
        newAttachmentState.alphaBlendState.blendSrcFactor;
      currentAttachmentState.rgbBlendState.blendDstFactor =
        newAttachmentState.rgbBlendState.blendDstFactor;
      currentAttachmentState.alphaBlendState.blendDstFactor =
        newAttachmentState.alphaBlendState.blendDstFactor;
    }
  }

  private applyAttachmentState(
    currentAttachmentState: AttachmentState,
    newAttachmentState: AttachmentState,
  ): void {
    const gl = this.gl;

    if (currentAttachmentState.channelWriteMask !== newAttachmentState.channelWriteMask) {
      gl.colorMask(
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Red),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Green),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Blue),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.Alpha),
      );
      currentAttachmentState.channelWriteMask = newAttachmentState.channelWriteMask;
    }

    const blendModeChanged =
      currentAttachmentState.rgbBlendState.blendMode !==
        newAttachmentState.rgbBlendState.blendMode ||
      currentAttachmentState.alphaBlendState.blendMode !==
        newAttachmentState.alphaBlendState.blendMode;
    const blendFuncChanged =
      currentAttachmentState.rgbBlendState.blendSrcFactor !==
        newAttachmentState.rgbBlendState.blendSrcFactor ||
      currentAttachmentState.alphaBlendState.blendSrcFactor !==
        newAttachmentState.alphaBlendState.blendSrcFactor ||
      currentAttachmentState.rgbBlendState.blendDstFactor !==
        newAttachmentState.rgbBlendState.blendDstFactor ||
      currentAttachmentState.alphaBlendState.blendDstFactor !==
        newAttachmentState.alphaBlendState.blendDstFactor;

    if (blendFuncChanged || blendModeChanged) {
      if (
        isBlendStateNone(currentAttachmentState.rgbBlendState) &&
        isBlendStateNone(currentAttachmentState.alphaBlendState)
      )
        gl.enable(gl.BLEND);
      else if (
        isBlendStateNone(newAttachmentState.rgbBlendState) &&
        isBlendStateNone(newAttachmentState.alphaBlendState)
      )
        gl.disable(gl.BLEND);
    }

    if (blendModeChanged) {
      gl.blendEquationSeparate(
        newAttachmentState.rgbBlendState.blendMode,
        newAttachmentState.alphaBlendState.blendMode,
      );
      currentAttachmentState.rgbBlendState.blendMode = newAttachmentState.rgbBlendState.blendMode;
      currentAttachmentState.alphaBlendState.blendMode =
        newAttachmentState.alphaBlendState.blendMode;
    }

    if (blendFuncChanged) {
      gl.blendFuncSeparate(
        newAttachmentState.rgbBlendState.blendSrcFactor,
        newAttachmentState.rgbBlendState.blendDstFactor,
        newAttachmentState.alphaBlendState.blendSrcFactor,
        newAttachmentState.alphaBlendState.blendDstFactor,
      );
      currentAttachmentState.rgbBlendState.blendSrcFactor =
        newAttachmentState.rgbBlendState.blendSrcFactor;
      currentAttachmentState.alphaBlendState.blendSrcFactor =
        newAttachmentState.alphaBlendState.blendSrcFactor;
      currentAttachmentState.rgbBlendState.blendDstFactor =
        newAttachmentState.rgbBlendState.blendDstFactor;
      currentAttachmentState.alphaBlendState.blendDstFactor =
        newAttachmentState.alphaBlendState.blendDstFactor;
    }
  }

  private setMegaState(newMegaState: MegaStateDescriptor): void {
    const gl = this.gl;
    const currentMegaState = this.currentMegaState;

    if (this.OES_draw_buffers_indexed !== null) {
      for (let i = 0; i < newMegaState.attachmentsState.length; i++)
        this.applyAttachmentStateIndexed(
          i,
          currentMegaState.attachmentsState[0],
          newMegaState.attachmentsState[0],
        );
    } else {
      assert(newMegaState.attachmentsState.length === 1);
      this.applyAttachmentState(
        currentMegaState.attachmentsState[0],
        newMegaState.attachmentsState[0],
      );
    }

    if (!colorEqual(currentMegaState.blendConstant, newMegaState.blendConstant)) {
      gl.blendColor(
        newMegaState.blendConstant.r,
        newMegaState.blendConstant.g,
        newMegaState.blendConstant.b,
        newMegaState.blendConstant.a,
      );
      colorCopy(currentMegaState.blendConstant, newMegaState.blendConstant);
    }

    if (currentMegaState.depthCompare !== newMegaState.depthCompare) {
      gl.depthFunc(newMegaState.depthCompare);
      currentMegaState.depthCompare = newMegaState.depthCompare;
    }

    if (currentMegaState.depthWrite !== newMegaState.depthWrite) {
      gl.depthMask(newMegaState.depthWrite);
      currentMegaState.depthWrite = newMegaState.depthWrite;
    }

    if (currentMegaState.stencilCompare !== newMegaState.stencilCompare) {
      const stencilRef = gl.getParameter(gl.STENCIL_REF);
      gl.stencilFunc(newMegaState.stencilCompare, stencilRef, 0xff);
      currentMegaState.stencilCompare = newMegaState.stencilCompare;
    }

    if (currentMegaState.stencilWrite !== newMegaState.stencilWrite) {
      gl.stencilMask(newMegaState.stencilWrite ? 0xff : 0x00);
      currentMegaState.stencilWrite = newMegaState.stencilWrite;
    }

    if (currentMegaState.stencilWrite) {
      if (currentMegaState.stencilPassOp !== newMegaState.stencilPassOp) {
        gl.stencilOp(gl.KEEP, gl.KEEP, newMegaState.stencilPassOp);
        currentMegaState.stencilPassOp = newMegaState.stencilPassOp;
      }
    }

    if (currentMegaState.cullMode !== newMegaState.cullMode) {
      if (currentMegaState.cullMode === CullMode.None) gl.enable(gl.CULL_FACE);
      else if (newMegaState.cullMode === CullMode.None) gl.disable(gl.CULL_FACE);

      if (newMegaState.cullMode === CullMode.Back) gl.cullFace(gl.BACK);
      else if (newMegaState.cullMode === CullMode.Front) gl.cullFace(gl.FRONT);
      else if (newMegaState.cullMode === CullMode.FrontAndBack) gl.cullFace(gl.FRONT_AND_BACK);
      currentMegaState.cullMode = newMegaState.cullMode;
    }

    if (currentMegaState.frontFace !== newMegaState.frontFace) {
      gl.frontFace(newMegaState.frontFace);
      currentMegaState.frontFace = newMegaState.frontFace;
    }

    if (currentMegaState.polygonOffset !== newMegaState.polygonOffset) {
      if (newMegaState.polygonOffset) {
        gl.polygonOffset(1, 1);
        gl.enable(gl.POLYGON_OFFSET_FILL);
      } else {
        gl.disable(gl.POLYGON_OFFSET_FILL);
      }
      currentMegaState.polygonOffset = newMegaState.polygonOffset;
    }
  }

  private validatePipelineFormats(pipeline: RenderPipeline_GL): void {
    for (let i = 0; i < this.currentColorAttachments.length; i++) {
      const attachment = this.currentColorAttachments[i];
      if (attachment === null) continue;
      assert(attachment.pixelFormat === pipeline.colorAttachmentFormats[i]);
    }

    if (this.currentDepthStencilAttachment !== null)
      assert(
        this.currentDepthStencilAttachment.pixelFormat === pipeline.depthStencilAttachmentFormat,
      );

    if (this.currentSampleCount !== -1) assert(this.currentSampleCount === pipeline.sampleCount);
  }

  private setPipeline(o: RenderPipeline): void {
    this.currentPipeline = o as RenderPipeline_GL;
    this.validatePipelineFormats(this.currentPipeline);

    // We allow users to use "non-ready" pipelines for emergencies. In this case, there can be a bit of stuttering.
    // assert(this.queryPipelineReady(this.currentPipeline));

    this.setMegaState(this.currentPipeline.megaState);

    const program = this.currentPipeline.program;
    this.useProgram(program);

    if (program.compileState === ProgramCompileState_GL.NeedsBind) {
      const gl = this.gl,
        prog = program.gl_program!;
      const deviceProgram = program.descriptor;

      const uniformBlocks = findall(deviceProgram.preprocessedVert, /uniform (\w+) {([^]*?)}/g);

      if (isWebGL2(gl)) {
        for (let i = 0; i < uniformBlocks.length; i++) {
          const [m, blockName, contents] = uniformBlocks[i];
          // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/getUniformBlockIndex
          const blockIdx = gl.getUniformBlockIndex(prog, blockName);
          if (blockIdx !== -1 && blockIdx !== 0xffffffff) {
            // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/uniformBlockBinding
            gl.uniformBlockBinding(prog, blockIdx, i);
          }
        }
      } else {
      }
      // TODO: uniform1iv in WebGL1

      const samplers = findall(
        deviceProgram.preprocessedVert,
        /^uniform .*sampler\S+ (\w+)(?:\[(\d+)\])?;$/gm,
      );
      let samplerIndex = 0;
      for (let i = 0; i < samplers.length; i++) {
        const [m, name, arraySizeStr] = samplers[i];
        const arraySize = arraySizeStr ? parseInt(arraySizeStr) : 1;
        // Assign identities in order.
        const samplerUniformLocation = gl.getUniformLocation(prog, name);
        gl.uniform1iv(samplerUniformLocation, range(samplerIndex, arraySize));
        samplerIndex += arraySize;
      }

      program.compileState = ProgramCompileState_GL.ReadyToUse;
    }
  }

  private setInputState(inputState_: InputState | null): void {
    const inputState = inputState_ as InputState_GL;
    this.currentInputState = inputState;
    if (this.currentInputState !== null) {
      assert(this.currentPipeline.inputLayout === this.currentInputState.inputLayout);
      this.bindVAO(this.currentInputState.vao);
    } else {
      assert(this.currentPipeline.inputLayout === null);
      this.bindVAO(null);
    }
  }

  private setStencilRef(value: number): void {
    const gl = this.gl;
    gl.stencilFunc(this.currentMegaState.stencilCompare, value, 0xff);
  }

  private debugPointer: any;
  private setDebugPointer(value: any): void {
    this.debugPointer = value;
  }

  private draw(count: number, firstVertex: number): void {
    const gl = this.gl;
    const pipeline = this.currentPipeline;
    gl.drawArrays(pipeline.drawMode, firstVertex, count);
    this.debugGroupStatisticsDrawCall();
    this.debugGroupStatisticsTriangles(count / 3);
  }

  private drawIndexed(count: number, firstIndex: number): void {
    const gl = this.gl;
    const pipeline = this.currentPipeline;
    const inputState = this.currentInputState;
    const byteOffset =
      assertExists(inputState.indexBufferByteOffset) +
      firstIndex * assertExists(inputState.indexBufferCompByteSize);
    gl.drawElements(pipeline.drawMode, count, assertExists(inputState.indexBufferType), byteOffset);
    this.debugGroupStatisticsDrawCall();
    this.debugGroupStatisticsTriangles(count / 3);
  }

  private drawIndexedInstanced(count: number, firstIndex: number, instanceCount: number): void {
    const gl = this.gl;
    const pipeline = this.currentPipeline;
    const inputState = this.currentInputState;
    const byteOffset =
      assertExists(inputState.indexBufferByteOffset) +
      firstIndex * assertExists(inputState.indexBufferCompByteSize);

    const params: [number, number, number, number, number] = [
      pipeline.drawMode,
      count,
      assertExists(inputState.indexBufferType),
      byteOffset,
      instanceCount,
    ];
    if (isWebGL2(gl)) {
      gl.drawElementsInstanced(...params);
    } else {
      this.ANGLE_instanced_arrays.drawElementsInstancedANGLE(...params);
    }

    this.debugGroupStatisticsDrawCall();
    this.debugGroupStatisticsTriangles((count / 3) * instanceCount);
  }

  private endPass(): void {
    const gl = this.gl;

    let didUnbind = false;

    for (let i = 0; i < this.currentColorAttachments.length; i++) {
      const colorResolveTo = this.currentColorResolveTos[i];

      if (colorResolveTo !== null) {
        const colorResolveFrom = assertExists(this.currentColorAttachments[i]);
        assert(
          colorResolveFrom.width === colorResolveTo.width &&
            colorResolveFrom.height === colorResolveTo.height,
        );
        assert(colorResolveFrom.pixelFormat === colorResolveTo.pixelFormat);

        gl.disable(GL.SCISSOR_TEST);

        if (isWebGL2(gl)) {
          // set read frame buffer
          gl.bindFramebuffer(GL.READ_FRAMEBUFFER, this.resolveColorReadFramebuffer);
        }

        // Special case: Blitting to the on-screen.
        if (colorResolveTo === this.scTexture) {
          gl.bindFramebuffer(
            isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
            this.scPlatformFramebuffer,
          );

          if (this.resolveColorAttachmentsChanged) {
            if (isWebGL2(gl)) {
              this.bindFramebufferAttachment(
                GL.READ_FRAMEBUFFER,
                GL.COLOR_ATTACHMENT0,
                colorResolveFrom,
              );
            }
          }

          if (isWebGL2(gl)) {
            // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/blitFramebuffer
            gl.blitFramebuffer(
              0,
              0,
              colorResolveFrom.width,
              colorResolveFrom.height,
              0,
              0,
              colorResolveTo.width,
              colorResolveTo.height,
              GL.COLOR_BUFFER_BIT,
              GL.LINEAR,
            );
          } else {
            // render target texture
            gl.bindTexture(GL.TEXTURE_2D, (colorResolveFrom.texture as Texture_GL).gl_texture);
          }
          didUnbind = true;
        } else {
          gl.bindFramebuffer(
            isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
            this.resolveColorDrawFramebuffer,
          );

          if (this.resolveColorAttachmentsChanged) {
            this.bindFramebufferAttachment(
              isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
              isWebGL2(gl) ? GL.COLOR_ATTACHMENT0 : GL.COLOR_ATTACHMENT0_WEBGL,
              colorResolveFrom,
            );

            gl.framebufferTexture2D(
              isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
              isWebGL2(gl) ? GL.COLOR_ATTACHMENT0 : GL.COLOR_ATTACHMENT0_WEBGL,
              GL.TEXTURE_2D,
              colorResolveTo.gl_texture,
              0,
            );
          }

          if (isWebGL2(gl)) {
            gl.blitFramebuffer(
              0,
              0,
              colorResolveFrom.width,
              colorResolveFrom.height,
              0,
              0,
              colorResolveTo.width,
              colorResolveTo.height,
              gl.COLOR_BUFFER_BIT,
              gl.LINEAR,
            );
          }

          gl.bindFramebuffer(isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER, null);
          didUnbind = true;
        }

        if (isWebGL2(gl)) {
          gl.bindFramebuffer(GL.READ_FRAMEBUFFER, null);
        }
      }
    }

    this.resolveColorAttachmentsChanged = false;

    const depthStencilResolveFrom = this.currentDepthStencilAttachment;
    const depthStencilResolveTo = this.currentDepthStencilResolveTo;

    if (depthStencilResolveFrom !== null && depthStencilResolveTo !== null) {
      assert(
        depthStencilResolveFrom.width === depthStencilResolveTo.width &&
          depthStencilResolveFrom.height === depthStencilResolveTo.height,
      );

      gl.disable(gl.SCISSOR_TEST);
      gl.bindFramebuffer(
        isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
        this.resolveDepthStencilReadFramebuffer,
      );
      gl.bindFramebuffer(
        isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
        this.resolveDepthStencilDrawFramebuffer,
      );

      if (this.resolveDepthStencilAttachmentsChanged) {
        this.bindFramebufferDepthStencilAttachment(
          isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
          depthStencilResolveFrom,
        );
        this.bindFramebufferDepthStencilAttachment(
          isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
          depthStencilResolveTo,
        );
      }

      if (isWebGL2(gl)) {
        gl.blitFramebuffer(
          0,
          0,
          depthStencilResolveFrom.width,
          depthStencilResolveFrom.height,
          0,
          0,
          depthStencilResolveTo.width,
          depthStencilResolveTo.height,
          gl.DEPTH_BUFFER_BIT,
          gl.NEAREST,
        );
      }

      gl.bindFramebuffer(isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER, null);
      gl.bindFramebuffer(isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER, null);
      didUnbind = true;
    }

    this.resolveDepthStencilAttachmentsChanged = false;

    if (!didUnbind) {
      // If we did not unbind from a resolve, then we need to unbind our render pass draw FBO here.
      gl.bindFramebuffer(isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER, null);
    }
  }
  //#endregion
}
