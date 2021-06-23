// Compatability layer to make regl work with webgl2.
// See https://github.com/regl-project/regl/issues/561
const GL_DEPTH_COMPONENT = 0x1902;
const GL_DEPTH_STENCIL = 0x84F9;
const HALF_FLOAT_OES = 0x8D61;

// webgl1 extensions natively supported by webgl2
const gl2Extensions = {
  'WEBGL_depth_texture': {
    'UNSIGNED_INT_24_8_WEBGL': 0x84FA
  },
  'OES_element_index_uint': {},
  'OES_texture_float': {},
  // 'OES_texture_float_linear': {},
  'OES_texture_half_float': {
    'HALF_FLOAT_OES': HALF_FLOAT_OES
  },
  // 'OES_texture_half_float_linear': {},
  'EXT_color_buffer_float': {},
  'OES_standard_derivatives': {},
  'EXT_frag_depth': {},
  'EXT_blend_minmax': {
    'MIN_EXT': 0x8007,
    'MAX_EXT': 0x8008
  },
  'EXT_shader_texture_lod': {}
}

const extensions = {};
const versionProperty = '___regl_gl_version___';

// texture internal format to update on the fly
export function getInternalFormat(gl: any, format: number, type: number) {
  if (gl[versionProperty] !== 2) {
    return format;
  }
  // webgl2 texture formats
  // reference:
  // https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
  if (format === GL_DEPTH_COMPONENT) {
    return gl.DEPTH_COMPONENT24;
  } else if (format === GL_DEPTH_STENCIL) {
    return gl.DEPTH24_STENCIL8;
  } else if (type === HALF_FLOAT_OES && format === gl.RGBA) {
    return gl.RGBA16F;
  } else if (type === HALF_FLOAT_OES && format === gl.RGB) {
    return gl.RGB16F;
  } else if (type === gl.FLOAT && format === gl.RGBA) {
    return gl.RGBA32F;
  } else if (type === gl.FLOAT && format === gl.RGB) {
    return gl.RGB32F;
  }
  return format;
}

// texture type to update on the fly
export function getTextureType(gl: any, type: number) {
  if (gl[versionProperty] !== 2) {
    return type;
  }
  if (type === HALF_FLOAT_OES) {
    return gl.HALF_FLOAT;
  }
  return type;
}

export function overrideContextType(callback: Function) {
  // Monkey-patch context creation to override the context type.
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  // @ts-ignore
  HTMLCanvasElement.prototype.getContext = function (ignoredContextType, contextAttributes) {
    // @ts-ignore
    return wrapGLContext(origGetContext.bind(this)('webgl2', contextAttributes), extensions);
  };
  // Execute the callback with overridden context type.
  const rv = callback();

  // Restore the original method.
  HTMLCanvasElement.prototype.getContext = origGetContext;
  return rv;
}

// webgl1 extensions natively supported by webgl2
// this is called when initializing regl context
export function wrapGLContext(gl: WebGL2RenderingContext, extensions: any) {
  // @ts-ignore
  gl[versionProperty] = 2;
  for (const p in gl2Extensions) {
    // @ts-ignore
    extensions[p.toLowerCase()] = gl2Extensions[p];
  }

  // to support float and half-float textures
  gl.getExtension('EXT_color_buffer_float');

  // Now override getExtension to return ours.
  const origGetExtension = gl.getExtension;
  gl.getExtension = (n: string) => {
    return extensions[n.toLowerCase()] || origGetExtension.apply(gl, [n]);
  };

  // And texImage2D to convert the internalFormat to webgl2.
  const origTexImage = gl.texImage2D;
  // @ts-ignore
  gl.texImage2D = function (target, miplevel, iformat, a, typeFor6, c, d, typeFor9, f) {
    if (arguments.length == 6) {
      const ifmt = getInternalFormat(gl, iformat, typeFor6);
      // @ts-ignore
      origTexImage.apply(gl, [target, miplevel, ifmt, a, getTextureType(gl, typeFor6), c]);
    } else { // arguments.length == 9
      const ifmt = getInternalFormat(gl, iformat, typeFor9);
      // @ts-ignore
      origTexImage.apply(gl, [target, miplevel, ifmt, a, typeFor6, c, d, getTextureType(gl, typeFor9), f]);
    }
  }

  // mocks of draw buffers's functions
  extensions['webgl_draw_buffers'] = {
    drawBuffersWEBGL: function () {
      // @ts-ignore
      return gl.drawBuffers.apply(gl, arguments);
    }
  }

  // mocks of vao extension
  extensions['oes_vertex_array_object'] = {
    'VERTEX_ARRAY_BINDING_OES': 0x85B5,
    'createVertexArrayOES': function () {
      return gl.createVertexArray();
    },
    'deleteVertexArrayOES': function () {
      // @ts-ignore
      return gl.deleteVertexArray.apply(gl, arguments);
    },
    'isVertexArrayOES': function () {
      // @ts-ignore
      return gl.isVertexArray.apply(gl, arguments);
    },
    'bindVertexArrayOES': function () {
      // @ts-ignore
      return gl.bindVertexArray.apply(gl, arguments);
    },
  }

  // mocks of instancing extension
  extensions['angle_instanced_arrays'] = {
    'VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE': 0x88FE,
    'drawArraysInstancedANGLE': function () {
      // @ts-ignore
      return gl.drawArraysInstanced.apply(gl, arguments)
    },
    'drawElementsInstancedANGLE': function () {
      // @ts-ignore
      return gl.drawElementsInstanced.apply(gl, arguments)
    },
    'vertexAttribDivisorANGLE': function () {
      // @ts-ignore
      return gl.vertexAttribDivisor.apply(gl, arguments)
    },
  }

  return gl;
}