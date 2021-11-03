import { mat4 } from 'gl-matrix';
import { CompareMode } from '../platform';

export const IS_DEPTH_REVERSED = true;

// This is designed for an OpenGL-style clip space, because we apply the clip space transform after...
const reverseDepthMatrix = mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

export function projectionMatrixReverseDepth(m: mat4, isDepthReversed = IS_DEPTH_REVERSED): void {
  if (isDepthReversed) mat4.mul(m, reverseDepthMatrix, m);
}

export function reverseDepthForCompareMode(
  compareMode: CompareMode,
  isDepthReversed = IS_DEPTH_REVERSED,
): CompareMode {
  if (isDepthReversed) {
    switch (compareMode) {
      case CompareMode.Less:
        return CompareMode.Greater;
      case CompareMode.LessEqual:
        return CompareMode.GreaterEqual;
      case CompareMode.GreaterEqual:
        return CompareMode.LessEqual;
      case CompareMode.Greater:
        return CompareMode.Less;
      default:
        return compareMode;
    }
  } else {
    return compareMode;
  }
}

export function reverseDepthForClearValue(n: number, isDepthReversed = IS_DEPTH_REVERSED): number {
  if (isDepthReversed) {
    return 1.0 - n;
  } else {
    return n;
  }
}

export function reverseDepthForDepthOffset(n: number, isDepthReversed = IS_DEPTH_REVERSED): number {
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
  isDepthReversed = IS_DEPTH_REVERSED,
): boolean {
  op = reverseDepthForCompareMode(op, isDepthReversed);
  if (op === CompareMode.Less) return a < b;
  else if (op === CompareMode.LessEqual) return a <= b;
  else if (op === CompareMode.Greater) return a > b;
  else if (op === CompareMode.GreaterEqual) return a >= b;
  else throw 'whoops';
}
