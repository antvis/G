import { uniq } from '@antv/util';
import { parseAngle, parseLength, parseLengthOrPercent, mergeDimensions } from './dimension';
import { parseNumber, mergeNumbers } from './numeric';
// import { makeMatrixDecomposition, quat, composeMatrix } from '../utils/matrix-decompose';
import type { DisplayObject } from '../display-objects/DisplayObject';
import type { ParsedElement } from './dimension';

// eg. { t: 'scale', d: [1, 2] }
interface ParsedTransform {
  t: string;
  d: (number | ParsedElement)[];
}

type TransformType =
  // 'matrix' | 'matrix3d' |
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
type PatternElement = string | number | null | ParsedElement;
type CastFunction =
  | ((string: string) => string)
  | ((contents: (number | PatternElement)[]) => PatternElement[]);

const _ = null;
const Opx: ParsedElement = { unit: 'px', value: 0 };
const Odeg: ParsedElement = { unit: 'deg', value: 0 };

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
  // matrix: ['NNNNNN', [_, _, 0, 0, _, _, 0, 0, 0, 0, 1, 0, _, _, 0, 1], id],
  // matrix3d: ['NNNNNNNNNNNNNNNN', id],
  rotate: ['A'],
  rotatex: ['A'],
  rotatey: ['A'],
  rotatez: ['A'],
  rotate3d: ['NNNA'],
  // perspective: ['L'],
  scale: ['Nn', cast([_, _, 1]), id],
  scalex: ['N', cast([_, 1, 1]), cast([_, 1])],
  scaley: ['N', cast([1, _, 1]), cast([1, _])],
  scalez: ['N', cast([1, 1, _])],
  scale3d: ['NNN', id],
  // skew: ['Aa', null, id],
  // skewx: ['A', null, cast([_, Odeg])],
  // skewy: ['A', null, cast([Odeg, _])],
  translate: ['Tt', cast([_, _, Opx]), id],
  translatex: ['T', cast([_, Opx, Opx]), cast([_, Opx])],
  translatey: ['T', cast([Opx, _, Opx]), cast([Opx, _])],
  translatez: ['L', cast([Opx, Opx, _])],
  translate3d: ['TTL', id],
};

/**
 * none
 * scale(1) scale(1, 2)
 * scaleX(1)
 */
export function parseTransform(string: string): ParsedTransform[] {
  string = string.toLowerCase().trim();
  if (string === 'none') {
    return [];
  }
  const transformRegExp = /\s*(\w+)\(([^)]*)\)/g;
  const result: ParsedTransform[] = [];
  let match;
  let prevLastIndex = 0;
  while ((match = transformRegExp.exec(string))) {
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

    const parsedArgs: ParsedElement[] = [];
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
          T: parseLengthOrPercent,
          L: parseLength,
        }[type.toUpperCase()](arg);
      }
      if (parsedArg === undefined) {
        return [];
      }
      parsedArgs.push(parsedArg);
    }
    result.push({ t: functionName, d: parsedArgs }); // { t: scale, d: [1, 2] }

    if (transformRegExp.lastIndex === string.length) {
      return result;
    }
  }

  return [];
}

// function mergeMatrices(left: number[][], right: number[][]): [
//   number[][], number[][], () => string,
// ] {
//   if (left.decompositionPair !== right) {
//     left.decompositionPair = right;
//     var leftArgs = makeMatrixDecomposition(left);
//   }
//   if (right.decompositionPair !== left) {
//     right.decompositionPair = left;
//     var rightArgs = makeMatrixDecomposition(right);
//   }
//   if (leftArgs[0] === null || rightArgs[0] === null)
//     return [[false], [true], (x) => { return x ? right[0].d : left[0].d; }];
//   leftArgs[0].push(0);
//   rightArgs[0].push(1);
//   return [
//     leftArgs,
//     rightArgs,
//     (list) => {
//       const q = quat(leftArgs[0][3], rightArgs[0][3], list[5]);
//       const mat = composeMatrix(list[0], list[1], list[2], q, list[4]);
//       const stringifiedArgs = mat.map(numberToLongString).join(',');
//       return stringifiedArgs;
//     }
//   ];
// }

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
    ((lt === 'matrix' || lt === 'matrix3d') && (rt === 'matrix' || rt === 'matrix3d'))
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
      const defaultValue = type.substr(0, 5) === 'scale' ? 1 : 0;
      right.push({
        t: type,
        d: args.map((arg) => {
          if (typeof arg === 'number') {
            return defaultValue;
          }
          return {
            unit: arg.unit,
            value: defaultValue,
          };
        }),
      });
    }
  }

  let leftResult: number[][] = [];
  let rightResult: number[][] = [];
  const types: any = [];

  // merge matrix() with matrix3d()
  if (left.length !== right.length) {
    // const merged = mergeMatrices(left, right);
    // leftResult = [merged[0]];
    // rightResult = [merged[1]];
    // types = [['matrix', [merged[2]]]];
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
        // const merged = mergeMatrices([left[i]], [right[i]]);
        // leftResult.push(merged[0]);
        // rightResult.push(merged[1]);
        // types.push(['matrix', [merged[2]]]);
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
        // const merged = mergeMatrices(left, right);
        // leftResult = [merged[0]];
        // rightResult = [merged[1]];
        // types = [['matrix', [merged[2]]]];
        break;
      }

      const leftArgsCopy = [];
      const rightArgsCopy = [];
      const stringConversions = [];
      for (let j = 0; j < leftArgs.length; j++) {
        const merge = typeof leftArgs[j] === 'number' ? mergeNumbers : mergeDimensions;
        // @ts-ignore
        const merged = merge(leftArgs[j], rightArgs[j], false, target, j);
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
          if (types[i][0] === 'matrix' && stringifiedArgs.split(',').length === 16)
            types[i][0] = 'matrix3d';
          return types[i][0] + '(' + stringifiedArgs + ')';
        })
        .join(' ');
    },
  ];
}

/**
 * @see /zh/docs/api/animation#支持变换的属性
 *
 * support the following formats like CSS Transform:
 *
 * scale
 * * scale(x, y)
 * * scaleX(x)
 * * scaleY(x)
 * * scaleZ(z)
 * * scale3d(x, y, z)
 *
 * translate (unit: none, px, %(relative to its bounds))
 * * translate(x, y) eg. translate(0, 0) translate(0, 30px) translate(100%, 100%)
 * * translateX(0)
 * * translateY(0)
 * * translateZ(0)
 * * translate3d(0, 0, 0)
 *
 * rotate (unit: deg rad turn)
 * * rotate(0.5turn) rotate(30deg) rotate(1rad)
 *
 * none
 *
 * unsupported for now:
 * * calc() eg. translate(calc(100% + 10px))
 * * matrix/matrix3d()
 * * skew/skewX/skewY
 * * perspective
 */
export function updateTransform(
  oldValue: ParsedTransform[],
  newValue: ParsedTransform[],
  object: DisplayObject,
) {
  const uniqTypes = uniq([
    ...(oldValue || []).map(({ t }) => t),
    ...(newValue || []).map(({ t }) => t),
  ]);
  uniqTypes.forEach((t) => {
    const value = (newValue || []).find((o) => o.t === t);
    const old = (oldValue || []).find((o) => o.t === t);
    if (t === 'scale') {
      // scale(1) scale(1, 1)
      const newScale = (value && (value.d as number[])) || [1, 1];
      const oldScale = (old && (old.d as number[])) || [1, 1];
      object.scaleLocal(newScale[0] / oldScale[0], newScale[1] / oldScale[1], 1);
    } else if (t === 'scalex') {
      const newScale = (value && (value.d as number[])) || [1];
      const oldScale = (old && (old.d as number[])) || [1];
      object.scaleLocal(newScale[0] / oldScale[0], 1, 1);
    } else if (t === 'scaley') {
      const newScale = (value && (value.d as number[])) || [1];
      const oldScale = (old && (old.d as number[])) || [1];
      object.scaleLocal(1, newScale[0] / oldScale[0], 1);
    } else if (t === 'scalez') {
      const newScale = (value && (value.d as number[])) || [1];
      const oldScale = (old && (old.d as number[])) || [1];
      object.scaleLocal(1, 1, newScale[0] / oldScale[0]);
    } else if (t === 'scale3d') {
      const newScale = (value && (value.d as number[])) || [1, 1, 1];
      const oldScale = (old && (old.d as number[])) || [1, 1, 1];
      object.scaleLocal(
        newScale[0] / oldScale[0],
        newScale[1] / oldScale[1],
        newScale[2] / oldScale[2],
      );
    } else if (t === 'translate') {
      const newTranslation = (value && (value.d as ParsedElement[])) || [Opx, Opx];
      const oldTranslation = (old && (old.d as ParsedElement[])) || [Opx, Opx];
      object.translateLocal(
        newTranslation[0].value - oldTranslation[0].value,
        newTranslation[1].value - oldTranslation[1].value,
        0,
      );
    } else if (t === 'translatex') {
      const newTranslation = (value && (value.d as ParsedElement[])) || [Opx];
      const oldTranslation = (old && (old.d as ParsedElement[])) || [Opx];
      object.translateLocal(newTranslation[0].value - oldTranslation[0].value, 0, 0);
    } else if (t === 'translatey') {
      const newTranslation = (value && (value.d as ParsedElement[])) || [Opx];
      const oldTranslation = (old && (old.d as ParsedElement[])) || [Opx];
      object.translateLocal(0, newTranslation[0].value - oldTranslation[0].value, 0);
    } else if (t === 'translatez') {
      const newTranslation = (value && (value.d as ParsedElement[])) || [Opx];
      const oldTranslation = (old && (old.d as ParsedElement[])) || [Opx];
      object.translateLocal(0, 0, newTranslation[0].value - oldTranslation[0].value);
    } else if (t === 'translate3d') {
      const newTranslation = (value && (value.d as ParsedElement[])) || [Opx, Opx, Opx];
      const oldTranslation = (old && (old.d as ParsedElement[])) || [Opx, Opx, Opx];
      object.translateLocal(
        newTranslation[0].value - oldTranslation[0].value,
        newTranslation[1].value - oldTranslation[1].value,
        newTranslation[2].value - oldTranslation[2].value,
      );
    } else if (t === 'rotate') {
      const newAngles = (value && (value.d as ParsedElement[])) || [Odeg];
      const oldAngles = (old && (old.d as ParsedElement[])) || [Odeg];
      object.rotateLocal(0, 0, newAngles[0].value - oldAngles[0].value);
    } else if (t === 'rotatex') {
      const newAngles = (value && (value.d as ParsedElement[])) || [Odeg];
      const oldAngles = (old && (old.d as ParsedElement[])) || [Odeg];
      object.rotateLocal(newAngles[0].value - oldAngles[0].value, 0, 0);
    } else if (t === 'rotatey') {
      const newAngles = (value && (value.d as ParsedElement[])) || [Odeg];
      const oldAngles = (old && (old.d as ParsedElement[])) || [Odeg];
      object.rotateLocal(0, newAngles[0].value - oldAngles[0].value, 0);
    } else if (t === 'rotatez') {
      const newAngles = (value && (value.d as ParsedElement[])) || [Odeg];
      const oldAngles = (old && (old.d as ParsedElement[])) || [Odeg];
      object.rotateLocal(0, 0, newAngles[0].value - oldAngles[0].value);
    } else if (t === 'rotate3d') {
      // 暂不支持绕指定轴旋转
      // const newAngles = value && value.d as ParsedElement[] || [Odeg, Odeg, Odeg];
      // const oldAngles = old && old.d as ParsedElement[] || [Odeg, Odeg, Odeg];
      // object.rotateLocal(
      //   newAngles[0].value - oldAngles[0].value,
      //   newAngles[1].value - oldAngles[1].value,
      //   newAngles[2].value - oldAngles[2].value,
      // );
    }
  });
}
