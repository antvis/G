import { vec3, vec4 } from 'gl-matrix';
import isNumber from 'lodash-es/isNumber';

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

export function decodePickingColor(color: Uint8Array): number {
  const [i1, i2, i3] = color;
  // 1 was added to seperate from no selection
  const index = i1 + i2 * 256 + i3 * 65536 - 1;
  return index;
}

export function encodePickingColor(featureIdx: number): [number, number, number] {
  return [(featureIdx + 1) & 255, ((featureIdx + 1) >> 8) & 255, (((featureIdx + 1) >> 8) >> 8) & 255];
}
