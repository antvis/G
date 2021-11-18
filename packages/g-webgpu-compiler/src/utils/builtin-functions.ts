import { AST_TOKEN_TYPES } from '../ast/glsl-ast-node-types';
import { Target } from '../backends/ICodeGenerator';

// http://learnwebgl.brown37.net/12_shader_language/glsl_data_types.html
export const typeCastFunctions = [
  'float',
  'int',
  'uint',
  'vec2',
  'vec3',
  'vec4',
  'bool',
  'ivec2',
  'ivec3',
  'ivec4',
  'bvec2',
  'bvec3',
  'bvec4',
  'mat2',
  'mat3',
  'mat4',
];

export const builtinFunctions = [
  'radians',
  'degrees',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'pow',
  'exp',
  'log',
  'exp2',
  'log2',
  'sqrt',
  'abs',
  'sign',
  'floor',
  'ceil',
  'min',
  'max',
  'normalize',
  'distance',
];

// https://stackoverflow.com/questions/12085403/whats-the-logic-for-determining-a-min-max-vector-in-glsl
// https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.30.pdf
export const componentWiseFunctions = [
  'radians',
  'degrees',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'pow',
  'exp',
  'log',
  'exp2',
  'log2',
  'sqrt',
  'abs',
  'sign',
  'floor',
  'ceil',
  'min',
  'max',
];

export const swizzling = ['r', 'g', 'b', 'a', 'x', 'y', 'z', 'w', 's', 't', 'p', 'q'];

export const typePriority = {
  float: 1,
  int: 2,
  uint: 3,
  vec2: 100,
  vec3: 101,
  vec4: 102,
};

export const importFunctions = {
  // 在 fract() 后可能丢失精度，例如(0.0) -> (0.999999)
  [Target.GLSL100]: `
float epsilon = 0.00001;
vec2 addrTranslation_1Dto2D(float address1D, vec2 texSize) {
  vec2 conv_const = vec2(1.0 / texSize.x, 1.0 / (texSize.x * texSize.y));
  vec2 normAddr2D = float(address1D) * conv_const;
  return vec2(fract(normAddr2D.x + epsilon), normAddr2D.y);
}

void barrier() {}
  `,
  [Target.GLSL450]: '',
  [Target.WGSL]: '',
};

export const exportFunctions = {
  [Target.GLSL100]: {
    debug: {
      content: `
void debug(vec4 o) {
  gWebGPUDebug = true;
  gWebGPUDebugOutput = o;
}
void debug(vec3 o) {
  debug(vec4(o.xyz, 0.0));
}
void debug(vec2 o) {
  debug(vec4(o.xy, 0.0, 0.0));
}
void debug(ivec4 o) {
  debug(vec4(o));
}
void debug(ivec3 o) {
  debug(vec4(o.xyz, 0.0));
}
void debug(ivec2 o) {
  debug(vec4(o.xy, 0.0, 0.0));
}
void debug(float o) {
  debug(vec4(o, 0.0, 0.0, 0.0));
}
void debug(int o) {
  debug(vec4(o, 0.0, 0.0, 0.0));
}
void debug(bool o) {
  debug(vec4(o, 0.0, 0.0, 0.0));
}
`,
      returnType: AST_TOKEN_TYPES.Void,
    },
  },
  [Target.GLSL450]: {
    debug: {
      content: `
void debug(vec4 o) {
  gWebGPUDebug = true;
  gWebGPUDebugOutput = o;
}
void debug(vec3 o) {
  debug(vec4(o.xyz, 0.0));
}
void debug(vec2 o) {
  debug(vec4(o.xy, 0.0, 0.0));
}
void debug(ivec4 o) {
  debug(vec4(o));
}
void debug(ivec3 o) {
  debug(vec4(o.xyz, 0.0));
}
void debug(ivec2 o) {
  debug(vec4(o.xy, 0.0, 0.0));
}
void debug(float o) {
  debug(vec4(o, 0.0, 0.0, 0.0));
}
void debug(int o) {
  debug(vec4(o, 0.0, 0.0, 0.0));
}
void debug(bool o) {
  debug(vec4(o, 0.0, 0.0, 0.0));
}
`,
      returnType: AST_TOKEN_TYPES.Void,
    },
  },
  [Target.WGSL]: {},
};
