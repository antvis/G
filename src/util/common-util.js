import {
  isFunction,
  isObject,
  isBoolean,
  isNull,
  isUndefined,
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

module.exports = {
  isFunction,
  isObject,
  isBoolean,
  isNull(param) {
    return isNull(param) || isUndefined(param);
  },
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
};
