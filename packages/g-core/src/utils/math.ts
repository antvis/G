import { mat3, mat4, vec3 } from 'gl-matrix';

export function getRotationScale(matrix: mat4, result: mat3) {
  result[0] = matrix[0];
  result[1] = matrix[1];
  result[2] = matrix[2];
  result[3] = matrix[4];
  result[4] = matrix[5];
  result[5] = matrix[6];
  result[6] = matrix[8];
  result[7] = matrix[9];
  result[8] = matrix[10];
  return result;
}

export function createVec3(position: vec3 | number, y: number = 0, z: number = 0) {
  if (typeof position === 'number') {
    position = vec3.fromValues(position, y, z);
  }
  return position;
}
