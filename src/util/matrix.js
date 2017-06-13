const CommonUtil = require('./common');
const mat3 = require('gl-matrix').mat3;
const vec3 = require('gl-matrix').vec3;
const vec2 = require('gl-matrix').vec2;

vec2.create = function() {
  const out = new Array(2);
  out[0] = 0;
  out[1] = 0;
  return out;
};

vec2.fromValues = function(x, y) {
  const out = new Array(2);
  out[0] = x;
  out[1] = y;
  return out;
};

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

vec3.fromValues = function(x, y, z) {
  const out = new Array(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
};

vec3.create = function() {
  const out = new Array(3);
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
};

mat3.create = function() {
  const out = new Array(9);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
};

mat3.fromValues = function(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  const out = new Array(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
};

mat3.translate = function(out, a, v) {
  const transMat = new Array(9);
  mat3.fromTranslation(transMat, v);
  return mat3.multiply(out, transMat, a);
};

mat3.rotate = function(out, a, rad) {
  const rotateMat = new Array(9);
  mat3.fromRotation(rotateMat, rad);
  return mat3.multiply(out, rotateMat, a);
};

mat3.scale = function(out, a, v) {
  const scaleMat = new Array(9);
  mat3.fromScaling(scaleMat, v);
  return mat3.multiply(out, scaleMat, a);
};

module.exports = {
  mat3,
  vec2,
  vec3
};
