const CommonUtil = require('./common');
const glMatrix = require('gl-matrix').glMatrix;
const mat3 = require('gl-matrix').mat3;
const vec3 = require('gl-matrix').vec3;
const vec2 = require('gl-matrix').vec2;

vec2.angle = function(v1, v2) {
  const theta = vec2.dot(v1, v2) / (vec2.length(v1) * vec2.length(v2));
  return Math.acos(CommonUtil.clamp(theta, -1, 1));
};
/**
 * 向量 v1 到 向量 v2 夹角的方向
 * @param  {Array} v1 向量
 * @param  {Array} v2 向量
 * @return {Boolean} >= 0 顺时针 < 0 逆时针
 */
vec2.direction = function(v1, v2) {
  return v1[0] * v2[1] - v2[0] * v1[1];
};
vec2.angleTo = function(v1, v2, direct) {
  const angle = vec2.angle(v1, v2);
  const angleLargeThanPI = vec2.direction(v1, v2) >= 0;
  if (direct) {
    if (angleLargeThanPI) {
      return Math.PI * 2 - angle;
    }

    return angle;
  }

  if (angleLargeThanPI) {
    return angle;
  }
  return Math.PI * 2 - angle;
};

mat3.translate = function(out, a, v) {
  const transMat = new glMatrix.ARRAY_TYPE(9);
  mat3.fromTranslation(transMat, v);
  return mat3.multiply(out, transMat, a);
};

mat3.rotate = function(out, a, rad) {
  const rotateMat = new glMatrix.ARRAY_TYPE(9);
  mat3.fromRotation(rotateMat, rad);
  return mat3.multiply(out, rotateMat, a);
};

mat3.scale = function(out, a, v) {
  const scaleMat = new glMatrix.ARRAY_TYPE(9);
  mat3.fromScaling(scaleMat, v);
  return mat3.multiply(out, scaleMat, a);
};

module.exports = {
  mat3,
  vec2,
  vec3
};
