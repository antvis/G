import {
  AttachmentState,
  BindingLayoutDescriptor,
  Bindings,
  BindingsDescriptor,
  Buffer,
  BufferDescriptor,
  BufferFrequencyHint,
  ComputePass,
  ComputePipeline,
  ComputePipelineDescriptor,
  DebugGroup,
  Device,
  DeviceLimits,
  IndexBufferDescriptor,
  InputLayout,
  InputLayoutDescriptor,
  MegaStateDescriptor,
  PlatformFramebuffer,
  Program,
  ProgramDescriptor,
  QueryPool,
  QueryPoolType,
  Readback,
  RenderPass,
  RenderPassDescriptor,
  RenderPipeline,
  RenderPipelineDescriptor,
  RenderTarget,
  RenderTargetDescriptor,
  Resource,
  Sampler,
  SamplerDescriptor,
  SwapChain,
  Texture,
  TextureDescriptor,
  TransparentWhite,
  VendorInfo,
  VertexBufferDescriptor,
  preprocessShader_GLSL,
} from '@antv/g-plugin-device-renderer';
import {
  assert,
  assertExists,
  BufferUsage,
  ChannelWriteMask,
  ClipSpaceNearZ,
  colorCopy,
  colorEqual,
  CompareMode,
  copyMegaState,
  CopyProgram,
  CullMode,
  defaultMegaState,
  Format,
  FormatCompFlags,
  FormatFlags,
  FormatTypeFlags,
  getFormatCompFlags,
  getFormatFlags,
  getFormatTypeFlags,
  GL,
  makeDataBuffer,
  nullify,
  prependLineNo,
  PrimitiveTopology,
  ResourceType,
  SamplerFormatKind,
  TextureDimension,
  TextureUsage,
  VertexStepMode,
  ViewportOrigin,
} from '@antv/g-plugin-device-renderer';
import { Bindings_GL } from './Bindings';
import { Buffer_GL } from './Buffer';
import { InputLayout_GL } from './InputLayout';
import type {
  BindingLayoutSamplerDescriptor_GL,
  EXT_texture_compression_rgtc,
  EXT_texture_norm16,
  GPlatformWebGL2Config,
  KHR_parallel_shader_compile,
  OES_draw_buffers_indexed,
} from './interfaces';
import { ProgramCompileState_GL, Program_GL } from './Program';
import { QueryPool_GL } from './QueryPool';
import { Readback_GL } from './Readback';
import { RenderPipeline_GL } from './RenderPipeline';
import { RenderTarget_GL } from './RenderTarget';
import { ComputePipeline_GL } from './ComputePipeline';
import { ResourceCreationTracker } from './ResourceCreationTracker';
import { Sampler_GL } from './Sampler';
import { Texture_GL } from './Texture';
import {
  assignPlatformName,
  findall,
  getPlatformBuffer,
  getPlatformSampler,
  getPlatformTexture,
  isBlendStateNone,
  isBlockCompressSized,
  isFormatSizedInteger,
  isTextureFormatCompressed,
  isWebGL2,
} from './utils';
import { ComputePass_GL } from './ComputePass';
import { isNil } from '@antv/util';

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
  // WEBGL_draw_buffers: WEBGL_draw_buffers | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
  WEBGL_depth_texture: WEBGL_depth_texture | null = null;
  WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc | null = null;
  WEBGL_compressed_texture_s3tc_srgb: WEBGL_compressed_texture_s3tc_srgb | null =
    null;
  EXT_texture_compression_rgtc: EXT_texture_compression_rgtc | null = null;
  EXT_texture_filter_anisotropic: EXT_texture_filter_anisotropic | null = null;
  KHR_parallel_shader_compile: KHR_parallel_shader_compile | null = null;
  // @see https://developer.mozilla.org/en-US/docs/Web/API/EXT_texture_norm16
  EXT_texture_norm16: EXT_texture_norm16 | null = null;
  OES_texture_float_linear: OES_texture_float_linear | null = null;
  OES_texture_half_float_linear: OES_texture_half_float_linear | null = null;

  // Swap Chain
  private scTexture: Texture_GL | null = null;
  private scPlatformFramebuffer: WebGLFramebuffer | null = null;

  // Device
  private currentActiveTexture: GLenum | null = null;
  private currentBoundVAO: WebGLVertexArrayObject | null = null;
  private currentProgram: Program_GL | null = null;

  private resourceCreationTracker: ResourceCreationTracker | null = null;
  private resourceUniqueId = 0;

  // Cached GL driver state
  private currentColorAttachments: (RenderTarget_GL | null)[] = [];
  private currentColorAttachmentLevels: number[] = [];
  private currentColorResolveTos: (Texture_GL | null)[] = [];
  private currentColorResolveToLevels: number[] = [];
  private currentDepthStencilAttachment: RenderTarget_GL | null;
  private currentDepthStencilResolveTo: Texture_GL | null = null;
  private currentSampleCount = -1;
  private currentPipeline: RenderPipeline_GL;
  private currentIndexBufferByteOffset: number | null = null;
  private currentMegaState: MegaStateDescriptor =
    copyMegaState(defaultMegaState);
  private currentSamplers: (WebGLSampler | null)[] = [];

  private currentTextures: (WebGLTexture | null)[] = [];

  private currentUniformBuffers: Buffer[] = [];
  private currentUniformBufferByteOffsets: number[] = [];
  private currentUniformBufferByteSizes: number[] = [];
  private currentScissorEnabled = false;
  private currentStencilRef: number | null = null;

  // Pass Execution
  private currentRenderPassDescriptor: RenderPassDescriptor | null = null;
  private debugGroupStack: DebugGroup[] = [];
  private resolveColorAttachmentsChanged = false;
  private resolveColorReadFramebuffer: WebGLFramebuffer;
  private resolveColorDrawFramebuffer: WebGLFramebuffer;
  private resolveDepthStencilAttachmentsChanged = false;
  private resolveDepthStencilReadFramebuffer: WebGLFramebuffer;
  private resolveDepthStencilDrawFramebuffer: WebGLFramebuffer;
  /**
   * use DRAW_FRAMEBUFFER in WebGL2
   */
  private renderPassDrawFramebuffer: WebGLFramebuffer;
  private readbackFramebuffer: WebGLFramebuffer;

  private fallbackTexture2D: WebGLTexture;
  private fallbackTexture2DDepth: WebGLTexture;
  private fallbackTexture2DArray: WebGLTexture;
  private fallbackTexture3D: WebGLTexture;
  private fallbackTextureCube: WebGLTexture;
  private fallbackVertexBuffer: Buffer;

  // VendorInfo
  readonly platformString: string;
  readonly glslVersion: string;
  readonly explicitBindingLocations = false;
  readonly separateSamplerTextures = false;
  readonly viewportOrigin = ViewportOrigin.LOWER_LEFT;
  readonly clipSpaceNearZ = ClipSpaceNearZ.NEGATIVE_ONE;
  readonly supportMRT: boolean = false;

  private inBlitRenderPass = false;
  private blitRenderPipeline: RenderPipeline;
  private blitInputLayout: InputLayout;
  private blitVertexBuffer: Buffer;
  private blitBindings: Bindings;
  private blitProgram: Program_GL;

  // GLimits
  /**
   * @see https://github.com/shrekshao/MoveWebGL1EngineToWebGL2/blob/master/Move-a-WebGL-1-Engine-To-WebGL-2-Blog-2.md#uniform-buffer
   */
  uniformBufferMaxPageByteSize: number;
  uniformBufferWordAlignment: number;
  uniformBufferMaxPageWordSize: number;
  supportedSampleCounts: number[] = [];
  maxVertexAttribs: number;
  occlusionQueriesRecommended = false;
  computeShadersSupported = false;

  gl: WebGLRenderingContext | WebGL2RenderingContext;

  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    configuration: GPlatformWebGL2Config,
  ) {
    this.gl = gl;
    this.contextAttributes = assertExists(gl.getContextAttributes());

    if (!isWebGL2(gl)) {
      this.OES_vertex_array_object = gl.getExtension('OES_vertex_array_object');
      // TODO: when ANGLE_instanced_arrays unavailable...
      this.ANGLE_instanced_arrays = gl.getExtension('ANGLE_instanced_arrays');
      this.OES_texture_float = gl.getExtension('OES_texture_float');
      // this.WEBGL_draw_buffers = gl.getExtension('WEBGL_draw_buffers');
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
      // this.WEBGL_depth_texture = gl.getExtension('WEBGL_depth_texture');
      // @see https://developer.mozilla.org/en-US/docs/Web/API/EXT_frag_depth
      gl.getExtension('EXT_frag_depth');
      // @see https://developer.mozilla.org/en-US/docs/Web/API/OES_element_index_uint
      gl.getExtension('OES_element_index_uint');
      // @see https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
      gl.getExtension('OES_standard_derivatives');

      // won't use MRT anymore...
      // if (this.WEBGL_draw_buffers) {
      //   this.supportMRT = true;
      // }
    } else {
      this.EXT_texture_norm16 = gl.getExtension('EXT_texture_norm16');
      // this.supportMRT = true;
    }

    this.WEBGL_compressed_texture_s3tc = gl.getExtension(
      'WEBGL_compressed_texture_s3tc',
    );
    this.WEBGL_compressed_texture_s3tc_srgb = gl.getExtension(
      'WEBGL_compressed_texture_s3tc_srgb',
    );
    this.EXT_texture_compression_rgtc = gl.getExtension(
      'EXT_texture_compression_rgtc',
    );
    this.EXT_texture_filter_anisotropic = gl.getExtension(
      'EXT_texture_filter_anisotropic',
    );
    this.EXT_texture_norm16 = gl.getExtension('EXT_texture_norm16');
    this.OES_texture_float_linear = gl.getExtension('OES_texture_float_linear');
    this.OES_texture_half_float_linear = gl.getExtension(
      'OES_texture_half_float_linear',
    );
    this.KHR_parallel_shader_compile = gl.getExtension(
      'KHR_parallel_shader_compile',
    );
    // this.OES_draw_buffers_indexed = gl.getExtension('OES_draw_buffers_indexed');

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
        dimension: TextureDimension.TEXTURE_2D,
        numLevels: 1,
        usage: TextureUsage.RENDER_TARGET,
        pixelFormat:
          this.contextAttributes.alpha === false
            ? Format.U8_RGB_RT
            : Format.U8_RGBA_RT,
      },
      fake: true,
    });
    this.scTexture.formatKind = SamplerFormatKind.Float;
    this.scTexture.gl_target = null;
    this.scTexture.gl_texture = null;

    this.resolveColorReadFramebuffer = this.ensureResourceExists(
      gl.createFramebuffer(),
    );
    this.resolveColorDrawFramebuffer = this.ensureResourceExists(
      gl.createFramebuffer(),
    );
    this.resolveDepthStencilReadFramebuffer = this.ensureResourceExists(
      gl.createFramebuffer(),
    );
    this.resolveDepthStencilDrawFramebuffer = this.ensureResourceExists(
      gl.createFramebuffer(),
    );
    this.renderPassDrawFramebuffer = this.ensureResourceExists(
      gl.createFramebuffer(),
    );
    this.readbackFramebuffer = this.ensureResourceExists(
      gl.createFramebuffer(),
    );

    this.fallbackTexture2D = this.createFallbackTexture(
      TextureDimension.TEXTURE_2D,
      SamplerFormatKind.Float,
    );
    this.fallbackTexture2DDepth = this.createFallbackTexture(
      TextureDimension.TEXTURE_2D,
      SamplerFormatKind.Depth,
    );
    this.fallbackVertexBuffer = this.createBuffer({
      viewOrSize: 1,
      usage: BufferUsage.VERTEX,
      hint: BufferFrequencyHint.STATIC,
    });

    if (isWebGL2(gl)) {
      // this.fallbackTexture2DArray = this.createFallbackTexture(
      //   TextureDimension.n2DArray,
      //   SamplerFormatKind.Float,
      // );
      // this.fallbackTexture3D = this.createFallbackTexture(
      //   TextureDimension.n3D,
      //   SamplerFormatKind.Float,
      // );
      // this.fallbackTextureCube = this.createFallbackTexture(
      //   TextureDimension.Cube,
      //   SamplerFormatKind.Float,
      // );
    }

    // Adjust for GL defaults.
    this.currentMegaState.depthCompare = CompareMode.LESS;
    this.currentMegaState.depthWrite = false;
    this.currentMegaState.attachmentsState[0].channelWriteMask =
      ChannelWriteMask.ALL;

    // always have depth test enabled.
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.STENCIL_TEST);

    this.checkLimits();

    if (configuration.shaderDebug) {
      this.shaderDebug = true;
    }

    if (configuration.trackResources) {
      this.resourceCreationTracker = new ResourceCreationTracker();
    }
  }

  destroy() {
    if (this.blitBindings) {
      this.blitBindings.destroy();
    }
    if (this.blitInputLayout) {
      this.blitInputLayout.destroy();
    }
    if (this.blitRenderPipeline) {
      this.blitRenderPipeline.destroy();
    }
    if (this.blitVertexBuffer) {
      this.blitVertexBuffer.destroy();
    }
    if (this.blitProgram) {
      this.blitProgram.destroy();
    }
  }

  private createFallbackTexture(
    dimension: TextureDimension,
    formatKind: SamplerFormatKind,
  ): WebGLTexture {
    const depth = dimension === TextureDimension.TEXTURE_CUBE_MAP ? 6 : 1;
    // const supportDepthTexture =
    //   isWebGL2(this.gl) || (!isWebGL2(this.gl) && !!this.WEBGL_depth_texture);
    const pixelFormat =
      formatKind === SamplerFormatKind.Depth
        ? Format.D32F
        : Format.U8_RGBA_NORM;

    const texture = this.createTexture({
      dimension,
      pixelFormat,
      usage: TextureUsage.SAMPLED,
      width: 1,
      height: 1,
      depth,
      numLevels: 1,
      immutable: true,
    });

    // this.blackTexture = this.ensureResourceExists(gl.createTexture());
    // gl.bindTexture(GL.TEXTURE_2D, this.blackTexture);
    // gl.texImage2D(
    //   GL.TEXTURE_2D,
    //   0,
    //   isWebGL2(gl) ? gl.RGBA8 : gl.RGBA,
    //   1,
    //   1,
    //   0,
    //   gl.RGBA,
    //   gl.UNSIGNED_BYTE,
    //   new Uint8Array(4),
    // )

    if (formatKind === SamplerFormatKind.Float) {
      texture.setImageData([new Uint8Array(4 * depth)], 0);
    }
    return getPlatformTexture(texture);
  }

  private getNextUniqueId(): number {
    return ++this.resourceUniqueId;
  }

  private checkLimits(): void {
    const gl = this.gl;

    this.maxVertexAttribs = gl.getParameter(GL.MAX_VERTEX_ATTRIBS);

    if (isWebGL2(gl)) {
      this.uniformBufferMaxPageByteSize = Math.min(
        gl.getParameter(GL.MAX_UNIFORM_BLOCK_SIZE),
        UBO_PAGE_MAX_BYTE_SIZE,
      );
      this.uniformBufferWordAlignment =
        gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT) / 4;

      const supportedSampleCounts = gl.getInternalformatParameter(
        gl.RENDERBUFFER,
        gl.DEPTH32F_STENCIL8,
        gl.SAMPLES,
      );
      this.supportedSampleCounts = supportedSampleCounts
        ? [...supportedSampleCounts]
        : [];
      this.occlusionQueriesRecommended = true;
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
    return this.scTexture;
  }

  beginFrame(): void {}

  endFrame(): void {}
  //#endregion

  //#region Device
  // @see https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
  translateTextureInternalFormat(
    fmt: Format,
    isRenderbufferStorage = false,
  ): GLenum {
    switch (fmt) {
      case Format.ALPHA:
        return GL.ALPHA;
      case Format.F16_R:
        return GL.R16F;
      case Format.F16_RG:
        return GL.RG16F;
      case Format.F16_RGB:
        return GL.RGB16F;
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
        // WebGL1 renderbuffer only support RGBA4 RGB565 RGB5_A1
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage#parameters
        // But texImage2D allows RGBA
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
        return isWebGL2(this.gl)
          ? GL.RGBA8
          : isRenderbufferStorage
          ? GL.RGBA4
          : GL.RGBA;
      case Format.U8_RGBA_SRGB:
      case Format.U8_RGBA_RT_SRGB:
        return GL.SRGB8_ALPHA8;
      case Format.U16_R:
        return GL.R16UI;
      case Format.U16_R_NORM:
        return this.EXT_texture_norm16.R16_EXT;
      case Format.U16_RG_NORM:
        return this.EXT_texture_norm16.RG16_EXT;
      case Format.U16_RGBA_NORM:
        return this.EXT_texture_norm16.RGBA16_EXT;
      case Format.U16_RGBA_5551:
        return GL.RGB5_A1;
      case Format.U16_RGB_565:
        return GL.RGB565;
      case Format.U32_R:
        return GL.R32UI;
      case Format.S8_RGBA_NORM:
        return GL.RGBA8_SNORM;
      case Format.S8_RG_NORM:
        return GL.RG8_SNORM;
      case Format.BC1:
        return this.WEBGL_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      case Format.BC1_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb
          .COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
      case Format.BC2:
        return this.WEBGL_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      case Format.BC2_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb
          .COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
      case Format.BC3:
        return this.WEBGL_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      case Format.BC3_SRGB:
        return this.WEBGL_compressed_texture_s3tc_srgb
          .COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      case Format.BC4_UNORM:
        return this.EXT_texture_compression_rgtc!.COMPRESSED_RED_RGTC1_EXT;
      case Format.BC4_SNORM:
        return this.EXT_texture_compression_rgtc
          .COMPRESSED_SIGNED_RED_RGTC1_EXT;
      case Format.BC5_UNORM:
        return this.EXT_texture_compression_rgtc.COMPRESSED_RED_GREEN_RGTC2_EXT;
      case Format.BC5_SNORM:
        return this.EXT_texture_compression_rgtc
          .COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      case Format.D32F_S8:
        return isWebGL2(this.gl)
          ? GL.DEPTH32F_STENCIL8
          : this.WEBGL_depth_texture
          ? GL.DEPTH_STENCIL
          : GL.DEPTH_COMPONENT16;
      case Format.D24_S8:
        return isWebGL2(this.gl)
          ? GL.DEPTH24_STENCIL8
          : this.WEBGL_depth_texture
          ? GL.DEPTH_STENCIL
          : GL.DEPTH_COMPONENT16;
      case Format.D32F:
        return isWebGL2(this.gl)
          ? GL.DEPTH_COMPONENT32F
          : this.WEBGL_depth_texture
          ? GL.DEPTH_COMPONENT
          : GL.DEPTH_COMPONENT16;
      case Format.D24:
        return isWebGL2(this.gl)
          ? GL.DEPTH_COMPONENT24
          : this.WEBGL_depth_texture
          ? GL.DEPTH_COMPONENT
          : GL.DEPTH_COMPONENT16;
      default:
        throw new Error('whoops');
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
        return isWebGL2(this.gl)
          ? GL.FLOAT
          : this.WEBGL_depth_texture
          ? GL.UNSIGNED_INT
          : GL.UNSIGNED_BYTE;
      case FormatTypeFlags.D24:
        return isWebGL2(this.gl)
          ? GL.UNSIGNED_INT_24_8
          : this.WEBGL_depth_texture
          ? GL.UNSIGNED_SHORT
          : GL.UNSIGNED_BYTE;
      case FormatTypeFlags.D24S8:
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
        return isWebGL2(this.gl)
          ? GL.UNSIGNED_INT_24_8
          : this.WEBGL_depth_texture
          ? GL.UNSIGNED_INT_24_8_WEBGL
          : GL.UNSIGNED_BYTE;
      case FormatTypeFlags.D32FS8:
        return GL.FLOAT_32_UNSIGNED_INT_24_8_REV;
      default:
        throw new Error('whoops');
    }
  }

  translateTextureFormat(fmt: Format): GLenum {
    if (isTextureFormatCompressed(fmt)) {
      return this.translateTextureInternalFormat(fmt);
    }

    // @see https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
    const supportDepthTexture =
      isWebGL2(this.gl) || (!isWebGL2(this.gl) && !!this.WEBGL_depth_texture);

    switch (fmt) {
      case Format.D24_S8:
      case Format.D32F_S8:
        return supportDepthTexture ? GL.DEPTH_STENCIL : GL.RGBA;
      case Format.D24:
      case Format.D32F:
        return supportDepthTexture ? GL.DEPTH_COMPONENT : GL.RGBA;
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

      if (this.shaderDebug) {
        this.checkProgramCompilationForErrors(program);
      }
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
      throw new Error(
        `Created resource is null; GL error encountered: ${error}`,
      );
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

  createProgram(descriptor: ProgramDescriptor): Program_GL {
    const rawVertexGLSL = descriptor.vertex?.glsl;
    // preprocess GLSL first
    if (descriptor.vertex.glsl) {
      descriptor.vertex.glsl = preprocessShader_GLSL(
        this.queryVendorInfo(),
        'vert',
        descriptor.vertex.glsl,
      );
    }
    if (descriptor.fragment.glsl) {
      descriptor.fragment.glsl = preprocessShader_GLSL(
        this.queryVendorInfo(),
        'frag',
        descriptor.fragment.glsl,
      );
    }
    return this.createProgramSimple(descriptor, rawVertexGLSL);
  }

  private createProgramSimple(
    descriptor: ProgramDescriptor,
    rawVertexGLSL: string,
  ): Program_GL {
    const program = new Program_GL(
      {
        id: this.getNextUniqueId(),
        device: this,
        descriptor,
      },
      rawVertexGLSL,
    );
    return program;
  }

  createBindings(descriptor: BindingsDescriptor): Bindings {
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

  createRenderPipeline(descriptor: RenderPipelineDescriptor): RenderPipeline {
    return new RenderPipeline_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createComputePass(): ComputePass {
    return new ComputePass_GL();
  }

  createComputePipeline(
    descriptor: ComputePipelineDescriptor,
  ): ComputePipeline {
    return new ComputePipeline_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor,
    });
  }

  createReadback(): Readback {
    return new Readback_GL({
      id: this.getNextUniqueId(),
      device: this,
    });
  }

  createQueryPool(type: QueryPoolType, elemCount: number): QueryPool {
    return new QueryPool_GL({
      id: this.getNextUniqueId(),
      device: this,
      descriptor: {
        type,
        elemCount,
      },
    });
  }

  private formatRenderPassDescriptor(descriptor: RenderPassDescriptor) {
    const { colorAttachment } = descriptor;

    descriptor.depthClearValue = descriptor.depthClearValue ?? 'load';
    descriptor.stencilClearValue = descriptor.stencilClearValue ?? 'load';

    for (let i = 0; i < colorAttachment.length; i++) {
      if (!descriptor.colorAttachmentLevel) {
        descriptor.colorAttachmentLevel = [];
      }
      descriptor.colorAttachmentLevel[i] =
        descriptor.colorAttachmentLevel[i] ?? 0;

      if (!descriptor.colorResolveToLevel) {
        descriptor.colorResolveToLevel = [];
      }
      descriptor.colorResolveToLevel[i] =
        descriptor.colorResolveToLevel[i] ?? 0;

      if (!descriptor.colorClearColor) {
        descriptor.colorClearColor = [];
      }
      descriptor.colorClearColor[i] = descriptor.colorClearColor[i] ?? 'load';

      if (!descriptor.colorStore) {
        descriptor.colorStore = [];
      }
      descriptor.colorStore[i] = descriptor.colorStore[i] ?? false;
    }
  }

  createRenderPass(descriptor: RenderPassDescriptor): RenderPass {
    assert(this.currentRenderPassDescriptor === null);
    this.currentRenderPassDescriptor = descriptor;

    // Format renderpass descriptor
    this.formatRenderPassDescriptor(descriptor);

    const {
      colorAttachment,
      colorAttachmentLevel,
      colorClearColor,
      colorResolveTo,
      colorResolveToLevel,
      depthStencilAttachment,
      depthClearValue,
      stencilClearValue,
      depthStencilResolveTo,
    } = descriptor;
    this.setRenderPassParametersBegin(colorAttachment.length);
    for (let i = 0; i < colorAttachment.length; i++) {
      this.setRenderPassParametersColor(
        i,
        colorAttachment[i] as RenderTarget_GL | null,
        colorAttachmentLevel[i],
        colorResolveTo[i] as Texture_GL | null,
        colorResolveToLevel[i],
      );
    }
    this.setRenderPassParametersDepthStencil(
      depthStencilAttachment as RenderTarget_GL | null,
      depthStencilResolveTo as Texture_GL | null,
    );
    this.validateCurrentAttachments();
    for (let i = 0; i < colorAttachment.length; i++) {
      const clearColor = colorClearColor[i];
      if (clearColor === 'load') continue;
      this.setRenderPassParametersClearColor(
        i,
        clearColor.r,
        clearColor.g,
        clearColor.b,
        clearColor.a,
      );
    }
    this.setRenderPassParametersClearDepthStencil(
      depthClearValue,
      stencilClearValue,
    );
    return this;
  }

  submitPass(pass: RenderPass): void {
    assert(this.currentRenderPassDescriptor !== null);
    this.endPass();
    this.currentRenderPassDescriptor = null;
  }

  copySubTexture2D(
    dst_: Texture,
    dstX: number,
    dstY: number,
    src_: Texture,
    srcX: number,
    srcY: number,
  ): void {
    const gl = this.gl;

    const dst = dst_ as Texture_GL;
    const src = src_ as Texture_GL;
    assert(src.numLevels === 1);
    assert(dst.numLevels === 1);

    if (isWebGL2(gl)) {
      if (dst === this.scTexture) {
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.scPlatformFramebuffer);
      } else {
        gl.bindFramebuffer(
          gl.DRAW_FRAMEBUFFER,
          this.resolveColorDrawFramebuffer,
        );
        this.bindFramebufferAttachment(
          gl.DRAW_FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          dst,
          0,
        );
      }

      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.resolveColorReadFramebuffer);
      this.bindFramebufferAttachment(
        gl.READ_FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        src,
        0,
      );

      gl.blitFramebuffer(
        srcX,
        srcY,
        srcX + src.width,
        srcY + src.height,
        dstX,
        dstY,
        dstX + src.width,
        dstY + src.height,
        gl.COLOR_BUFFER_BIT,
        gl.LINEAR,
      );

      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    }
  }

  queryLimits(): DeviceLimits {
    return this;
  }

  queryTextureFormatSupported(
    format: Format,
    width: number,
    height: number,
  ): boolean {
    switch (format) {
      case Format.BC1_SRGB:
      case Format.BC2_SRGB:
      case Format.BC3_SRGB:
        if (this.WEBGL_compressed_texture_s3tc_srgb !== null)
          return isBlockCompressSized(width, height, 4, 4);
        return false;
      case Format.BC1:
      case Format.BC2:
      case Format.BC3:
        if (this.WEBGL_compressed_texture_s3tc !== null)
          return isBlockCompressSized(width, height, 4, 4);
        return false;
      case Format.BC4_UNORM:
      case Format.BC4_SNORM:
      case Format.BC5_UNORM:
      case Format.BC5_SNORM:
        if (this.EXT_texture_compression_rgtc !== null)
          return isBlockCompressSized(width, height, 4, 4);
        return false;
      case Format.U16_R_NORM:
      case Format.U16_RG_NORM:
      case Format.U16_RGBA_NORM:
        return this.EXT_texture_norm16 !== null;
      case Format.F32_R:
      case Format.F32_RG:
      case Format.F32_RGB:
      case Format.F32_RGBA:
        return this.OES_texture_float_linear !== null;
      case Format.F16_R:
      case Format.F16_RG:
      case Format.F16_RGB:
      case Format.F16_RGBA:
        return this.OES_texture_half_float_linear !== null;
      default:
        return true;
    }
  }

  private queryProgramReady(program: Program_GL): boolean {
    const gl = this.gl;

    if (program.compileState === ProgramCompileState_GL.NeedsCompile) {
      // This should not happen.
      throw new Error('whoops');
    }
    if (program.compileState === ProgramCompileState_GL.Compiling) {
      let complete: boolean;

      if (this.KHR_parallel_shader_compile !== null) {
        complete = gl.getProgramParameter(
          program.gl_program,
          this.KHR_parallel_shader_compile.COMPLETION_STATUS_KHR,
        );
      } else {
        // If we don't have async shader compilation, assume all compilation is done immediately :/
        complete = true;
      }

      if (complete) {
        this.programCompiled(program);
      }

      return complete;
    }

    return (
      program.compileState === ProgramCompileState_GL.NeedsBind ||
      program.compileState === ProgramCompileState_GL.ReadyToUse
    );
  }

  queryPlatformAvailable(): boolean {
    return this.gl.isContextLost();
  }

  queryVendorInfo(): VendorInfo {
    return this;
  }

  queryRenderPass(o: RenderPass): Readonly<RenderPassDescriptor> {
    return this.currentRenderPassDescriptor;
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
    } else if (o.type === ResourceType.InputLayout) {
      assignPlatformName((o as InputLayout_GL).vao, name);
    }
  }

  setResourceLeakCheck(o: Resource, v: boolean): void {
    if (this.resourceCreationTracker !== null)
      this.resourceCreationTracker.setResourceLeakCheck(o, v);
  }

  checkForLeaks(): void {
    if (this.resourceCreationTracker !== null)
      this.resourceCreationTracker.checkForLeaks();
  }

  pushDebugGroup(debugGroup: DebugGroup): void {
    this.debugGroupStack.push(debugGroup);
  }

  popDebugGroup(): void {
    this.debugGroupStack.pop();
  }

  programPatched(o: Program, descriptor: ProgramDescriptor): void {
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

  getBufferData(
    buffer: Buffer,
    dstBuffer: ArrayBufferView,
    wordOffset = 0,
  ): void {
    const gl = this.gl;

    if (isWebGL2(gl)) {
      gl.bindBuffer(
        gl.COPY_READ_BUFFER,
        getPlatformBuffer(buffer, wordOffset * 4),
      );
      gl.getBufferSubData(gl.COPY_READ_BUFFER, wordOffset * 4, dstBuffer);
    } else {
    }
  }
  //#endregion

  private debugGroupStatisticsDrawCall(count = 1): void {
    for (let i = this.debugGroupStack.length - 1; i >= 0; i--)
      this.debugGroupStack[i].drawCallCount += count;
  }

  private debugGroupStatisticsBufferUpload(count = 1): void {
    for (let i = this.debugGroupStack.length - 1; i >= 0; i--)
      this.debugGroupStack[i].bufferUploadCount += count;
  }

  private debugGroupStatisticsTextureBind(count = 1): void {
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
      if (debug_shaders)
        console.error(debug_shaders.getTranslatedShaderSource(shader));
      console.error(gl.getShaderInfoLog(shader));
    }
    return status;
  }

  private checkProgramCompilationForErrors(program: Program_GL): void {
    const gl = this.gl;

    const prog = program.gl_program!;
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const descriptor = program.descriptor;

      if (
        !this.reportShaderError(program.gl_shader_vert, descriptor.vertex.glsl)
      )
        return;

      if (
        !this.reportShaderError(
          program.gl_shader_frag,
          descriptor.fragment.glsl,
        )
      )
        return;

      // Neither shader had an error, report the program info log.
      console.error(gl.getProgramInfoLog(program.gl_program));
    }
  }

  private bindFramebufferAttachment(
    framebuffer: GLenum,
    binding: GLenum,
    attachment: RenderTarget_GL | Texture_GL | null,
    level: number,
  ): void {
    const gl = this.gl;

    if (attachment === null) {
      gl.framebufferRenderbuffer(framebuffer, binding, gl.RENDERBUFFER, null);
    } else if (attachment.type === ResourceType.RenderTarget) {
      if ((attachment as RenderTarget_GL).gl_renderbuffer !== null) {
        gl.framebufferRenderbuffer(
          framebuffer,
          binding,
          gl.RENDERBUFFER,
          (attachment as RenderTarget_GL).gl_renderbuffer,
        );
      } else if ((attachment as RenderTarget_GL).texture !== null) {
        gl.framebufferTexture2D(
          framebuffer,
          binding,
          GL.TEXTURE_2D,
          getPlatformTexture((attachment as RenderTarget_GL).texture),
          level,
        );
      }
    } else if (attachment.type === ResourceType.Texture) {
      // TODO: use Tex2D array with gl.framebufferTextureLayer
      gl.framebufferTexture2D(
        framebuffer,
        binding,
        GL.TEXTURE_2D,
        getPlatformTexture(attachment as Texture_GL),
        level,
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
    const depth = !!(flags & FormatFlags.Depth);
    const stencil = !!(flags & FormatFlags.Stencil);

    if (depth && stencil) {
      const supportDepthTexture =
        isWebGL2(this.gl) || (!isWebGL2(this.gl) && !!this.WEBGL_depth_texture);
      if (supportDepthTexture) {
        this.bindFramebufferAttachment(
          framebuffer,
          gl.DEPTH_STENCIL_ATTACHMENT,
          attachment,
          0,
        );
      } else {
        this.bindFramebufferAttachment(
          framebuffer,
          gl.DEPTH_ATTACHMENT,
          attachment,
          0,
        );
      }
    } else if (depth) {
      this.bindFramebufferAttachment(
        framebuffer,
        gl.DEPTH_ATTACHMENT,
        attachment,
        0,
      );
      this.bindFramebufferAttachment(
        framebuffer,
        gl.STENCIL_ATTACHMENT,
        null,
        0,
      );
    } else if (stencil) {
      this.bindFramebufferAttachment(
        framebuffer,
        gl.STENCIL_ATTACHMENT,
        attachment,
        0,
      );
      this.bindFramebufferAttachment(framebuffer, gl.DEPTH_ATTACHMENT, null, 0);
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

    if (this.currentDepthStencilAttachment) {
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
      if (!this.inBlitRenderPass) {
        gl.bindFramebuffer(GL.FRAMEBUFFER, this.renderPassDrawFramebuffer);
      }
    }

    if (!this.inBlitRenderPass) {
      for (
        let i = numColorAttachments;
        i < this.currentColorAttachments.length;
        i++
      ) {
        const target = isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER;
        const attachment = isWebGL2(gl)
          ? GL.COLOR_ATTACHMENT0
          : GL.COLOR_ATTACHMENT0_WEBGL;

        gl.framebufferRenderbuffer(
          target,
          attachment + i,
          GL.RENDERBUFFER,
          null,
        );
        gl.framebufferTexture2D(target, attachment + i, GL.TEXTURE_2D, null, 0);
      }
    }
    this.currentColorAttachments.length = numColorAttachments;

    // if (isWebGL2(gl)) {
    //   gl.drawBuffers([
    //     GL.COLOR_ATTACHMENT0,
    //     GL.COLOR_ATTACHMENT1,
    //     GL.COLOR_ATTACHMENT2,
    //     GL.COLOR_ATTACHMENT3,
    //   ]);
    // } else {
    //   if (!this.inBlitRenderPass) {
    //     // MRT @see https://github.com/shrekshao/MoveWebGL1EngineToWebGL2/blob/master/Move-a-WebGL-1-Engine-To-WebGL-2-Blog-1.md#multiple-render-targets
    //     this.WEBGL_draw_buffers.drawBuffersWEBGL([
    //       GL.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
    //       GL.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
    //       GL.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
    //       GL.COLOR_ATTACHMENT3_WEBGL, // gl_FragData[3]
    //     ]);
    //   }
    // }
  }

  private setRenderPassParametersColor(
    i: number,
    colorAttachment: RenderTarget_GL | null,
    attachmentLevel: number,
    colorResolveTo: Texture_GL | null,
    resolveToLevel: number,
  ): void {
    const gl = this.gl;

    if (
      this.currentColorAttachments[i] !== colorAttachment ||
      this.currentColorAttachmentLevels[i] !== attachmentLevel
    ) {
      this.currentColorAttachments[i] = colorAttachment;
      this.currentColorAttachmentLevels[i] = attachmentLevel;

      // disable MRT in WebGL1
      if (isWebGL2(gl) || i === 0) {
        this.bindFramebufferAttachment(
          isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
          (isWebGL2(gl) ? GL.COLOR_ATTACHMENT0 : GL.COLOR_ATTACHMENT0_WEBGL) +
            i,
          colorAttachment,
          attachmentLevel,
        );
      }

      this.resolveColorAttachmentsChanged = true;
    }

    if (
      this.currentColorResolveTos[i] !== colorResolveTo ||
      this.currentColorResolveToLevels[i] !== resolveToLevel
    ) {
      this.currentColorResolveTos[i] = colorResolveTo;
      this.currentColorResolveToLevels[i] = resolveToLevel;

      if (colorResolveTo !== null) {
        this.resolveColorAttachmentsChanged = true;
      }
    }
  }

  private setRenderPassParametersDepthStencil(
    depthStencilAttachment: RenderTarget | null,
    depthStencilResolveTo: Texture | null,
  ): void {
    const gl = this.gl;

    if (this.currentDepthStencilAttachment !== depthStencilAttachment) {
      this.currentDepthStencilAttachment =
        depthStencilAttachment as RenderTarget_GL | null;

      if (!this.inBlitRenderPass) {
        this.bindFramebufferDepthStencilAttachment(
          isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
          this.currentDepthStencilAttachment,
        );
      }
      this.resolveDepthStencilAttachmentsChanged = true;
    }

    if (this.currentDepthStencilResolveTo !== depthStencilResolveTo) {
      this.currentDepthStencilResolveTo = depthStencilResolveTo as Texture_GL;

      if (depthStencilResolveTo) {
        this.resolveDepthStencilAttachmentsChanged = true;
      }
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
      if (attachment && attachment.channelWriteMask !== ChannelWriteMask.ALL) {
        this.OES_draw_buffers_indexed.colorMaskiOES(
          slot,
          true,
          true,
          true,
          true,
        );
        attachment.channelWriteMask = ChannelWriteMask.ALL;
      }
    } else {
      const attachment = this.currentMegaState.attachmentsState[0];
      if (attachment && attachment.channelWriteMask !== ChannelWriteMask.ALL) {
        gl.colorMask(true, true, true, true);
        attachment.channelWriteMask = ChannelWriteMask.ALL;
      }
    }

    this.setScissorEnabled(false);

    if (isWebGL2(gl)) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clearBuffer
      gl.clearBufferfv(gl.COLOR, slot, [r, g, b, a]);
    } else {
      gl.clearColor(r, g, b, a);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  private setRenderPassParametersClearDepthStencil(
    depthClearValue: number | 'load' = 'load',
    stencilClearValue: number | 'load' = 'load',
  ): void {
    const gl = this.gl;

    if (depthClearValue !== 'load') {
      assert(!!this.currentDepthStencilAttachment);
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
    if (stencilClearValue !== 'load') {
      assert(!!this.currentDepthStencilAttachment);
      if (!this.currentMegaState.stencilWrite) {
        gl.enable(gl.STENCIL_TEST);
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

  setBindings(
    bindingLayoutIndex: number,
    bindings_: Bindings,
    dynamicByteOffsets: number[],
  ): void {
    const gl = this.gl;

    assert(
      bindingLayoutIndex <
        this.currentPipeline.bindingLayouts.bindingLayoutTables.length,
    );
    const bindingLayoutTable =
      this.currentPipeline.bindingLayouts.bindingLayoutTables[
        bindingLayoutIndex
      ];

    const { uniformBufferBindings, samplerBindings } = bindings_ as Bindings_GL;
    // Ignore extra bindings.
    assert(
      uniformBufferBindings.length >= bindingLayoutTable.numUniformBuffers,
    );
    assert(samplerBindings.length >= bindingLayoutTable.numSamplers);
    assert(dynamicByteOffsets.length >= uniformBufferBindings.length);

    for (let i = 0; i < uniformBufferBindings.length; i++) {
      const binding = uniformBufferBindings[i];
      if (binding.wordCount === 0) continue;
      const index = bindingLayoutTable.firstUniformBuffer + i;
      const buffer = binding.buffer as Buffer_GL;
      const byteOffset = dynamicByteOffsets[i];
      const byteSize = binding.wordCount * 4;
      if (
        buffer !== this.currentUniformBuffers[index] ||
        byteOffset !== this.currentUniformBufferByteOffsets[index] ||
        byteSize !== this.currentUniformBufferByteSizes[index]
      ) {
        const platformBufferByteOffset = byteOffset % buffer.pageByteSize;
        const platformBuffer =
          buffer.gl_buffer_pages[(byteOffset / buffer.pageByteSize) | 0];
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

    for (let i = 0; i < bindingLayoutTable.numSamplers; i++) {
      const binding = samplerBindings[i];
      const samplerIndex = bindingLayoutTable.firstSampler + i;
      const samplerEntry = bindingLayoutTable.samplerEntries[i];
      const gl_sampler =
        binding !== null && binding.sampler !== null
          ? getPlatformSampler(binding.sampler)
          : null;
      const gl_texture =
        binding !== null && binding.texture !== null
          ? getPlatformTexture(binding.texture)
          : null;

      if (this.currentSamplers[samplerIndex] !== gl_sampler) {
        if (isWebGL2(gl)) {
          gl.bindSampler(samplerIndex, gl_sampler);
        }
        this.currentSamplers[samplerIndex] = gl_sampler;
      }

      if (this.currentTextures[samplerIndex] !== gl_texture) {
        this.setActiveTexture(gl.TEXTURE0 + samplerIndex);
        if (gl_texture !== null) {
          // update index
          (binding.texture as Texture_GL).textureIndex = samplerIndex;
          const { gl_target, width, height } = assertExists(binding)
            .texture as Texture_GL;
          gl.bindTexture(gl_target, gl_texture);

          // In WebGL1 set tex's parameters @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
          if (!isWebGL2(gl)) {
            (binding.sampler as Sampler_GL)?.setTextureParameters(
              gl_target,
              width,
              height,
            );
          }

          this.debugGroupStatisticsTextureBind();

          assert(samplerEntry.gl_target === gl_target);
          // assert(samplerEntry.formatKind === formatKind);
        } else {
          gl.bindTexture(
            samplerEntry.gl_target,
            this.getFallbackTexture(samplerEntry),
          );
        }
        this.currentTextures[samplerIndex] = gl_texture;
      }
    }
  }

  setViewport(x: number, y: number, w: number, h: number): void {
    const gl = this.gl;
    gl.viewport(x, y, w, h);
  }

  setScissor(x: number, y: number, w: number, h: number): void {
    const gl = this.gl;
    this.setScissorEnabled(true);
    gl.scissor(x, y, w, h);
  }

  private applyAttachmentStateIndexed(
    i: number,
    currentAttachmentState: AttachmentState,
    newAttachmentState: AttachmentState,
  ): void {
    const gl = this.gl;
    const dbi = this.OES_draw_buffers_indexed!;

    if (
      currentAttachmentState.channelWriteMask !==
      newAttachmentState.channelWriteMask
    ) {
      dbi.colorMaskiOES(
        i,
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.RED),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.GREEN),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.BLUE),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.ALPHA),
      );
      currentAttachmentState.channelWriteMask =
        newAttachmentState.channelWriteMask;
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
      currentAttachmentState.rgbBlendState.blendMode =
        newAttachmentState.rgbBlendState.blendMode;
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

    if (
      currentAttachmentState.channelWriteMask !==
      newAttachmentState.channelWriteMask
    ) {
      gl.colorMask(
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.RED),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.GREEN),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.BLUE),
        !!(newAttachmentState.channelWriteMask & ChannelWriteMask.ALPHA),
      );
      currentAttachmentState.channelWriteMask =
        newAttachmentState.channelWriteMask;
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
      ) {
        gl.enable(gl.BLEND);
      } else if (
        isBlendStateNone(newAttachmentState.rgbBlendState) &&
        isBlendStateNone(newAttachmentState.alphaBlendState)
      ) {
        gl.disable(gl.BLEND);
      }
    }

    if (blendModeChanged) {
      gl.blendEquationSeparate(
        newAttachmentState.rgbBlendState.blendMode,
        newAttachmentState.alphaBlendState.blendMode,
      );
      currentAttachmentState.rgbBlendState.blendMode =
        newAttachmentState.rgbBlendState.blendMode;
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

    if (
      !colorEqual(currentMegaState.blendConstant, newMegaState.blendConstant)
    ) {
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

    if (!!currentMegaState.depthWrite !== !!newMegaState.depthWrite) {
      gl.depthMask(newMegaState.depthWrite);
      currentMegaState.depthWrite = newMegaState.depthWrite;
    }

    if (!!currentMegaState.stencilWrite !== !!newMegaState.stencilWrite) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
      gl.stencilMask(newMegaState.stencilWrite ? 0xff : 0x00);
      currentMegaState.stencilWrite = newMegaState.stencilWrite;
    }

    if (currentMegaState.stencilPassOp !== newMegaState.stencilPassOp) {
      gl.stencilOp(gl.KEEP, gl.KEEP, newMegaState.stencilPassOp);
      currentMegaState.stencilPassOp = newMegaState.stencilPassOp;
    }

    if (
      currentMegaState.stencilRef !== newMegaState.stencilRef ||
      currentMegaState.stencilCompare !== newMegaState.stencilCompare
    ) {
      currentMegaState.stencilCompare = newMegaState.stencilCompare;
      this.setStencilRef(newMegaState.stencilRef);
    }

    if (currentMegaState.cullMode !== newMegaState.cullMode) {
      if (currentMegaState.cullMode === CullMode.NONE) {
        gl.enable(gl.CULL_FACE);
      } else if (newMegaState.cullMode === CullMode.NONE) {
        gl.disable(gl.CULL_FACE);
      }

      if (newMegaState.cullMode === CullMode.BACK) {
        gl.cullFace(gl.BACK);
      } else if (newMegaState.cullMode === CullMode.FRONT) {
        gl.cullFace(gl.FRONT);
      } else if (newMegaState.cullMode === CullMode.FRONT_AND_BACK) {
        gl.cullFace(gl.FRONT_AND_BACK);
      }
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

    if (this.currentDepthStencilAttachment) {
      assert(
        this.currentDepthStencilAttachment.pixelFormat ===
          pipeline.depthStencilAttachmentFormat,
      );
    }

    if (this.currentSampleCount !== -1) {
      assert(this.currentSampleCount === pipeline.sampleCount);
    }
  }

  setPipeline(o: RenderPipeline): void {
    this.currentPipeline = o as RenderPipeline_GL;
    this.validatePipelineFormats(this.currentPipeline);

    // We allow users to use "non-ready" pipelines for emergencies. In this case, there can be a bit of stuttering.
    // assert(this.queryPipelineReady(this.currentPipeline));

    this.setMegaState(this.currentPipeline.megaState);

    const program = this.currentPipeline.program;
    this.useProgram(program);

    if (program.compileState === ProgramCompileState_GL.NeedsBind) {
      const gl = this.gl;
      const prog = program.gl_program!;
      const deviceProgram = program.descriptor;

      const uniformBlocks = findall(
        deviceProgram.vertex.glsl,
        /uniform (\w+) {([^]*?)}/g,
      );

      if (isWebGL2(gl)) {
        for (let i = 0; i < uniformBlocks.length; i++) {
          const [, blockName] = uniformBlocks[i];
          // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/getUniformBlockIndex
          const blockIdx = gl.getUniformBlockIndex(prog, blockName);
          if (blockIdx !== -1 && blockIdx !== 0xffffffff) {
            // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/uniformBlockBinding
            gl.uniformBlockBinding(prog, blockIdx, i);
          }
        }
      }

      const samplers = findall(
        deviceProgram.vertex.glsl,
        /^uniform .*sampler\S+ (\w+);\s* \/\/ BINDING=(\d+)$/gm,
      );
      for (let i = 0; i < samplers.length; i++) {
        const [, name, location] = samplers[i];
        const samplerUniformLocation = gl.getUniformLocation(prog, name);
        gl.uniform1i(samplerUniformLocation, parseInt(location));
      }

      program.compileState = ProgramCompileState_GL.ReadyToUse;
    }
  }

  setVertexInput(
    inputLayout_: InputLayout | null,
    vertexBuffers: (VertexBufferDescriptor | null)[] | null,
    indexBuffer: IndexBufferDescriptor | null,
  ): void {
    if (inputLayout_ !== null) {
      assert(this.currentPipeline.inputLayout === inputLayout_);
      const inputLayout = inputLayout_ as InputLayout_GL;

      this.bindVAO(inputLayout.vao);

      const gl = this.gl;
      for (let i = 0; i < inputLayout.vertexAttributeDescriptors.length; i++) {
        const attr = inputLayout.vertexAttributeDescriptors[i];

        // find location by name in WebGL1
        const location = isWebGL2(gl)
          ? attr.location
          : inputLayout.program.attributes[attr.location]?.location;

        if (!isNil(location)) {
          const vertexBuffer = vertexBuffers![attr.bufferIndex];

          if (vertexBuffer === null) continue;

          const format = inputLayout.vertexBufferFormats[i];

          gl.bindBuffer(
            gl.ARRAY_BUFFER,
            getPlatformBuffer(vertexBuffer.buffer),
          );

          const bufferOffset =
            (vertexBuffer.byteOffset || 0) + attr.bufferByteOffset;

          const inputLayoutBuffer =
            inputLayout.vertexBufferDescriptors[attr.bufferIndex]!;
          gl.vertexAttribPointer(
            location,
            format.size,
            format.type,
            format.normalized,
            inputLayoutBuffer.byteStride,
            bufferOffset,
          );
        }
      }

      assert(
        (indexBuffer !== null) === (inputLayout.indexBufferFormat !== null),
      );
      if (indexBuffer !== null) {
        const buffer = indexBuffer.buffer as Buffer_GL;
        assert(buffer.usage === BufferUsage.INDEX);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getPlatformBuffer(buffer));
        this.currentIndexBufferByteOffset = indexBuffer.byteOffset;
      } else {
        this.currentIndexBufferByteOffset = null;
      }
    } else {
      assert(this.currentPipeline.inputLayout === null);
      assert(indexBuffer === null);
      this.bindVAO(null);
      this.currentIndexBufferByteOffset = 0;
    }
  }

  setStencilRef(value: number): void {
    if (this.currentStencilRef === value) {
      return;
    }
    this.currentStencilRef = value;
    this.applyStencil();
  }

  draw(count: number, firstVertex: number): void {
    const gl = this.gl;
    const pipeline = this.currentPipeline;
    gl.drawArrays(pipeline.drawMode, firstVertex, count);
    this.debugGroupStatisticsDrawCall();
    this.debugGroupStatisticsTriangles(count / 3);
  }

  drawIndexed(count: number, firstIndex: number): void {
    const gl = this.gl;
    const pipeline = this.currentPipeline,
      inputLayout = assertExists(pipeline.inputLayout);
    const byteOffset =
      assertExists(this.currentIndexBufferByteOffset) +
      firstIndex * inputLayout.indexBufferCompByteSize!;
    gl.drawElements(
      pipeline.drawMode,
      count,
      inputLayout.indexBufferType!,
      byteOffset,
    );
    this.debugGroupStatisticsDrawCall();
    this.debugGroupStatisticsTriangles(count / 3);
  }

  drawIndexedInstanced(
    count: number,
    firstIndex: number,
    instanceCount: number,
  ): void {
    const gl = this.gl;
    const pipeline = this.currentPipeline,
      inputLayout = assertExists(pipeline.inputLayout);
    const byteOffset =
      assertExists(this.currentIndexBufferByteOffset) +
      firstIndex * inputLayout.indexBufferCompByteSize!;

    const params: [number, number, number, number, number] = [
      pipeline.drawMode,
      count,
      inputLayout.indexBufferType!,
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

  beginOcclusionQuery(dstOffs: number): void {
    const gl = this.gl;
    if (isWebGL2(gl)) {
      const queryPool = this.currentRenderPassDescriptor
        .occlusionQueryPool as QueryPool_GL;
      gl.beginQuery(queryPool.gl_query_type, queryPool.gl_query[dstOffs]);
    }
  }

  endOcclusionQuery(dstOffs: number): void {
    const gl = this.gl;
    if (isWebGL2(gl)) {
      const queryPool = this.currentRenderPassDescriptor!
        .occlusionQueryPool as QueryPool_GL;
      gl.endQuery(queryPool.gl_query_type);
    }
  }

  beginDebugGroup(name: string): void {}

  endDebugGroup(): void {}

  pipelineQueryReady(o: RenderPipeline): boolean {
    const pipeline = o as RenderPipeline_GL;
    return this.queryProgramReady(pipeline.program);
  }

  pipelineForceReady(o: RenderPipeline): void {
    // No need to do anything; it will be forced to compile when used naturally.
  }

  private endPass(): void {
    const gl = this.gl;

    let didUnbindDraw = false;

    for (let i = 0; i < this.currentColorAttachments.length; i++) {
      const colorResolveFrom = this.currentColorAttachments[i];

      if (colorResolveFrom !== null) {
        const colorResolveTo = this.currentColorResolveTos[i];
        let didBindRead = false;

        if (colorResolveTo !== null) {
          assert(
            colorResolveFrom.width === colorResolveTo.width &&
              colorResolveFrom.height === colorResolveTo.height,
          );
          assert(colorResolveFrom.pixelFormat === colorResolveTo.pixelFormat);

          this.setScissorEnabled(false);
          if (isWebGL2(gl)) {
            gl.bindFramebuffer(
              gl.READ_FRAMEBUFFER,
              this.resolveColorReadFramebuffer,
            );
          }
          if (this.resolveColorAttachmentsChanged) {
            if (isWebGL2(gl)) {
              this.bindFramebufferAttachment(
                gl.READ_FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                colorResolveFrom,
                this.currentColorAttachmentLevels[i],
              );
            }
          }
          didBindRead = true;

          // Special case: Blitting to the on-screen.
          if (colorResolveTo === this.scTexture) {
            gl.bindFramebuffer(
              isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
              this.scPlatformFramebuffer,
            );
          } else {
            gl.bindFramebuffer(
              isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
              this.resolveColorDrawFramebuffer,
            );
            if (this.resolveColorAttachmentsChanged)
              gl.framebufferTexture2D(
                isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                colorResolveTo.gl_texture,
                this.currentColorResolveToLevels[i],
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
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
          } else {
            // need an extra render pass in WebGL1
            this.submitBlitRenderPass(colorResolveFrom, colorResolveTo);
          }
          didUnbindDraw = true;
        }

        if (!this.currentRenderPassDescriptor.colorStore[i]) {
          if (!didBindRead) {
            gl.bindFramebuffer(
              isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
              this.resolveColorReadFramebuffer,
            );
            if (this.resolveColorAttachmentsChanged)
              this.bindFramebufferAttachment(
                isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                colorResolveFrom,
                this.currentColorAttachmentLevels[i],
              );
          }

          if (isWebGL2(gl)) {
            gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, [
              gl.COLOR_ATTACHMENT0,
            ]);
          }
        }

        gl.bindFramebuffer(
          isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
          null,
        );
      }
    }

    this.resolveColorAttachmentsChanged = false;

    const depthStencilResolveFrom = this.currentDepthStencilAttachment;
    if (depthStencilResolveFrom) {
      const depthStencilResolveTo = this.currentDepthStencilResolveTo;
      let didBindRead = false;

      if (depthStencilResolveTo) {
        assert(
          depthStencilResolveFrom.width === depthStencilResolveTo.width &&
            depthStencilResolveFrom.height === depthStencilResolveTo.height,
        );

        this.setScissorEnabled(false);

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
        didBindRead = true;

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
        } else {
        }
        gl.bindFramebuffer(
          isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
          null,
        );
        didUnbindDraw = true;
      }

      if (!this.currentRenderPassDescriptor!.depthStencilStore) {
        if (!didBindRead) {
          gl.bindFramebuffer(
            isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
            this.resolveDepthStencilReadFramebuffer,
          );
          if (this.resolveDepthStencilAttachmentsChanged)
            this.bindFramebufferDepthStencilAttachment(
              isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
              depthStencilResolveFrom,
            );
          didBindRead = true;
        }

        if (isWebGL2(gl)) {
          gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, [
            gl.DEPTH_STENCIL_ATTACHMENT,
          ]);
        }
      }

      if (didBindRead)
        gl.bindFramebuffer(
          isWebGL2(gl) ? GL.READ_FRAMEBUFFER : GL.FRAMEBUFFER,
          null,
        );

      this.resolveDepthStencilAttachmentsChanged = false;
    }

    if (!didUnbindDraw) {
      // If we did not unbind from a resolve, then we need to unbind our render pass draw FBO here.
      gl.bindFramebuffer(
        isWebGL2(gl) ? GL.DRAW_FRAMEBUFFER : GL.FRAMEBUFFER,
        null,
      );
    }
  }

  private setScissorEnabled(v: boolean): void {
    if (this.currentScissorEnabled === v) {
      return;
    }

    const gl = this.gl;
    if (v) {
      gl.enable(gl.SCISSOR_TEST);
    } else {
      gl.disable(gl.SCISSOR_TEST);
    }
    this.currentScissorEnabled = v;
  }

  private applyStencil(): void {
    if (isNil(this.currentStencilRef)) {
      return;
    }
    this.gl.stencilFunc(
      this.currentMegaState.stencilCompare,
      this.currentStencilRef,
      0xff,
    );
  }

  private getFallbackTexture(
    samplerEntry: BindingLayoutSamplerDescriptor_GL,
  ): WebGLTexture {
    const gl_target = samplerEntry.gl_target,
      formatKind = samplerEntry.formatKind;
    if (gl_target === GL.TEXTURE_2D)
      return formatKind === SamplerFormatKind.Depth
        ? this.fallbackTexture2DDepth
        : this.fallbackTexture2D;
    else if (gl_target === GL.TEXTURE_2D_ARRAY)
      return this.fallbackTexture2DArray;
    else if (gl_target === GL.TEXTURE_3D) return this.fallbackTexture3D;
    else if (gl_target === GL.TEXTURE_CUBE_MAP) return this.fallbackTextureCube;
    else throw new Error('whoops');
  }

  private submitBlitRenderPass(
    resolveFrom: RenderTarget_GL,
    resolveTo: Texture_GL,
  ) {
    if (!this.blitRenderPipeline) {
      const program = new CopyProgram();
      this.blitProgram = this.createProgram({
        vertex: {
          glsl: program.vert,
        },
        fragment: {
          glsl: program.frag,
        },
      });
      this.blitVertexBuffer = makeDataBuffer(
        this,
        BufferUsage.VERTEX | BufferUsage.COPY_DST,
        new Float32Array([-4, -4, 4, -4, 0, 4]).buffer,
      );
      this.blitInputLayout = this.createInputLayout({
        vertexBufferDescriptors: [
          { byteStride: 4 * 2, stepMode: VertexStepMode.VERTEX },
        ],
        vertexAttributeDescriptors: [
          {
            format: Format.F32_RG,
            bufferIndex: 0,
            bufferByteOffset: 4 * 0,
            location: 0,
          },
        ],
        indexBufferFormat: null,
        program: this.blitProgram,
      });
      const bindingLayouts: BindingLayoutDescriptor[] = [
        { numSamplers: 1, numUniformBuffers: 0 },
      ];
      this.blitRenderPipeline = this.createRenderPipeline({
        topology: PrimitiveTopology.TRIANGLES,
        sampleCount: 1,
        program: this.blitProgram,
        bindingLayouts,
        colorAttachmentFormats: [Format.U8_RGBA_RT],
        depthStencilAttachmentFormat: null,
        inputLayout: this.blitInputLayout,
        megaStateDescriptor: copyMegaState(defaultMegaState),
      });

      this.blitBindings = this.createBindings({
        bindingLayout: bindingLayouts[0],
        samplerBindings: [
          {
            sampler: null,
            texture: resolveFrom.texture,
            lateBinding: null,
          },
        ],
        uniformBufferBindings: [],
      });

      this.blitProgram.setUniforms({
        u_Texture: resolveFrom,
      });
    }

    // save currentRenderPassDescriptor since we're already in a render pass
    const currentRenderPassDescriptor = this.currentRenderPassDescriptor;
    this.currentRenderPassDescriptor = null;

    this.inBlitRenderPass = true;

    const blitRenderPass = this.createRenderPass({
      colorAttachment: [resolveFrom],
      colorResolveTo: [resolveTo],
      colorClearColor: [TransparentWhite],
    });

    const { width, height } = this.getCanvas() as HTMLCanvasElement;
    blitRenderPass.setPipeline(this.blitRenderPipeline);
    blitRenderPass.setBindings(0, this.blitBindings, [0]);
    blitRenderPass.setVertexInput(
      this.blitInputLayout,
      [{ buffer: this.blitVertexBuffer }],
      null,
    );
    blitRenderPass.setViewport(0, 0, width, height);

    // disable blending for blit
    this.gl.disable(this.gl.BLEND);
    blitRenderPass.draw(3, 0);
    this.gl.enable(this.gl.BLEND);

    // restore
    this.currentRenderPassDescriptor = currentRenderPassDescriptor;
    this.inBlitRenderPass = false;
  }
}
