/**
 * ported from luma.gl
 * uniformXXX for WebGL1 according to format
 */
import { GL } from '../constants';
import { assert } from './assert';

// if array name then clean the array brackets
const UNIFORM_NAME_REGEXP = /([^[]*)(\[[0-9]+\])?/;

export function parseUniformName(name: string): {
  name: string;
  isArray: boolean;
  length: number;
} {
  // Shortcut to avoid redundant or bad matches
  if (name[name.length - 1] !== ']') {
    return {
      name,
      length: 1,
      isArray: false,
    };
  }

  const matches = name.match(UNIFORM_NAME_REGEXP);
  if (!matches || matches.length < 2) {
    throw new Error(`Failed to parse GLSL uniform name ${name}`);
  }

  return {
    name: matches[1],
    length: Number(matches[2]) || 1,
    isArray: Boolean(matches[2]),
  };
}

function getSamplerSetter() {
  let cache = null;
  return (
    gl: WebGLRenderingContextBase,
    location: WebGLUniformLocation,
    value: any,
  ) => {
    const update = cache !== value;
    if (update) {
      gl.uniform1i(location, value);
      cache = value;
    }

    return update;
  };
}

function getArraySetter(functionName: string, toArray, size, uniformSetter) {
  let cache = null;
  let cacheLength = null;
  return (gl: WebGLRenderingContextBase, location: number, value: any) => {
    const arrayValue = toArray(value, size);
    const length = arrayValue.length;
    let update = false;
    if (cache === null) {
      cache = new Float32Array(length);
      cacheLength = length;
      update = true;
    } else {
      assert(cacheLength === length, 'Uniform length cannot change.');
      for (let i = 0; i < length; ++i) {
        if (arrayValue[i] !== cache[i]) {
          update = true;
          break;
        }
      }
    }
    if (update) {
      uniformSetter(gl, functionName, location, arrayValue);
      cache.set(arrayValue);
    }

    return update;
  };
}

function setVectorUniform(
  gl: WebGLRenderingContextBase,
  functionName: string,
  location: number,
  value: any,
) {
  gl[functionName](location, value);
}

function setMatrixUniform(
  gl: WebGLRenderingContextBase,
  functionName: string,
  location: number,
  value: any,
) {
  gl[functionName](location, false, value);
}

const FLOAT_ARRAY = {};
const INT_ARRAY = {};
const UINT_ARRAY = {};
const array1: number[] = [0];
type ValueType = boolean | number | number[] | boolean[] | ArrayBufferView;
function toTypedArray(
  value: ValueType,
  uniformLength: number,
  Type:
    | Float32ArrayConstructor
    | Uint16ArrayConstructor
    | Uint32ArrayConstructor
    | Int32ArrayConstructor,
  cache: Record<number, any>,
): ArrayBufferView {
  // convert boolean uniforms to Number
  if (uniformLength === 1 && typeof value === 'boolean') {
    value = value ? 1 : 0;
  }
  if (Number.isFinite(value)) {
    array1[0] = value as number;
    value = array1;
  }
  const length = (value as number[]).length;
  if (length % uniformLength) {
    // log.warn(`Uniform size should be multiples of ${uniformLength}`, value)();
  }

  if (value instanceof Type) {
    return value;
  }
  let result = cache[length];
  if (!result) {
    result = new Type(length);
    cache[length] = result;
  }
  for (let i = 0; i < length; i++) {
    result[i] = value[i];
  }
  return result;
}

function toFloatArray(value: ValueType, uniformLength: number) {
  return toTypedArray(value, uniformLength, Float32Array, FLOAT_ARRAY);
}

function toIntArray(value: ValueType, uniformLength: number) {
  return toTypedArray(value, uniformLength, Int32Array, INT_ARRAY);
}

function toUIntArray(value: ValueType, uniformLength: number) {
  return toTypedArray(value, uniformLength, Uint32Array, UINT_ARRAY);
}

export const UNIFORM_SETTERS = {
  // WEBGL1
  [GL.FLOAT]: getArraySetter.bind(
    null,
    'uniform1fv',
    toFloatArray,
    1,
    setVectorUniform,
  ),
  [GL.FLOAT_VEC2]: getArraySetter.bind(
    null,
    'uniform2fv',
    toFloatArray,
    2,
    setVectorUniform,
  ),
  [GL.FLOAT_VEC3]: getArraySetter.bind(
    null,
    'uniform3fv',
    toFloatArray,
    3,
    setVectorUniform,
  ),
  [GL.FLOAT_VEC4]: getArraySetter.bind(
    null,
    'uniform4fv',
    toFloatArray,
    4,
    setVectorUniform,
  ),

  [GL.INT]: getArraySetter.bind(
    null,
    'uniform1iv',
    toIntArray,
    1,
    setVectorUniform,
  ),
  [GL.INT_VEC2]: getArraySetter.bind(
    null,
    'uniform2iv',
    toIntArray,
    2,
    setVectorUniform,
  ),
  [GL.INT_VEC3]: getArraySetter.bind(
    null,
    'uniform3iv',
    toIntArray,
    3,
    setVectorUniform,
  ),
  [GL.INT_VEC4]: getArraySetter.bind(
    null,
    'uniform4iv',
    toIntArray,
    4,
    setVectorUniform,
  ),

  [GL.BOOL]: getArraySetter.bind(
    null,
    'uniform1iv',
    toIntArray,
    1,
    setVectorUniform,
  ),
  [GL.BOOL_VEC2]: getArraySetter.bind(
    null,
    'uniform2iv',
    toIntArray,
    2,
    setVectorUniform,
  ),
  [GL.BOOL_VEC3]: getArraySetter.bind(
    null,
    'uniform3iv',
    toIntArray,
    3,
    setVectorUniform,
  ),
  [GL.BOOL_VEC4]: getArraySetter.bind(
    null,
    'uniform4iv',
    toIntArray,
    4,
    setVectorUniform,
  ),

  // uniformMatrix(false): don't transpose the matrix
  [GL.FLOAT_MAT2]: getArraySetter.bind(
    null,
    'uniformMatrix2fv',
    toFloatArray,
    4,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT3]: getArraySetter.bind(
    null,
    'uniformMatrix3fv',
    toFloatArray,
    9,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT4]: getArraySetter.bind(
    null,
    'uniformMatrix4fv',
    toFloatArray,
    16,
    setMatrixUniform,
  ),

  // WEBGL2 - unsigned integers, irregular matrices, additional texture samplers

  [GL.UNSIGNED_INT]: getArraySetter.bind(
    null,
    'uniform1uiv',
    toUIntArray,
    1,
    setVectorUniform,
  ),
  [GL.UNSIGNED_INT_VEC2]: getArraySetter.bind(
    null,
    'uniform2uiv',
    toUIntArray,
    2,
    setVectorUniform,
  ),
  [GL.UNSIGNED_INT_VEC3]: getArraySetter.bind(
    null,
    'uniform3uiv',
    toUIntArray,
    3,
    setVectorUniform,
  ),
  [GL.UNSIGNED_INT_VEC4]: getArraySetter.bind(
    null,
    'uniform4uiv',
    toUIntArray,
    4,
    setVectorUniform,
  ),

  // uniformMatrix(false): don't transpose the matrix
  [GL.FLOAT_MAT2x3]: getArraySetter.bind(
    null,
    'uniformMatrix2x3fv',
    toFloatArray,
    6,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT2x4]: getArraySetter.bind(
    null,
    'uniformMatrix2x4fv',
    toFloatArray,
    8,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT3x2]: getArraySetter.bind(
    null,
    'uniformMatrix3x2fv',
    toFloatArray,
    6,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT3x4]: getArraySetter.bind(
    null,
    'uniformMatrix3x4fv',
    toFloatArray,
    12,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT4x2]: getArraySetter.bind(
    null,
    'uniformMatrix4x2fv',
    toFloatArray,
    8,
    setMatrixUniform,
  ),
  [GL.FLOAT_MAT4x3]: getArraySetter.bind(
    null,
    'uniformMatrix4x3fv',
    toFloatArray,
    12,
    setMatrixUniform,
  ),

  [GL.SAMPLER_2D]: getSamplerSetter,
  [GL.SAMPLER_CUBE]: getSamplerSetter,

  [GL.SAMPLER_3D]: getSamplerSetter,
  [GL.SAMPLER_2D_SHADOW]: getSamplerSetter,
  [GL.SAMPLER_2D_ARRAY]: getSamplerSetter,
  [GL.SAMPLER_2D_ARRAY_SHADOW]: getSamplerSetter,
  [GL.SAMPLER_CUBE_SHADOW]: getSamplerSetter,
  [GL.INT_SAMPLER_2D]: getSamplerSetter,
  [GL.INT_SAMPLER_3D]: getSamplerSetter,
  [GL.INT_SAMPLER_CUBE]: getSamplerSetter,
  [GL.INT_SAMPLER_2D_ARRAY]: getSamplerSetter,
  [GL.UNSIGNED_INT_SAMPLER_2D]: getSamplerSetter,
  [GL.UNSIGNED_INT_SAMPLER_3D]: getSamplerSetter,
  [GL.UNSIGNED_INT_SAMPLER_CUBE]: getSamplerSetter,
  [GL.UNSIGNED_INT_SAMPLER_2D_ARRAY]: getSamplerSetter,
};

export function getUniformSetter(
  gl: WebGLRenderingContext,
  location: WebGLUniformLocation,
  info: WebGLActiveInfo,
): any {
  const setter = UNIFORM_SETTERS[info.type];
  if (!setter) {
    throw new Error(`Unknown GLSL uniform type ${info.type}`);
  }
  return setter().bind(null, gl, location);
}
