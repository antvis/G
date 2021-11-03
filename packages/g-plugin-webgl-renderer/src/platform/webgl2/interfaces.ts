export interface EXT_texture_compression_rgtc {
  COMPRESSED_RED_RGTC1_EXT: GLenum;
  COMPRESSED_SIGNED_RED_RGTC1_EXT: GLenum;
  COMPRESSED_RED_GREEN_RGTC2_EXT: GLenum;
  COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: GLenum;
}

export interface OES_draw_buffers_indexed {
  enableiOES(target: GLuint, index: GLuint): void;
  disableiOES(target: GLenum, index: GLuint): void;
  blendEquationiOES(buf: GLuint, mode: GLenum): void;
  blendEquationSeparateiOES(buf: GLuint, modeRGB: GLenum, modeAlpha: GLenum): void;
  blendFunciOES(buf: GLuint, src: GLenum, dst: GLenum): void;
  blendFuncSeparateiOES(
    buf: GLuint,
    srcRGB: GLenum,
    dstRGB: GLenum,
    srcAlpha: GLenum,
    dstAlpha: GLenum,
  ): void;
  colorMaskiOES(buf: GLuint, r: GLboolean, g: GLboolean, b: GLboolean, a: GLboolean): void;
}

export interface KHR_parallel_shader_compile {
  COMPLETION_STATUS_KHR: number;
}

export class GPlatformWebGL2Config {
  public trackResources: boolean = false;
  public shaderDebug: boolean = false;
}
