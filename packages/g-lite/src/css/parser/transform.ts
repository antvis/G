import { clamp } from '@antv/util';
import type { DisplayObject } from '../../display-objects';
import { decomposeMat4, deg2rad } from '../../utils/math';
import { getOrCreateUnitValue } from '../CSSStyleValuePool';
import { CSSUnitValue, Odeg, Opx } from '../cssom';
import {
  convertAngleUnit,
  convertPercentUnit,
  mergeDimensions,
  parseAngle,
  parseAngleUnmemoize,
  parseLength,
  parseLengthUnmemoize,
  parseLengthOrPercentage,
  parseLengthOrPercentageUnmemoize,
} from './dimension';
import { parseNumber, parseNumberUnmemoize } from './numeric';
import type { Transform } from '../../types';

// eg. { t: 'scale', d: [CSSUnitValue(1), CSSUnitValue(2)] }
export interface ParsedTransform {
  t: string;
  d: CSSUnitValue[];
}

type TransformType =
  | 'matrix'
  | 'matrix3d'
  | 'rotate'
  | 'rotatex'
  | 'rotatey'
  | 'rotatez'
  | 'rotate3d'
  | 'scale'
  | 'scalex'
  | 'scaley'
  | 'scalez'
  | 'scale3d'
  | 'translate'
  | 'translatex'
  | 'translatey'
  | 'translatez'
  | 'translate3d';
type PatternElement = string | number | null | CSSUnitValue;
type CastFunction =
  | ((string: string) => string)
  | ((contents: (number | PatternElement)[]) => PatternElement[]);

const _ = null;
const TRANSFORM_REGEXP = /\s*(\w+)\(([^)]*)\)/g;
function cast(pattern: PatternElement[]) {
  return function (contents: PatternElement[]) {
    let i = 0;
    return pattern.map((x) => {
      return x === _ ? contents[i++] : x;
    });
  };
}

function id(x: string) {
  return x;
}

// type: [argTypes, convertTo3D, convertTo2D]
// In the argument types string, lowercase characters represent optional arguments
const transformFunctions: Record<
  TransformType,
  [string] | [string, CastFunction] | [string, CastFunction, CastFunction]
> = {
  // @ts-ignore
  matrix: ['NNNNNN', [_, _, 0, 0, _, _, 0, 0, 0, 0, 1, 0, _, _, 0, 1], id],
  matrix3d: ['NNNNNNNNNNNNNNNN', id],
  rotate: ['A'],
  rotatex: ['A'],
  rotatey: ['A'],
  rotatez: ['A'],
  rotate3d: ['NNNA'],
  perspective: ['L'],
  scale: ['Nn', cast([_, _, new CSSUnitValue(1)]), id],
  scalex: [
    'N',
    cast([_, new CSSUnitValue(1), new CSSUnitValue(1)]),
    cast([_, new CSSUnitValue(1)]),
  ],
  scaley: [
    'N',
    cast([new CSSUnitValue(1), _, new CSSUnitValue(1)]),
    cast([new CSSUnitValue(1), _]),
  ],
  scalez: ['N', cast([new CSSUnitValue(1), new CSSUnitValue(1), _])],
  scale3d: ['NNN', id],
  skew: ['Aa', null, id],
  skewx: ['A', null, cast([_, Odeg])],
  skewy: ['A', null, cast([Odeg, _])],
  translate: ['Tt', cast([_, _, Opx]), id],
  translatex: ['T', cast([_, Opx, Opx]), cast([_, Opx])],
  translatey: ['T', cast([Opx, _, Opx]), cast([Opx, _])],
  translatez: ['L', cast([Opx, Opx, _])],
  translate3d: ['TTL', id],
};

function parseArrayTransform(transform: Transform): ParsedTransform[] {
  const result: ParsedTransform[] = [];
  const length = transform.length;

  for (let i = 0; i < length; i++) {
    const item = transform[i];
    const name = item[0];
    const args = item.slice(1);
    const functionData = transformFunctions[name];
    if (!functionData) {
      return [];
    }
    const parsedArgs = args.map(getOrCreateUnitValue);
    result.push({ t: name, d: parsedArgs });
  }

  return result;
}

/**
 * none
 * scale(1) scale(1, 2)
 * scaleX(1)
 */
export function parseTransform(
  transform: string | Transform,
): ParsedTransform[] {
  if (Array.isArray(transform)) {
    return parseArrayTransform(transform);
  }

  transform = (transform || 'none').toLowerCase().trim();
  if (transform === 'none') {
    return [];
  }
  const result: ParsedTransform[] = [];
  let match;
  let prevLastIndex = 0;
  while ((match = TRANSFORM_REGEXP.exec(transform))) {
    if (match.index !== prevLastIndex) {
      return [];
    }
    prevLastIndex = match.index + match[0].length;
    const functionName = match[1] as TransformType; // scale
    const functionData = transformFunctions[functionName]; // scale(1, 2)
    if (!functionData) {
      // invalid, eg. scale()
      return [];
    }
    const args = match[2].split(','); // 1,2
    const argTypes = functionData[0]; // Nn
    if (argTypes.length < args.length) {
      // scale(N, n)
      return [];
    }

    const parsedArgs: CSSUnitValue[] = [];
    for (let i = 0; i < argTypes.length; i++) {
      const arg = args[i];
      const type = argTypes[i];
      let parsedArg;
      if (!arg) {
        // @ts-ignore
        parsedArg = {
          a: Odeg,
          n: parsedArgs[0],
          t: Opx,
        }[type];
      } else {
        // @ts-ignore
        parsedArg = {
          A: (s: string) => {
            return s.trim() === '0' ? Odeg : parseAngle(s);
          },
          N: parseNumber,
          T: parseLengthOrPercentage,
          L: parseLength,
        }[type.toUpperCase()](arg);
      }
      if (parsedArg === undefined) {
        return [];
      }
      parsedArgs.push(parsedArg);
    }
    result.push({ t: functionName, d: parsedArgs }); // { t: scale, d: [1, 2] }

    if (TRANSFORM_REGEXP.lastIndex === transform.length) {
      return result;
    }
  }

  return [];
}
export function parseTransformUnmemoize(
  transform: string | Transform,
): ParsedTransform[] {
  if (Array.isArray(transform)) {
    return parseArrayTransform(transform);
  }

  transform = (transform || 'none').toLowerCase().trim();
  if (transform === 'none') {
    return [];
  }
  const result: ParsedTransform[] = [];
  let match;
  let prevLastIndex = 0;
  while ((match = TRANSFORM_REGEXP.exec(transform))) {
    if (match.index !== prevLastIndex) {
      return [];
    }
    prevLastIndex = match.index + match[0].length;
    const functionName = match[1] as TransformType; // scale
    const functionData = transformFunctions[functionName]; // scale(1, 2)
    if (!functionData) {
      // invalid, eg. scale()
      return [];
    }
    const args = match[2].split(','); // 1,2
    const argTypes = functionData[0]; // Nn
    if (argTypes.length < args.length) {
      // scale(N, n)
      return [];
    }

    const parsedArgs: CSSUnitValue[] = [];
    for (let i = 0; i < argTypes.length; i++) {
      const arg = args[i];
      const type = argTypes[i];
      let parsedArg;
      if (!arg) {
        // @ts-ignore
        parsedArg = {
          a: Odeg,
          n: parsedArgs[0],
          t: Opx,
        }[type];
      } else {
        // @ts-ignore
        parsedArg = {
          A: (s: string) => {
            return s.trim() === '0' ? Odeg : parseAngleUnmemoize(s);
          },
          N: parseNumberUnmemoize,
          T: parseLengthOrPercentageUnmemoize,
          L: parseLengthUnmemoize,
        }[type.toUpperCase()](arg);
      }
      if (parsedArg === undefined) {
        return [];
      }
      parsedArgs.push(parsedArg);
    }
    result.push({ t: functionName, d: parsedArgs }); // { t: scale, d: [1, 2] }

    if (TRANSFORM_REGEXP.lastIndex === transform.length) {
      return result;
    }
  }

  return [];
}

export function convertItemToMatrix(item: ParsedTransform): number[] {
  let x: number;
  let y: number;
  let z: number;
  let angle: number;
  switch (item.t) {
    case 'rotatex':
      angle = deg2rad(convertAngleUnit(item.d[0]));
      return [
        1,
        0,
        0,
        0,
        0,
        Math.cos(angle),
        Math.sin(angle),
        0,
        0,
        -Math.sin(angle),
        Math.cos(angle),
        0,
        0,
        0,
        0,
        1,
      ];
    case 'rotatey':
      angle = deg2rad(convertAngleUnit(item.d[0]));
      return [
        Math.cos(angle),
        0,
        -Math.sin(angle),
        0,
        0,
        1,
        0,
        0,
        Math.sin(angle),
        0,
        Math.cos(angle),
        0,
        0,
        0,
        0,
        1,
      ];
    case 'rotate':
    case 'rotatez':
      angle = deg2rad(convertAngleUnit(item.d[0]));
      return [
        Math.cos(angle),
        Math.sin(angle),
        0,
        0,
        -Math.sin(angle),
        Math.cos(angle),
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
      ];
    case 'rotate3d':
      x = item.d[0].value;
      y = item.d[1].value;
      z = item.d[2].value;
      angle = deg2rad(convertAngleUnit(item.d[3]));

      const sqrLength = x * x + y * y + z * z;
      if (sqrLength === 0) {
        x = 1;
        y = 0;
        z = 0;
      } else if (sqrLength !== 1) {
        const length = Math.sqrt(sqrLength);
        x /= length;
        y /= length;
        z /= length;
      }

      const s = Math.sin(angle / 2);
      const sc = s * Math.cos(angle / 2);
      const sq = s * s;
      return [
        1 - 2 * (y * y + z * z) * sq,
        2 * (x * y * sq + z * sc),
        2 * (x * z * sq - y * sc),
        0,

        2 * (x * y * sq - z * sc),
        1 - 2 * (x * x + z * z) * sq,
        2 * (y * z * sq + x * sc),
        0,

        2 * (x * z * sq + y * sc),
        2 * (y * z * sq - x * sc),
        1 - 2 * (x * x + y * y) * sq,
        0,

        0,
        0,
        0,
        1,
      ];
    case 'scale':
      return [
        item.d[0].value,
        0,
        0,
        0,
        0,
        item.d[1].value,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
      ];
    case 'scalex':
      return [item.d[0].value, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    case 'scaley':
      return [1, 0, 0, 0, 0, item.d[0].value, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    case 'scalez':
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, item.d[0].value, 0, 0, 0, 0, 1];
    case 'scale3d':
      return [
        item.d[0].value,
        0,
        0,
        0,
        0,
        item.d[1].value,
        0,
        0,
        0,
        0,
        item.d[2].value,
        0,
        0,
        0,
        0,
        1,
      ];
    case 'skew':
      const xAngle = deg2rad(convertAngleUnit(item.d[0]));
      const yAngle = deg2rad(convertAngleUnit(item.d[1]));
      return [
        1,
        Math.tan(yAngle),
        0,
        0,
        Math.tan(xAngle),
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
      ];
    case 'skewx':
      angle = deg2rad(convertAngleUnit(item.d[0]));
      return [1, 0, 0, 0, Math.tan(angle), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    case 'skewy':
      angle = deg2rad(convertAngleUnit(item.d[0]));
      return [1, Math.tan(angle), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    case 'translate':
      // TODO: pass target
      x = convertPercentUnit(item.d[0], 0, null) || 0;
      y = convertPercentUnit(item.d[1], 0, null) || 0;
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1];
    case 'translatex':
      x = convertPercentUnit(item.d[0], 0, null) || 0;
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];
    case 'translatey':
      y = convertPercentUnit(item.d[0], 0, null) || 0;
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, y, 0, 1];
    case 'translatez':
      z = convertPercentUnit(item.d[0], 0, null) || 0;
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1];
    case 'translate3d':
      x = convertPercentUnit(item.d[0], 0, null) || 0;
      y = convertPercentUnit(item.d[1], 0, null) || 0;
      z = convertPercentUnit(item.d[2], 0, null) || 0;
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
    case 'perspective':
      const t = convertPercentUnit(item.d[0], 0, null) || 0;
      const p = t ? -1 / t : 0;
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, p, 0, 0, 0, 1];
    case 'matrix':
      return [
        item.d[0].value,
        item.d[1].value,
        0,
        0,
        item.d[2].value,
        item.d[3].value,
        0,
        0,
        0,
        0,
        1,
        0,
        item.d[4].value,
        item.d[5].value,
        0,
        1,
      ];
    case 'matrix3d':
      return item.d.map((d) => d.value);
    default:
  }
}

function multiplyMatrices(a: number[], b: number[]) {
  return [
    a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
    a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
    a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
    a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],

    a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
    a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
    a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
    a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],

    a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
    a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
    a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
    a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],

    a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
    a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
    a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
    a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15],
  ];
}

function convertToMatrix(transformList: ParsedTransform[]) {
  if (transformList.length === 0) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
  return transformList.map(convertItemToMatrix).reduce(multiplyMatrices);
}

function makeMatrixDecomposition(transformList: ParsedTransform[]) {
  const translate = [0, 0, 0];
  const scale = [1, 1, 1];
  const skew = [0, 0, 0];
  const perspective = [0, 0, 0, 1];
  const quaternion = [0, 0, 0, 1];
  decomposeMat4(
    // @ts-ignore
    convertToMatrix(transformList),
    translate,
    scale,
    skew,
    perspective,
    quaternion,
  );
  return [[translate, scale, skew, quaternion, perspective]];
}

export const composeMatrix = (function () {
  function multiply(a, b) {
    const result = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += b[i][k] * a[k][j];
        }
      }
    }
    return result;
  }

  function is2D(m) {
    return (
      m[0][2] == 0 &&
      m[0][3] == 0 &&
      m[1][2] == 0 &&
      m[1][3] == 0 &&
      m[2][0] == 0 &&
      m[2][1] == 0 &&
      m[2][2] == 1 &&
      m[2][3] == 0 &&
      m[3][2] == 0 &&
      m[3][3] == 1
    );
  }

  function composeMatrix(translate, scale, skew, quat, perspective) {
    let matrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    for (let i = 0; i < 4; i++) {
      matrix[i][3] = perspective[i];
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        matrix[3][i] += translate[j] * matrix[j][i];
      }
    }

    const x = quat[0],
      y = quat[1],
      z = quat[2],
      w = quat[3];

    const rotMatrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    rotMatrix[0][0] = 1 - 2 * (y * y + z * z);
    rotMatrix[0][1] = 2 * (x * y - z * w);
    rotMatrix[0][2] = 2 * (x * z + y * w);
    rotMatrix[1][0] = 2 * (x * y + z * w);
    rotMatrix[1][1] = 1 - 2 * (x * x + z * z);
    rotMatrix[1][2] = 2 * (y * z - x * w);
    rotMatrix[2][0] = 2 * (x * z - y * w);
    rotMatrix[2][1] = 2 * (y * z + x * w);
    rotMatrix[2][2] = 1 - 2 * (x * x + y * y);

    matrix = multiply(matrix, rotMatrix);

    const temp = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    if (skew[2]) {
      temp[2][1] = skew[2];
      matrix = multiply(matrix, temp);
    }

    if (skew[1]) {
      temp[2][1] = 0;
      temp[2][0] = skew[0];
      matrix = multiply(matrix, temp);
    }

    if (skew[0]) {
      temp[2][0] = 0;
      temp[1][0] = skew[0];
      matrix = multiply(matrix, temp);
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        matrix[i][j] *= scale[i];
      }
    }

    if (is2D(matrix)) {
      return [
        matrix[0][0],
        matrix[0][1],
        matrix[1][0],
        matrix[1][1],
        matrix[3][0],
        matrix[3][1],
      ];
    }
    return matrix[0].concat(matrix[1], matrix[2], matrix[3]);
  }
  return composeMatrix;
})();

function numberToLongString(x: number) {
  return x.toFixed(6).replace('.000000', '');
}

function mergeMatrices(
  left: ParsedTransform[],
  right: ParsedTransform[],
): [number[][], number[][], () => string] {
  let leftArgs: number[][];
  let rightArgs: number[][];
  // @ts-ignore
  if (left.decompositionPair !== right) {
    // @ts-ignore
    left.decompositionPair = right;
    // @ts-ignore
    leftArgs = makeMatrixDecomposition(left);
  }
  // @ts-ignore
  if (right.decompositionPair !== left) {
    // @ts-ignore
    right.decompositionPair = left;
    // @ts-ignore
    rightArgs = makeMatrixDecomposition(right);
  }
  if (leftArgs[0] === null || rightArgs[0] === null)
    return [
      // @ts-ignore
      [false],
      // @ts-ignore
      [true],
      // @ts-ignore
      (x) => {
        return x ? right[0].d : left[0].d;
      },
    ];
  leftArgs[0].push(0);
  rightArgs[0].push(1);
  return [
    leftArgs,
    rightArgs,
    // @ts-ignore
    (list) => {
      // @ts-ignore
      const q = quat(leftArgs[0][3], rightArgs[0][3], list[5]);
      const mat = composeMatrix(list[0], list[1], list[2], q, list[4]);
      const stringifiedArgs = mat.map(numberToLongString).join(',');
      return stringifiedArgs;
    },
  ];
}

function dot(v1: number[], v2: number[]) {
  let result = 0;
  for (let i = 0; i < v1.length; i++) {
    result += v1[i] * v2[i];
  }
  return result;
}

function quat(fromQ: number[], toQ: number[], f: number): number[] {
  let product = dot(fromQ, toQ);
  product = clamp(product, -1.0, 1.0);

  let quat = [];
  if (product === 1.0) {
    quat = fromQ;
  } else {
    const theta = Math.acos(product);
    const w = (Math.sin(f * theta) * 1) / Math.sqrt(1 - product * product);

    for (let i = 0; i < 4; i++) {
      quat.push(fromQ[i] * (Math.cos(f * theta) - product * w) + toQ[i] * w);
    }
  }
  return quat;
}

// scalex/y/z -> scale
function typeTo2D(type: string) {
  return type.replace(/[xy]/, '');
}

// scalex/y/z -> scale3d
function typeTo3D(type: string) {
  return type.replace(/(x|y|z|3d)?$/, '3d');
}

const isMatrixOrPerspective = function (lt: string, rt: string) {
  return (
    (lt === 'perspective' && rt === 'perspective') ||
    ((lt === 'matrix' || lt === 'matrix3d') &&
      (rt === 'matrix' || rt === 'matrix3d'))
  );
};

export function mergeTransforms(
  left: ParsedTransform[],
  right: ParsedTransform[],
  target: DisplayObject | null,
): [number[][], number[][], (d: number[][]) => string] {
  let flipResults = false;
  // padding empty transform, eg. merge 'scale(10)' with 'none' -> scale(1)
  if (!left.length || !right.length) {
    if (!left.length) {
      flipResults = true;
      left = right;
      right = [];
    }
    for (let i = 0; i < left.length; i++) {
      const { t: type, d: args } = left[i];
      // none -> scale(1)/translateX(0)
      const defaultValue = type.substring(0, 5) === 'scale' ? 1 : 0;
      right.push({
        t: type,
        d: args.map((arg) => {
          if (typeof arg === 'number') {
            return getOrCreateUnitValue(defaultValue);
          }
          return getOrCreateUnitValue(defaultValue, arg.unit);
          //   {
          //     unit: arg.unit,
          //     value: defaultValue,
          //   };
        }),
      });
    }
  }

  let leftResult: number[][] = [];
  let rightResult: number[][] = [];
  let types: any = [];

  // merge matrix() with matrix3d()
  if (left.length !== right.length) {
    const merged = mergeMatrices(left, right);
    // @ts-ignore
    leftResult = [merged[0]];
    // @ts-ignore
    rightResult = [merged[1]];
    types = [['matrix', [merged[2]]]];
  } else {
    for (let i = 0; i < left.length; i++) {
      const leftType = left[i].t as TransformType;
      const rightType = right[i].t as TransformType;
      let leftArgs = left[i].d;
      let rightArgs = right[i].d;

      const leftFunctionData = transformFunctions[leftType];
      const rightFunctionData = transformFunctions[rightType];

      let type;
      if (isMatrixOrPerspective(leftType, rightType)) {
        const merged = mergeMatrices([left[i]], [right[i]]);
        // @ts-ignore
        leftResult.push(merged[0]);
        // @ts-ignore
        rightResult.push(merged[1]);
        types.push(['matrix', [merged[2]]]);
        continue;
      } else if (leftType === rightType) {
        type = leftType;
      } else if (
        leftFunctionData[2] &&
        rightFunctionData[2] &&
        typeTo2D(leftType) === typeTo2D(rightType)
      ) {
        type = typeTo2D(leftType);
        // @ts-ignore
        leftArgs = leftFunctionData[2](leftArgs);
        // @ts-ignore
        rightArgs = rightFunctionData[2](rightArgs);
      } else if (
        leftFunctionData[1] &&
        rightFunctionData[1] &&
        typeTo3D(leftType) === typeTo3D(rightType)
      ) {
        type = typeTo3D(leftType);
        // @ts-ignore
        leftArgs = leftFunctionData[1](leftArgs);
        // @ts-ignore
        rightArgs = rightFunctionData[1](rightArgs);
      } else {
        const merged = mergeMatrices(left, right);
        // @ts-ignore
        leftResult = [merged[0]];
        // @ts-ignore
        rightResult = [merged[1]];
        types = [['matrix', [merged[2]]]];
        break;
      }

      const leftArgsCopy = [];
      const rightArgsCopy = [];
      const stringConversions = [];
      for (let j = 0; j < leftArgs.length; j++) {
        // const merge = leftArgs[j].unit === UnitType.kNumber ? mergeDimensions : mergeDimensions;
        const merged = mergeDimensions(
          leftArgs[j],
          rightArgs[j],
          target,
          false,
          j,
        );
        leftArgsCopy[j] = merged[0];
        rightArgsCopy[j] = merged[1];
        stringConversions.push(merged[2]);
      }
      leftResult.push(leftArgsCopy);
      rightResult.push(rightArgsCopy);
      types.push([type, stringConversions]);
    }
  }

  if (flipResults) {
    const tmp = leftResult;
    leftResult = rightResult;
    rightResult = tmp;
  }

  return [
    leftResult,
    rightResult,
    (list: number[][]) => {
      return list
        .map((args, i: number) => {
          const stringifiedArgs = args
            .map((arg, j: number) => {
              return types[i][1][j](arg);
            })
            .join(',');
          if (
            types[i][0] === 'matrix' &&
            stringifiedArgs.split(',').length === 16
          ) {
            types[i][0] = 'matrix3d';
          }
          if (
            types[i][0] === 'matrix3d' &&
            stringifiedArgs.split(',').length === 6
          ) {
            types[i][0] = 'matrix';
          }
          return types[i][0] + '(' + stringifiedArgs + ')';
        })
        .join(' ');
    },
  ];
}
