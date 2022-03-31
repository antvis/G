import type { vec4 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import { isNumber } from '@antv/util';

export function getAngle(angle: number | undefined) {
  if (angle === undefined) {
    return 0;
  } else if (angle > 360 || angle < -360) {
    return angle % 360;
  }
  return angle;
}

export function createVec3(x: number | vec3 | vec4, y?: number, z?: number) {
  if (isNumber(x)) {
    return vec3.fromValues(x, y as number, z as number);
  }

  if ((x as vec3).length === 3) {
    return vec3.clone(x as vec3);
  }

  return vec3.fromValues(x[0], x[1], x[2]);
}
