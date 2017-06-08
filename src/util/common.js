import {
  isFunction,
  isObject,
  isBoolean,
  isNil,
  isString,
  isArray,
  isEmpty,
  uniqueId,
  clone,
  assign,
  merge,
  upperFirst,
  pull,
  forEach,
  toArray,
} from 'lodash';

const PRECISION = 0.00001; // 常量，据的精度，小于这个精度认为是0
const RADIAN = Math.PI / 180;
const DEGREE = 180 / Math.PI;

module.exports = {
  isFunction,
  isObject,
  isBoolean,
  isNil,
  isString,
  isArray,
  isEmpty, // isBlank
  uniqueId,
  clone,
  assign, // simpleMix
  merge, // mix
  upperFirst, // ucfirst
  remove: pull,
  each: forEach,
  extend(subclass, superclass, overrides, staticOverrides) {
    //如果只提供父类构造函数，则自动生成子类构造函数
    if (!isFunction(superclass)) {
      overrides = superclass;
      superclass = subclass;
      subclass = function() {};
    }

    const create = Object.create ?
      function(proto, c) {
        return Object.create(proto, {
          constructor: {
            value: c
          }
        });
      } :
      function(proto, c) {
        function F() {}

        F.prototype = proto;
        const o = new F();
        o.constructor = c;
        return o;
      };

    const superObj = create(superclass.prototype, subclass); //new superclass(),//实例化父类作为子类的prototype
    subclass.prototype = merge(superObj, subclass.prototype); //指定子类的prototype
    subclass.superclass = create(superclass.prototype, superclass);
    merge(superObj, overrides);
    merge(subclass, staticOverrides);
    return subclass;
  },
  augment(c) {
    const args = toArray(arguments);
    for (let i = 1; i < args.length; i++) {
      let obj = args[i];
      if (isFunction(obj)) {
        obj = obj.prototype;
      }
      merge(c.prototype, obj);
    }
  },
  /**
   * 判断两个数是否相等
   * @param {Number} a 数
   * @param {Number} b 数
   * @return {Boolean} 是否相等
   **/
  isNumberEqual(a, b) {
    return Math.abs((a - b)) < PRECISION;
  },
  /**
   * 获取角度对应的弧度
   * @param {Number} degree 角度
   * @return {Number} 弧度
   **/
  toRadian(degree) {
    return RADIAN * degree;
  },
  /**
   * 获取弧度对应的角度
   * @param {Number} rad 弧度
   * @return {Number} 角度
   **/
  toDegree(radian) {
    return DEGREE * radian;
  },
  /**
   * 广义取模运算
   * @param {Number} v 被取模的值
   * @param {Number} m 模
   */
  mod(n, m) {
    return ( ( n % m ) + m ) % m;
  }
};
