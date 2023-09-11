import type { mat4 } from 'gl-matrix';
import { CompareMode } from '../interfaces';

/**
 * @see https://forum.babylonjs.com/t/reverse-depth-buffer-z-buffer/6905/2
 */
export const IsDepthReversed = true;

export function reverseDepthForPerspectiveProjectionMatrix(
  m: mat4,
  isDepthReversed = IsDepthReversed,
): void {
  if (isDepthReversed) {
    m[10] = -m[10];
    m[14] = -m[14];
  }
}

export function reverseDepthForOrthographicProjectionMatrix(
  m: mat4,
  isDepthReversed = IsDepthReversed,
): void {
  if (isDepthReversed) {
    m[10] = -m[10];
    m[14] = -m[14] + 1;
  }
}

export function reverseDepthForCompareMode(
  compareMode: CompareMode,
  isDepthReversed = IsDepthReversed,
): CompareMode {
  if (isDepthReversed) {
    switch (compareMode) {
      case CompareMode.LESS:
        return CompareMode.GREATER;
      case CompareMode.LEQUAL:
        return CompareMode.GEQUAL;
      case CompareMode.GEQUAL:
        return CompareMode.LEQUAL;
      case CompareMode.GREATER:
        return CompareMode.LESS;
      default:
        return compareMode;
    }
  } else {
    return compareMode;
  }
}

export function reverseDepthForClearValue(
  n: number,
  isDepthReversed = IsDepthReversed,
): number {
  if (isDepthReversed) {
    return 1.0 - n;
  } else {
    return n;
  }
}

export function reverseDepthForDepthOffset(
  n: number,
  isDepthReversed = IsDepthReversed,
): number {
  if (isDepthReversed) {
    return -n;
  } else {
    return n;
  }
}

export function compareDepthValues(
  a: number,
  b: number,
  op: CompareMode,
  isDepthReversed = IsDepthReversed,
): boolean {
  op = reverseDepthForCompareMode(op, isDepthReversed);
  if (op === CompareMode.LESS) return a < b;
  else if (op === CompareMode.LEQUAL) return a <= b;
  else if (op === CompareMode.GREATER) return a > b;
  else if (op === CompareMode.GEQUAL) return a >= b;
  else throw new Error('whoops');
}
