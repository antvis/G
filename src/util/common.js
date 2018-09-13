const Util = require('@antv/util/lib');

module.exports = {
  isFunction: Util.isFunction,
  isObject: Util.isObject,
  isBoolean: Util.isBoolean,
  isNil: Util.isNil,
  isString: Util.isString,
  isArray: Util.isArray,
  isNumber: Util.isNumber,
  isEmpty: Util.isEmpty, // isBlank
  uniqueId: Util.uniqueId,
  clone: Util.clone,
  deepMix: Util.deepMix,
  assign: Util.mix, // simpleMix
  merge: Util.deepMix, // mix
  upperFirst: Util.upperFirst, // ucfirst
  each: Util.each,
  isEqual: Util.isEqual,
  toArray: Util.toArray,
  extend: Util.extend,
  augment: Util.augment,
  remove: Util.arrayUtil.pull,
  isNumberEqual: Util.isNumberEqual,
  toRadian: Util.toRadian,
  toDegree: Util.toDegree,
  mod: Util.mod,
  clamp: Util.clamp,
  createDom: Util.createDom,
  modifyCSS: Util.modifyCSS,
  requestAnimationFrame: Util.requestAnimationFrame,
  getRatio: function getRatio() {
    return window.devicePixelRatio ? window.devicePixelRatio : 2;
  },
  mat3: Util.mat3,
  vec2: Util.vec2,
  vec3: Util.vec3,
  transform: Util.transform
};
