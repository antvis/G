(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.G = factory());
}(this, (function () { 'use strict';

/**
 * @fileOverview 基础工具类
 * @author hankaiai@126.com
 * @author dxq613@gmail.com
 */

var objectPrototype = Object.prototype;
var toString = objectPrototype.toString;


var MAX_LEVEL = 5;

function deepMix(dst, src, level) {
  level = level || 0;
  for (var k in src) {
    if (src.hasOwnProperty(k)) {
      var value = src[k];
      if (value !== null && Util.isObject(value)) {
        if (!Util.isObject(dst[k])) {
          dst[k] = {};
        }
        if (level < MAX_LEVEL) {
          deepMix(dst[k], src[k], level + 1);
        } else {
          dst[k] = src[k];
        }
      } else if (Util.isArray(value)) {
        //if(!Util.isArray(dst[k])){
        dst[k] = [];
        //}
        dst[k] = dst[k].concat(value);
      } else if (value !== undefined) {
        dst[k] = src[k];
      }
    }
  }
}

/**
 * @class Util
 * @singleton
 * 绘图的工具类
 */
var Util = {

  /**
   * 替换字符串中的字段.
   * @param {String} str 模版字符串
   * @param {Object} o json data
   * @param {RegExp} [regexp] 匹配字符串的正则表达式
   */

  substitute: function(str, o) {
    if (!str || !o) {
      return str;
    }
    return str.replace(/\\?\{([^{}]+)\}/g, function(match, name) {
      if (match.charAt(0) === '\\') {
        return match.slice(1);
      }
      return (o[name] === undefined) ? '' : o[name];
    });
  },
  /**
   * 使第一个字母变成大写
   * @param  {String} s 字符串
   * @return {String} 首字母大写后的字符串
   */
  ucfirst: function(s) {
    s += '';
    return s.charAt(0).toUpperCase() + s.substring(1);
  },
  /**
   * 判断是否是字符串
   * @return {Boolean} 是否是字符串
   */
  isString: function(value) {
    return typeof value === 'string';
  },
  /**
   * 判断是否数字
   * @return {Boolean} 是否数字
   */
  isNumber: function(value) {
    return typeof value === 'number';
  },
  /**
   * 判断是否数字或者数字字符串，由于$.isNumberic方法会把 '123'认为数字
   * @return {Boolean} 是否数字
   */
  isNumeric: function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  /**
   * 是否是布尔类型
   *
   * @param {Object} value 测试的值
   * @return {Boolean}
   */
  isBoolean: function(value) {
    return typeof value === 'boolean';
  },
  /**
   * 是否为函数
   * @param  {*} fn 对象
   * @return {Boolean}  是否函数
   */
  isFunction: function(fn) {
    return typeof(fn) === 'function';
  },
  /**
   * 是否数组
   * @method
   * @param  {*}  obj 是否数组
   * @return {Boolean}  是否数组
   */
  isArray: ('isArray' in Array) ? Array.isArray : function(value) {
    return toString.call(value) === '[object Array]';
  },

  /**
   * 是否日期
   * @param  {*}  value 对象
   * @return {Boolean}  是否日期
   */
  isDate: function(value) {
    return toString.call(value) === '[object Date]';
  },
  /**
   * 对象是否为空
   * @param  {*}  o 对象
   * @return {Boolean}  是否不存在
   */
  isNull: function(o) {
    return o === undefined || o === null;
  },
  /**
   * 对象是否为空
   * @param {*} o 对象
   * @return {Boolean} 是否存在
   */
  notNull: function(o) {
    return !Util.isNull(o);
  },
  /**
   * 对象或数组是否为没有元素的空的
   *
   */
  isBlank: function(o) {
    if (Util.isArray(o)) {
      return o.length === 0;
    }

    if (Util.isObject(o)) {
      var n = 0;
      Util.each(o, function(key, value) {
        n++;
      });
      return n === 0;
    }

    return false;
  },
  /**
   * 是否是javascript对象
   * @param {Object} value The value to test
   * @return {Boolean}
   * @method
   */
  isObject: (toString.call(null) === '[object Object]') ?
    function(value) {
      // check ownerDocument here as well to exclude DOM nodes
      return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
    } : function(value) {
      return toString.call(value) === '[object Object]';
    },
  /**
   * 实现类的继承，通过父类生成子类
   * @param  {Function} subclass
   * @param  {Function} superclass 父类构造函数
   * @param  {Object} overrides  子类的属性或者方法
   * @return {Function} 返回的子类构造函数
   * 示例:
   *      @example
   *      //父类
   *      function base(){
   *
   *      }
   *
   *      function sub(){
   *
   *      }
   *      //子类
   *      Util.extend(sub,base,{
   *          method : function(){
   *
   *          }
   *      });
   *
   *      //或者
   *      var sub = Util.extend(base,{});
   */
  extend: function(subclass, superclass, overrides, staticOverrides) {
    //如果只提供父类构造函数，则自动生成子类构造函数
    if (!Util.isFunction(superclass)) {
      overrides = superclass;
      superclass = subclass;
      subclass = function() {};
    }

    var create = Object.create ?
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

        var o = new F();
        o.constructor = c;
        return o;
      };

    var superObj = create(superclass.prototype, subclass); //new superclass(),//实例化父类作为子类的prototype
    subclass.prototype = Util.mix(superObj, subclass.prototype); //指定子类的prototype
    subclass.superclass = create(superclass.prototype, superclass);
    Util.mix(superObj, overrides);
    Util.mix(subclass, staticOverrides);
    return subclass;
  },
  /**
   * 复制到原型链上
   * @param  {Function} c   类
   * @param  {Object} obj 对象
   */
  augment: function(c) {

    var args = Util.toArray(arguments);
    for (var i = 1; i < args.length; i++) {
      var obj = args[i];
      if (Util.isFunction(obj)) {
        obj = obj.prototype;
      }
      Util.mix(c.prototype, obj);
    }
  },
  /**
   * 转换成数组
   * @param  {*} value 需要转换的对象
   * @return {Array}  数组
   */
  toArray: function(value) {
    if (!value || !value.length) {
      return [];
    }
    return Array.prototype.slice.call(value);
  },
  /**
   * 合并数据
   * @return {Object} 将数据合并到第一个
   */
  mix: function() {
    var args = Util.toArray(arguments),
      obj = args[0];
    if (obj === true) {
      obj = args[1];
      for (var i = 2; i < args.length; i++) {
        var source = args[i];
        deepMix(obj, source);
      }
    } else {
      for (var i = 1; i < args.length; i++) {
        var source = args[i];
        for (var k in source) {
          if (source.hasOwnProperty(k) && k !== 'constructor') {
            obj[k] = source[k];
          }
        }
      }
    }
    return obj;
  },

  /**
   * 遍历数组或者对象
   * @param {Object|Array} element/Object 数组中的元素或者对象的值
   * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){}
   */
  each: function(elements, func) {
    if (!elements) {
      return;
    }
    if (Util.isObject(elements)) {
      for (var k in elements) {
        if (elements.hasOwnProperty(k)) {
          var rst = func(elements[k], k);
          if (rst === false) {
            break;
          }
        }
      }
    } else if (elements.length) {
      for (var i = 0; i < elements.length; i++) {
        var rst = func(elements[i], i);
        if (rst === false) {
          break;
        }
      }
    }
  },
  requestAnimationFrame: function(fn) {
    var method = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) {
      return setTimeout(fn, 16);
    };

    return method(fn);
  },
  cancelAnimationFrame: function(id) {
    var method = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || function(id) {
      return clearTimeout(id);
    };
    return method(id);
  }
};


var util$2 = Util;

var index$6 = util$2;

//将数值逼近到指定的数
function tryFixed(v, base) {
  var str = base.toString();
  var index = str.indexOf('.');
  if (index === -1) {
    return Math.round(v);
  }
  var length = str.substr(index + 1).length;
  if (length > 20) {
    length = 20;
  }
  return parseFloat(v.toFixed(length));
}

function _mix(dist, obj) {
  for (var k in obj) {
    if (obj.hasOwnProperty(k) && k !== 'constructor' && obj[k] !== undefined) {
      dist[k] = obj[k];
    }
  }
}


/**
 * @class Util
 * @singleton
 * 绘图的工具类
 */
index$6.mix(index$6, {

  mixin: function(c, mixins) {
    if (c && mixins) {
      c._mixins = mixins;
      c.ATTRS = c.ATTRS || {};
      var temp = {};
      index$6.each(mixins, function(mixin) {
        index$6.augment(c, mixin);
        var attrs = mixin.ATTRS;
        if (attrs) {
          index$6.mix(temp, attrs);
        }
      });

      c.ATTRS = index$6.mix(temp, c.ATTRS);
    }
  },
  /**
   * map 数组
   * @param  {Array} arr 数组
   * @return {Array} map后的数组
   */
  map: function(arr, func) {
    var result = [];
    index$6.each(arr, function(value, index) {
      result.push(func(value, index));
    });
    return result;
  },
  /**
   * 过滤数组
   * @param {Object|Array} element/Object 数组中的元素或者对象的值
   * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){},如果返回true则添加到结果集
   * @return {Array} 过滤的结果集
   */
  filter: function(array, func) {
    var result = [];
    index$6.each(array, function(value, index) {
      if (func(value, index)) {
        result.push(value);
      }
    });
    return result;
  },
  /**
   * 生成唯一的Id
   * @method
   * @param {String} prefix 前缀
   * @return {String} 唯一的编号
   */
  guid: (function() {
    var map = {};
    return function(prefix) {
      prefix = prefix || 'g';
      if (!map[prefix]) {
        map[prefix] = 1;
      } else {
        map[prefix] += 1;
      }
      return prefix + map[prefix];
    };
  })(),
  /**
   * 数组中是否存在元素
   * @param  {Array} arr 数组
   * @param  {*} obj 查找的元素
   * @return {Boolean} 是否存在
   */
  inArray: function(arr, value) {
    return index$6.indexOf(arr, value) !== -1;
  },
  /**
   * 查找元素在数组中的位置，如果不存在则返回-1
   * @param  {Array} arr 数组
   * @param  {*} obj 查找的元素
   * @return {Number} 位置
   */
  indexOf: function(arr, obj) {
    var m = Array.prototype.indexOf;
    if (m) {
      return m.call(arr, obj);
    }
    var index = -1;

    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === obj) {
        index = i;
        break;
      }
    }
    return index;
  },
  /**
   * 删除
   */
  remove: function(arr, obj) {
    var index = index$6.indexOf(arr, obj);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  },
  /**
   * 清空
   * @param  {Array} array 数组
   */
  empty: function(array) {
    if (!(array instanceof(Array))) {
      for (var i = array.length - 1; i >= 0; i--) {
        delete array[i];
      }
    }
    array.length = 0;
  },
  /**
   * 2个数组是否等同
   * @param  {Array} a1 数组1
   * @param  {Array} a2 数组2
   * @return {Boolean} 2个数组相等或者内部元素是否相等
   */
  equalsArray: function(a1, a2) {
    if (a1 === a2) {
      return true;
    }
    if (!a1 || !a2) {
      return false;
    }

    if (a1.length !== a2.length) {
      return false;
    }
    var rst = true;
    for (var i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) {
        rst = false;
        break;
      }
    }
    return rst;
  },
  /**
   * 封装事件，便于使用上下文this,和便于解除事件时使用
   * @protected
   * @param  {Object} self   对象
   * @param  {String} action 事件名称
   */
  wrapBehavior: function(self, action) {
    var method = function(e) {
      self[action](e);
    };
    self['_wrap_' + action] = method;
    return method;
  },
  /**
   * 获取封装的事件
   * @protected
   * @param  {Object} self   对象
   * @param  {String} action 事件名称
   */
  getWrapBehavior: function(self, action) {
    return self['_wrap_' + action];
  },
  /**
   * 将value的小数位长度和base保持一致
   * @param  {Number} value 值
   * @param  {Number} base  基准值
   * @return {Number}  fixed后的数字
   */
  fixedBase: function(value, base) {
    return tryFixed(value, base);
  },
  /**
   * 返回集合对象的长度，如果是数组则返回数组的长度，如果是对象则返回对象中的属性个数
   * @param {Array or Object} set 集合对象
   * @return {Number} 集合对象的长度
   */
  length: function(set) {
    if (index$6.isArray(set)) {
      return set.length;
    }
    if (index$6.isObject(set)) {
      var length = 0;
      index$6.each(set, function() {
        length++;
      });
      return length;
    }
    return 0;
  },
  clone: function(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    var rst;
    if (index$6.isArray(obj)) {
      rst = [];
      for (var i = 0, l = obj.length; i < l; i++) {
        if (typeof obj[i] === 'object' && obj[i] != null) {
          rst[i] = index$6.clone(obj[i]);
        } else {
          rst[i] = obj[i];
        }
      }
    } else {
      rst = {};
      for (var k in obj) {
        if (typeof obj[k] === 'object' && obj[k] != null) {
          rst[k] = index$6.clone(obj[k]);
        } else {
          rst[k] = obj[k];
        }
      }
    }

    return rst;
  },
  simpleMix: function(dist, obj1, obj2, obj3) {
    if (obj1) {
      _mix(dist, obj1);
    }

    if (obj2) {
      _mix(dist, obj2);
    }

    if (obj3) {
      _mix(dist, obj3);
    }
    return dist;
  }
});

var util = index$6;

var index$4 = util;

/*
 * Paths
 */

var spaces = "\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029";
var pathCommand = new RegExp("([a-z])[" + spaces + ",]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[" + spaces + "]*,?[" + spaces + "]*)+)", "ig");
var pathValues = new RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[" + spaces + "]*,?[" + spaces + "]*", "ig");

// Parses given path string into an array of arrays of path segments
var parsePathString = function(pathString) {
  if (!pathString) {
    return null;
  }

  if (typeof pathString === typeof []) {
    return pathString;
  } else {
    var paramCounts = {
        a: 7,
        c: 6,
        o: 2,
        h: 1,
        l: 2,
        m: 2,
        r: 4,
        q: 4,
        s: 4,
        t: 2,
        v: 1,
        u: 3,
        z: 0
      },
      data = [];

    String(pathString).replace(pathCommand, function(a, b, c) {
      var params = [],
        name = b.toLowerCase();
      c.replace(pathValues, function(a, b) {
        b && params.push(+b);
      });
      if (name == "m" && params.length > 2) {
        data.push([b].concat(params.splice(0, 2)));
        name = "l";
        b = b == "m" ? "l" : "L";
      }
      if (name == "o" && params.length == 1) {
        data.push([b, params[0]]);
      }
      if (name == "r") {
        data.push([b].concat(params));
      } else
        while (params.length >= paramCounts[name]) {
          data.push([b].concat(params.splice(0, paramCounts[name])));
          if (!paramCounts[name]) {
            break;
          }
        }
    });

    return data;
  }
};


// http://schepers.cc/getting-to-the-point
var catmullRom2bezier = function(crp, z) {
  var d = [];
  for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
    var p = [{
      x: +crp[i - 2],
      y: +crp[i - 1]
    }, {
      x: +crp[i],
      y: +crp[i + 1]
    }, {
      x: +crp[i + 2],
      y: +crp[i + 3]
    }, {
      x: +crp[i + 4],
      y: +crp[i + 5]
    }];
    if (z) {
      if (!i) {
        p[0] = {
          x: +crp[iLen - 2],
          y: +crp[iLen - 1]
        };
      } else if (iLen - 4 == i) {
        p[3] = {
          x: +crp[0],
          y: +crp[1]
        };
      } else if (iLen - 2 == i) {
        p[2] = {
          x: +crp[0],
          y: +crp[1]
        };
        p[3] = {
          x: +crp[2],
          y: +crp[3]
        };
      }
    } else {
      if (iLen - 4 == i) {
        p[3] = p[2];
      } else if (!i) {
        p[0] = {
          x: +crp[i],
          y: +crp[i + 1]
        };
      }
    }
    d.push(["C",
      (-p[0].x + 6 * p[1].x + p[2].x) / 6,
      (-p[0].y + 6 * p[1].y + p[2].y) / 6,
      (p[1].x + 6 * p[2].x - p[3].x) / 6,
      (p[1].y + 6 * p[2].y - p[3].y) / 6,
      p[2].x,
      p[2].y
    ]);
  }

  return d;

};

var ellipsePath = function(x, y, rx, ry, a) {
  if (a == null && ry == null) {
    ry = rx;
  }
  x = +x;
  y = +y;
  rx = +rx;
  ry = +ry;
  if (a != null) {
    var rad = Math.PI / 180,
      x1 = x + rx * Math.cos(-ry * rad),
      x2 = x + rx * Math.cos(-a * rad),
      y1 = y + rx * Math.sin(-ry * rad),
      y2 = y + rx * Math.sin(-a * rad),
      res = [
        ["M", x1, y1],
        ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]
      ];
  } else {
    res = [
      ["M", x, y],
      ["m", 0, -ry],
      ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
      ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
      ["z"]
    ];
  }
  return res;
};

var pathToAbsolute = function(pathArray) {
  pathArray = parsePathString(pathArray);

  if (!pathArray || !pathArray.length) {
    return [
      ["M", 0, 0]
    ];
  }
  var res = [],
    x = 0,
    y = 0,
    mx = 0,
    my = 0,
    start = 0,
    pa0;
  if (pathArray[0][0] == "M") {
    x = +pathArray[0][1];
    y = +pathArray[0][2];
    mx = x;
    my = y;
    start++;
    res[0] = ["M", x, y];
  }
  var crz = pathArray.length == 3 &&
    pathArray[0][0] == "M" &&
    pathArray[1][0].toUpperCase() == "R" &&
    pathArray[2][0].toUpperCase() == "Z";
  for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
    res.push(r = []);
    pa = pathArray[i];
    pa0 = pa[0];
    if (pa0 != pa0.toUpperCase()) {
      r[0] = pa0.toUpperCase();
      switch (r[0]) {
        case "A":
          r[1] = pa[1];
          r[2] = pa[2];
          r[3] = pa[3];
          r[4] = pa[4];
          r[5] = pa[5];
          r[6] = +pa[6] + x;
          r[7] = +pa[7] + y;
          break;
        case "V":
          r[1] = +pa[1] + y;
          break;
        case "H":
          r[1] = +pa[1] + x;
          break;
        case "R":
          var dots = [x, y].concat(pa.slice(1));
          for (var j = 2, jj = dots.length; j < jj; j++) {
            dots[j] = +dots[j] + x;
            dots[++j] = +dots[j] + y;
          }
          res.pop();
          res = res.concat(catmullRom2bezier(dots, crz));
          break;
        case "O":
          res.pop();
          dots = ellipsePath(x, y, pa[1], pa[2]);
          dots.push(dots[0]);
          res = res.concat(dots);
          break;
        case "U":
          res.pop();
          res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
          r = ["U"].concat(res[res.length - 1].slice(-2));
          break;
        case "M":
          mx = +pa[1] + x;
          my = +pa[2] + y;
        default:
          for (j = 1, jj = pa.length; j < jj; j++) {
            r[j] = +pa[j] + ((j % 2) ? x : y);
          }
      }
    } else if (pa0 == "R") {
      dots = [x, y].concat(pa.slice(1));
      res.pop();
      res = res.concat(catmullRom2bezier(dots, crz));
      r = ["R"].concat(pa.slice(-2));
    } else if (pa0 == "O") {
      res.pop();
      dots = ellipsePath(x, y, pa[1], pa[2]);
      dots.push(dots[0]);
      res = res.concat(dots);
    } else if (pa0 == "U") {
      res.pop();
      res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
      r = ["U"].concat(res[res.length - 1].slice(-2));
    } else {
      for (var k = 0, kk = pa.length; k < kk; k++) {
        r[k] = pa[k];
      }
    }
    pa0 = pa0.toUpperCase();
    if (pa0 != "O") {
      switch (r[0]) {
        case "Z":
          x = +mx;
          y = +my;
          break;
        case "H":
          x = r[1];
          break;
        case "V":
          y = r[1];
          break;
        case "M":
          mx = r[r.length - 2];
          my = r[r.length - 1];
        default:
          x = r[r.length - 2];
          y = r[r.length - 1];
      }
    }
  }

  return res;
};


var l2c = function(x1, y1, x2, y2) {
  return [x1, y1, x2, y2, x2, y2];
};
var q2c = function(x1, y1, ax, ay, x2, y2) {
  var _13 = 1 / 3,
    _23 = 2 / 3;
  return [
    _13 * x1 + _23 * ax,
    _13 * y1 + _23 * ay,
    _13 * x2 + _23 * ax,
    _13 * y2 + _23 * ay,
    x2,
    y2
  ];
};
var a2c = function(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
  // for more information of where this math came from visit:
  // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
  if(rx === ry) rx += 1;
  var _120 = Math.PI * 120 / 180,
    rad = Math.PI / 180 * (+angle || 0),
    res = [],
    xy,
    rotate = function(x, y, rad) {
      var X = x * Math.cos(rad) - y * Math.sin(rad),
        Y = x * Math.sin(rad) + y * Math.cos(rad);
      return {
        x: X,
        y: Y
      };
    };
  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
    if(x1 === x2 && y1 === y2) { // 若弧的起始点和终点重叠则错开一点
      x2 += 1;
      y2 += 1;
    }
    var cos = Math.cos(Math.PI / 180 * angle),
      sin = Math.sin(Math.PI / 180 * angle),
      x = (x1 - x2) / 2,
      y = (y1 - y2) / 2;
    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (h > 1) {
      h = Math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    var rx2 = rx * rx,
      ry2 = ry * ry,
      k = (large_arc_flag == sweep_flag ? -1 : 1) *
      Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
      cx = k * rx * y / ry + (x1 + x2) / 2,
      cy = k * -ry * x / rx + (y1 + y2) / 2,
      f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
      f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? Math.PI - f1 : f1;
    f2 = x2 < cx ? Math.PI - f2 : f2;
    f1 < 0 && (f1 = Math.PI * 2 + f1);
    f2 < 0 && (f2 = Math.PI * 2 + f2);
    if (sweep_flag && f1 > f2) {
      f1 = f1 - Math.PI * 2;
    }
    if (!sweep_flag && f2 > f1) {
      f2 = f2 - Math.PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  var df = f2 - f1;
  if (Math.abs(df) > _120) {
    var f2old = f2,
      x2old = x2,
      y2old = y2;
    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * Math.cos(f2);
    y2 = cy + ry * Math.sin(f2);
    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
  }
  df = f2 - f1;
  var c1 = Math.cos(f1),
    s1 = Math.sin(f1),
    c2 = Math.cos(f2),
    s2 = Math.sin(f2),
    t = Math.tan(df / 4),
    hx = 4 / 3 * rx * t,
    hy = 4 / 3 * ry * t,
    m1 = [x1, y1],
    m2 = [x1 + hx * s1, y1 - hy * c1],
    m3 = [x2 + hx * s2, y2 - hy * c2],
    m4 = [x2, y2];
  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if (recursive) {
    return [m2, m3, m4].concat(res);
  } else {
    res = [m2, m3, m4].concat(res).join().split(",");
    var newres = [];
    for (var i = 0, ii = res.length; i < ii; i++) {
      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
    }
    return newres;
  }
};

var path2curve = function(path, path2) {
  var p = pathToAbsolute(path),
    p2 = path2 && pathToAbsolute(path2),
    attrs = {
      x: 0,
      y: 0,
      bx: 0,
      by: 0,
      X: 0,
      Y: 0,
      qx: null,
      qy: null
    },
    attrs2 = {
      x: 0,
      y: 0,
      bx: 0,
      by: 0,
      X: 0,
      Y: 0,
      qx: null,
      qy: null
    },
    processPath = function(path, d, pcom) {
      var nx, ny;
      if (!path) {
        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
      }!(path[0] in {
        T: 1,
        Q: 1
      }) && (d.qx = d.qy = null);
      switch (path[0]) {
        case "M":
          d.X = path[1];
          d.Y = path[2];
          break;
        case "A":
          path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
          break;
        case "S":
          if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
            nx = d.x * 2 - d.bx; // And reflect the previous
            ny = d.y * 2 - d.by; // command's control point relative to the current point.
          } else { // or some else or nothing
            nx = d.x;
            ny = d.y;
          }
          path = ["C", nx, ny].concat(path.slice(1));
          break;
        case "T":
          if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
            d.qx = d.x * 2 - d.qx; // And make a reflection similar
            d.qy = d.y * 2 - d.qy; // to case "S".
          } else { // or something else or nothing
            d.qx = d.x;
            d.qy = d.y;
          }
          path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
          break;
        case "Q":
          d.qx = path[1];
          d.qy = path[2];
          path = ["C"].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
          break;
        case "L":
          path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
          break;
        case "H":
          path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
          break;
        case "V":
          path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
          break;
        case "Z":
          path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
          break;
      }
      return path;
    },
    fixArc = function(pp, i) {
      if (pp[i].length > 7) {
        pp[i].shift();
        var pi = pp[i];
        while (pi.length) {
          pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved
          p2 && (pcoms2[i] = "A"); // the same as above
          pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
        }
        pp.splice(i, 1);
        ii = Math.max(p.length, p2 && p2.length || 0);
      }
    },
    fixM = function(path1, path2, a1, a2, i) {
      if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
        path2.splice(i, 0, ["M", a2.x, a2.y]);
        a1.bx = 0;
        a1.by = 0;
        a1.x = path1[i][1];
        a1.y = path1[i][2];
        ii = Math.max(p.length, p2 && p2.length || 0);
      }
    },
    pcoms1 = [], // path commands of original path p
    pcoms2 = [], // path commands of original path p2
    pfirst = "", // temporary holder for original path command
    pcom = ""; // holder for previous path command of original path
  for (var i = 0, ii = Math.max(p.length, p2 && p2.length || 0); i < ii; i++) {
    p[i] && (pfirst = p[i][0]); // save current path command

    if (pfirst != "C") { // C is not saved yet, because it may be result of conversion
      pcoms1[i] = pfirst; // Save current path command
      i && (pcom = pcoms1[i - 1]); // Get previous path command pcom
    }
    p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

    if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
    // which may produce multiple C:s
    // so we have to make sure that C is also C in original path

    fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

    if (p2) { // the same procedures is done to p2
      p2[i] && (pfirst = p2[i][0]);
      if (pfirst != "C") {
        pcoms2[i] = pfirst;
        i && (pcom = pcoms2[i - 1]);
      }
      p2[i] = processPath(p2[i], attrs2, pcom);

      if (pcoms2[i] != "A" && pfirst == "C") {
        pcoms2[i] = "C";
      }

      fixArc(p2, i);
    }
    fixM(p, p2, attrs, attrs2, i);
    fixM(p2, p, attrs2, attrs, i);
    var seg = p[i],
      seg2 = p2 && p2[i],
      seglen = seg.length,
      seg2len = p2 && seg2.length;
    attrs.x = seg[seglen - 2];
    attrs.y = seg[seglen - 1];
    attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
    attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
    attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
    attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
    attrs2.x = p2 && seg2[seg2len - 2];
    attrs2.y = p2 && seg2[seg2len - 1];
  }

  return p2 ? [p, p2] : p;
};

var p2s = /,?([a-z]),?/gi;
var path2string = function(path) {
  return path.join(',').replace(p2s, "$1");
};

var PathUtil = {
  toArray: parsePathString,
  toString: path2string,
  toCurve: path2curve,
  toAbsolute: pathToAbsolute,
  catmullRomToBezier: catmullRom2bezier
};

var index$2 = PathUtil;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol = _root.Symbol;

var _Symbol = Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';

/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 * @example
 *
 * _.isBoolean(false);
 * // => true
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike_1(value) && _baseGetTag(value) == boolTag);
}

var isBoolean_1 = isBoolean;

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
function isNil(value) {
  return value == null;
}

var isNil_1 = isNil;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag);
}

var isString_1 = isString;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

  return value === proto;
}

var _isPrototype = isPrototype;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto$5 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty$3).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

/* Built-in method references that are verified to be native. */
var DataView = _getNative(_root, 'DataView');

var _DataView = DataView;

/* Built-in method references that are verified to be native. */
var Map = _getNative(_root, 'Map');

var _Map = Map;

/* Built-in method references that are verified to be native. */
var Promise = _getNative(_root, 'Promise');

var _Promise = Promise;

/* Built-in method references that are verified to be native. */
var Set = _getNative(_root, 'Set');

var _Set = Set;

/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]';
var objectTag = '[object Object]';
var promiseTag = '[object Promise]';
var setTag$1 = '[object Set]';
var weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView);
var mapCtorString = _toSource(_Map);
var promiseCtorString = _toSource(_Promise);
var setCtorString = _toSource(_Set);
var weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (_Map && getTag(new _Map) != mapTag$1) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag$1) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag$1;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$1;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

var _getTag = getTag;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$4.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

var isArguments_1 = isArguments;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse_1;

module.exports = isBuffer;
});

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag$1 = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag$2 = '[object Map]';
var numberTag = '[object Number]';
var objectTag$1 = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag$2 = '[object Set]';
var stringTag$1 = '[object String]';
var weakMapTag$1 = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag$1 = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag$1] =
typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag$2] = typedArrayTags[numberTag] =
typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] =
typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] =
typedArrayTags[weakMapTag$1] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike_1(value) &&
    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

var isTypedArray_1 = isTypedArray;

/** `Object#toString` result references. */
var mapTag = '[object Map]';
var setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike_1(value) &&
      (isArray_1(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer_1(value) || isTypedArray_1(value) || isArguments_1(value))) {
    return !value.length;
  }
  var tag = _getTag(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (_isPrototype(value)) {
    return !_baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty$1.call(value, key)) {
      return false;
    }
  }
  return true;
}

var isEmpty_1 = isEmpty;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var _arrayMap = arrayMap;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray_1(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return _arrayMap(value, baseToString) + '';
  }
  if (isSymbol_1(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

var _baseToString = baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString$1(value) {
  return value == null ? '' : _baseToString(value);
}

var toString_1 = toString$1;

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString_1(prefix) + id;
}

var uniqueId_1 = uniqueId;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

var _Stack = Stack;

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach;

var defineProperty = (function() {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var _defineProperty = defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty) {
    _defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$7.call(object, key) && eq_1(objValue, value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignValue = assignValue;

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue(object, key, newValue);
    } else {
      _assignValue(object, key, newValue);
    }
  }
  return object;
}

var _copyObject = copyObject;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/** Used for built-in method references. */
var objectProto$10 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$10.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$8.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && _copyObject(source, keys_1(source), object);
}

var _baseAssign = baseAssign;

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var _nativeKeysIn = nativeKeysIn;

/** Used for built-in method references. */
var objectProto$11 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$11.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject_1(object)) {
    return _nativeKeysIn(object);
  }
  var isProto = _isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

var _baseKeysIn = baseKeysIn;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn$1(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
}

var keysIn_1 = keysIn$1;

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && _copyObject(source, keysIn_1(source), object);
}

var _baseAssignIn = baseAssignIn;

var _cloneBuffer = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
});

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

var _copyArray = copyArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */
var objectProto$12 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$12.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

var _getSymbols = getSymbols;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return _copyObject(source, _getSymbols(source), object);
}

var _copySymbols = copySymbols;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush;

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
  var result = [];
  while (object) {
    _arrayPush(result, _getSymbols(object));
    object = _getPrototype(object);
  }
  return result;
};

var _getSymbolsIn = getSymbolsIn;

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return _copyObject(source, _getSymbolsIn(source), object);
}

var _copySymbolsIn = copySymbolsIn;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
}

var _getAllKeysIn = getAllKeysIn;

/** Used for built-in method references. */
var objectProto$13 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$10 = objectProto$13.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty$10.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

var _initCloneArray = initCloneArray;

/** Built-in value references. */
var Uint8Array = _root.Uint8Array;

var _Uint8Array = Uint8Array;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
  return result;
}

var _cloneArrayBuffer = cloneArrayBuffer;

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

var _cloneDataView = cloneDataView;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

var _addMapEntry = addMapEntry;

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

var _arrayReduce = arrayReduce;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1;

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_mapToArray(map), CLONE_DEEP_FLAG$1) : _mapToArray(map);
  return _arrayReduce(array, _addMapEntry, new map.constructor);
}

var _cloneMap = cloneMap;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

var _cloneRegExp = cloneRegExp;

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

var _addSetEntry = addSetEntry;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$2 = 1;

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_setToArray(set), CLONE_DEEP_FLAG$2) : _setToArray(set);
  return _arrayReduce(array, _addSetEntry, new set.constructor);
}

var _cloneSet = cloneSet;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined;
var symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

var _cloneSymbol = cloneSymbol;

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

var _cloneTypedArray = cloneTypedArray;

/** `Object#toString` result references. */
var boolTag$3 = '[object Boolean]';
var dateTag$2 = '[object Date]';
var mapTag$4 = '[object Map]';
var numberTag$2 = '[object Number]';
var regexpTag$2 = '[object RegExp]';
var setTag$4 = '[object Set]';
var stringTag$3 = '[object String]';
var symbolTag$2 = '[object Symbol]';

var arrayBufferTag$2 = '[object ArrayBuffer]';
var dataViewTag$3 = '[object DataView]';
var float32Tag$2 = '[object Float32Array]';
var float64Tag$2 = '[object Float64Array]';
var int8Tag$2 = '[object Int8Array]';
var int16Tag$2 = '[object Int16Array]';
var int32Tag$2 = '[object Int32Array]';
var uint8Tag$2 = '[object Uint8Array]';
var uint8ClampedTag$2 = '[object Uint8ClampedArray]';
var uint16Tag$2 = '[object Uint16Array]';
var uint32Tag$2 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$2:
      return _cloneArrayBuffer(object);

    case boolTag$3:
    case dateTag$2:
      return new Ctor(+object);

    case dataViewTag$3:
      return _cloneDataView(object, isDeep);

    case float32Tag$2: case float64Tag$2:
    case int8Tag$2: case int16Tag$2: case int32Tag$2:
    case uint8Tag$2: case uint8ClampedTag$2: case uint16Tag$2: case uint32Tag$2:
      return _cloneTypedArray(object, isDeep);

    case mapTag$4:
      return _cloneMap(object, isDeep, cloneFunc);

    case numberTag$2:
    case stringTag$3:
      return new Ctor(object);

    case regexpTag$2:
      return _cloneRegExp(object);

    case setTag$4:
      return _cloneSet(object, isDeep, cloneFunc);

    case symbolTag$2:
      return _cloneSymbol(object);
  }
}

var _initCloneByTag = initCloneByTag;

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject_1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var _baseCreate = baseCreate;

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !_isPrototype(object))
    ? _baseCreate(_getPrototype(object))
    : {};
}

var _initCloneObject = initCloneObject;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;
var CLONE_FLAT_FLAG = 2;
var CLONE_SYMBOLS_FLAG$1 = 4;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]';
var arrayTag$1 = '[object Array]';
var boolTag$2 = '[object Boolean]';
var dateTag$1 = '[object Date]';
var errorTag$1 = '[object Error]';
var funcTag$2 = '[object Function]';
var genTag$1 = '[object GeneratorFunction]';
var mapTag$3 = '[object Map]';
var numberTag$1 = '[object Number]';
var objectTag$2 = '[object Object]';
var regexpTag$1 = '[object RegExp]';
var setTag$3 = '[object Set]';
var stringTag$2 = '[object String]';
var symbolTag$1 = '[object Symbol]';
var weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$1 = '[object ArrayBuffer]';
var dataViewTag$2 = '[object DataView]';
var float32Tag$1 = '[object Float32Array]';
var float64Tag$1 = '[object Float64Array]';
var int8Tag$1 = '[object Int8Array]';
var int16Tag$1 = '[object Int16Array]';
var int32Tag$1 = '[object Int32Array]';
var uint8Tag$1 = '[object Uint8Array]';
var uint8ClampedTag$1 = '[object Uint8ClampedArray]';
var uint16Tag$1 = '[object Uint16Array]';
var uint32Tag$1 = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
cloneableTags[arrayBufferTag$1] = cloneableTags[dataViewTag$2] =
cloneableTags[boolTag$2] = cloneableTags[dateTag$1] =
cloneableTags[float32Tag$1] = cloneableTags[float64Tag$1] =
cloneableTags[int8Tag$1] = cloneableTags[int16Tag$1] =
cloneableTags[int32Tag$1] = cloneableTags[mapTag$3] =
cloneableTags[numberTag$1] = cloneableTags[objectTag$2] =
cloneableTags[regexpTag$1] = cloneableTags[setTag$3] =
cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
cloneableTags[uint8Tag$1] = cloneableTags[uint8ClampedTag$1] =
cloneableTags[uint16Tag$1] = cloneableTags[uint32Tag$1] = true;
cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
cloneableTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject_1(value)) {
    return value;
  }
  var isArr = isArray_1(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return _copyArray(value, result);
    }
  } else {
    var tag = _getTag(value),
        isFunc = tag == funcTag$2 || tag == genTag$1;

    if (isBuffer_1(value)) {
      return _cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : _initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  var keysFunc = isFull
    ? (isFlat ? _getAllKeysIn : _getAllKeys)
    : (isFlat ? keysIn : keys_1);

  var props = isArr ? undefined : keysFunc(value);
  _arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

var _baseClone = baseClone;

/** Used to compose bitmasks for cloning. */
var CLONE_SYMBOLS_FLAG = 4;

/**
 * Creates a shallow clone of `value`.
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
 * and supports cloning arrays, array buffers, booleans, date objects, maps,
 * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
 * arrays. The own enumerable properties of `arguments` objects are cloned
 * as plain objects. An empty object is returned for uncloneable values such
 * as error objects, functions, DOM nodes, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 * @see _.cloneDeep
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var shallow = _.clone(objects);
 * console.log(shallow[0] === objects[0]);
 * // => true
 */
function clone(value) {
  return _baseClone(value, CLONE_SYMBOLS_FLAG);
}

var clone_1 = clone;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

var identity_1 = identity;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var _apply = apply;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply(func, this, otherArgs);
  };
}

var _overRest = overRest;

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

var constant_1 = constant;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !_defineProperty ? identity_1 : function(func, string) {
  return _defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant_1(string),
    'writable': true
  });
};

var _baseSetToString = baseSetToString;

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800;
var HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var _shortOut = shortOut;

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = _shortOut(_baseSetToString);

var _setToString = setToString;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return _setToString(_overRest(func, start, identity_1), func + '');
}

var _baseRest = baseRest;

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject_1(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike_1(object) && _isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq_1(object[index], value);
  }
  return false;
}

var _isIterateeCall = isIterateeCall;

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return _baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

var _createAssigner = createAssigner;

/** Used for built-in method references. */
var objectProto$14 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$11 = objectProto$14.hasOwnProperty;

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = _createAssigner(function(object, source) {
  if (_isPrototype(source) || isArrayLike_1(source)) {
    _copyObject(source, keys_1(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty$11.call(source, key)) {
      _assignValue(object, key, source[key]);
    }
  }
});

var assign_1 = assign;

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq_1(object[key], value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignMergeValue = assignMergeValue;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = _createBaseFor();

var _baseFor = baseFor;

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike_1(value) && isArrayLike_1(value);
}

var isArrayLikeObject_1 = isArrayLikeObject;

/** `Object#toString` result references. */
var objectTag$3 = '[object Object]';

/** Used for built-in method references. */
var funcProto$2 = Function.prototype;
var objectProto$15 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$12 = objectProto$15.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString$2.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$3) {
    return false;
  }
  var proto = _getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$12.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString$2.call(Ctor) == objectCtorString;
}

var isPlainObject_1 = isPlainObject;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return _copyObject(value, keysIn_1(value));
}

var toPlainObject_1 = toPlainObject;

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = object[key],
      srcValue = source[key],
      stacked = stack.get(srcValue);

  if (stacked) {
    _assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray_1(srcValue),
        isBuff = !isArr && isBuffer_1(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray_1(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray_1(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject_1(objValue)) {
        newValue = _copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = _cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = _cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject_1(srcValue) || isArguments_1(srcValue)) {
      newValue = objValue;
      if (isArguments_1(objValue)) {
        newValue = toPlainObject_1(objValue);
      }
      else if (!isObject_1(objValue) || (srcIndex && isFunction_1(objValue))) {
        newValue = _initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  _assignMergeValue(object, key, newValue);
}

var _baseMergeDeep = baseMergeDeep;

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  _baseFor(source, function(srcValue, key) {
    if (isObject_1(srcValue)) {
      stack || (stack = new _Stack);
      _baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(object[key], srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      _assignMergeValue(object, key, newValue);
    }
  }, keysIn_1);
}

var _baseMerge = baseMerge;

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = _createAssigner(function(object, source, srcIndex) {
  _baseMerge(object, source, srcIndex);
});

var merge_1 = merge;

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

var _baseSlice = baseSlice;

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : _baseSlice(array, start, end);
}

var _castSlice = castSlice;

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f';
var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange = '\\u20d0-\\u20ff';
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

var _hasUnicode = hasUnicode;

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

var _asciiToArray = asciiToArray;

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

var _unicodeToArray = unicodeToArray;

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return _hasUnicode(string)
    ? _unicodeToArray(string)
    : _asciiToArray(string);
}

var _stringToArray = stringToArray;

/**
 * Creates a function like `_.lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return function(string) {
    string = toString_1(string);

    var strSymbols = _hasUnicode(string)
      ? _stringToArray(string)
      : undefined;

    var chr = strSymbols
      ? strSymbols[0]
      : string.charAt(0);

    var trailing = strSymbols
      ? _castSlice(strSymbols, 1).join('')
      : string.slice(1);

    return chr[methodName]() + trailing;
  };
}

var _createCaseFirst = createCaseFirst;

/**
 * Converts the first character of `string` to upper case.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.upperFirst('fred');
 * // => 'Fred'
 *
 * _.upperFirst('FRED');
 * // => 'FRED'
 */
var upperFirst = _createCaseFirst('toUpperCase');

var upperFirst_1 = upperFirst;

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

var _baseFindIndex = baseFindIndex;

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

var _baseIsNaN = baseIsNaN;

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

var _strictIndexOf = strictIndexOf;

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? _strictIndexOf(array, value, fromIndex)
    : _baseFindIndex(array, _baseIsNaN, fromIndex);
}

var _baseIndexOf = baseIndexOf;

/**
 * This function is like `baseIndexOf` except that it accepts a comparator.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOfWith(array, value, fromIndex, comparator) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (comparator(array[index], value)) {
      return index;
    }
  }
  return -1;
}

var _baseIndexOfWith = baseIndexOfWith;

/** Used for built-in method references. */
var arrayProto$1 = Array.prototype;

/** Built-in value references. */
var splice$1 = arrayProto$1.splice;

/**
 * The base implementation of `_.pullAllBy` without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns `array`.
 */
function basePullAll(array, values, iteratee, comparator) {
  var indexOf = comparator ? _baseIndexOfWith : _baseIndexOf,
      index = -1,
      length = values.length,
      seen = array;

  if (array === values) {
    values = _copyArray(values);
  }
  if (iteratee) {
    seen = _arrayMap(array, _baseUnary(iteratee));
  }
  while (++index < length) {
    var fromIndex = 0,
        value = values[index],
        computed = iteratee ? iteratee(value) : value;

    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
      if (seen !== array) {
        splice$1.call(seen, fromIndex, 1);
      }
      splice$1.call(array, fromIndex, 1);
    }
  }
  return array;
}

var _basePullAll = basePullAll;

/**
 * This method is like `_.pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `_.difference`, this method mutates `array`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pullAll(array, ['a', 'c']);
 * console.log(array);
 * // => ['b', 'b']
 */
function pullAll(array, values) {
  return (array && array.length && values && values.length)
    ? _basePullAll(array, values)
    : array;
}

var pullAll_1 = pullAll;

/**
 * Removes all given values from `array` using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
 * to remove elements from an array by predicate.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {...*} [values] The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pull(array, 'a', 'c');
 * console.log(array);
 * // => ['b', 'b']
 */
var pull = _baseRest(pullAll_1);

var pull_1 = pull;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && _baseFor(object, iteratee, keys_1);
}

var _baseForOwn = baseForOwn;

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_1(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

var _createBaseEach = createBaseEach;

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = _createBaseEach(_baseForOwn);

var _baseEach = baseEach;

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : identity_1;
}

var _castFunction = castFunction;

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray_1(collection) ? _arrayEach : _baseEach;
  return func(collection, _castFunction(iteratee));
}

var forEach_1 = forEach;

/**
 * Converts `iterator` to an array.
 *
 * @private
 * @param {Object} iterator The iterator to convert.
 * @returns {Array} Returns the converted array.
 */
function iteratorToArray(iterator) {
  var data,
      result = [];

  while (!(data = iterator.next()).done) {
    result.push(data.value);
  }
  return result;
}

var _iteratorToArray = iteratorToArray;

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return _arrayMap(props, function(key) {
    return object[key];
  });
}

var _baseValues = baseValues;

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object == null ? [] : _baseValues(object, keys_1(object));
}

var values_1 = values;

/** `Object#toString` result references. */
var mapTag$5 = '[object Map]';
var setTag$5 = '[object Set]';

/** Built-in value references. */
var symIterator = _Symbol ? _Symbol.iterator : undefined;

/**
 * Converts `value` to an array.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Array} Returns the converted array.
 * @example
 *
 * _.toArray({ 'a': 1, 'b': 2 });
 * // => [1, 2]
 *
 * _.toArray('abc');
 * // => ['a', 'b', 'c']
 *
 * _.toArray(1);
 * // => []
 *
 * _.toArray(null);
 * // => []
 */
function toArray(value) {
  if (!value) {
    return [];
  }
  if (isArrayLike_1(value)) {
    return isString_1(value) ? _stringToArray(value) : _copyArray(value);
  }
  if (symIterator && value[symIterator]) {
    return _iteratorToArray(value[symIterator]());
  }
  var tag = _getTag(value),
      func = tag == mapTag$5 ? _mapToArray : (tag == setTag$5 ? _setToArray : values_1);

  return func(value);
}

var toArray_1 = toArray;

var PRECISION = 0.00001; // 常量，据的精度，小于这个精度认为是0
var RADIAN = Math.PI / 180;
var DEGREE = 180 / Math.PI;

var common = {
  isFunction: isFunction_1,
  isObject: isObject_1,
  isBoolean: isBoolean_1,
  isNil: isNil_1,
  isString: isString_1,
  isArray: isArray_1,
  isEmpty: isEmpty_1, // isBlank
  uniqueId: uniqueId_1,
  clone: clone_1,
  assign: assign_1, // simpleMix
  merge: merge_1, // mix
  upperFirst: upperFirst_1, // ucfirst
  remove: pull_1,
  each: forEach_1,
  toArray: toArray_1,
  extend: function (subclass, superclass, overrides, staticOverrides) {
    // 如果只提供父类构造函数，则自动生成子类构造函数
    if (!this.isFunction(superclass)) {
      overrides = superclass;
      superclass = subclass;
      subclass = function () {};
    }

    var create = Object.create ? function (proto, c) {
      return Object.create(proto, {
        constructor: {
          value: c
        }
      });
    } : function (proto, c) {
      function F() {}

      F.prototype = proto;
      var o = new F();
      o.constructor = c;
      return o;
    };

    var superObj = create(superclass.prototype, subclass); // new superclass(),//实例化父类作为子类的prototype
    subclass.prototype = this.merge(superObj, subclass.prototype); // 指定子类的prototype
    subclass.superclass = create(superclass.prototype, superclass);
    this.merge(superObj, overrides);
    this.merge(subclass, staticOverrides);
    return subclass;
  },
  augment: function (c) {
    var args = this.toArray(arguments);
    for (var i = 1; i < args.length; i++) {
      var obj = args[i];
      if (this.isFunction(obj)) {
        obj = obj.prototype;
      }
      this.merge(c.prototype, obj);
    }
  },

  /**
   * 判断两个数是否相等
   * @param {Number} a 数
   * @param {Number} b 数
   * @return {Boolean} 是否相等
   **/
  isNumberEqual: function (a, b) {
    return Math.abs(a - b) < PRECISION;
  },

  /**
   * 获取角度对应的弧度
   * @param {Number} degree 角度
   * @return {Number} 弧度
   **/
  toRadian: function (degree) {
    return RADIAN * degree;
  },

  /**
   * 获取弧度对应的角度
   * @param {Number} radian 弧度
   * @return {Number} 角度
   **/
  toDegree: function (radian) {
    return DEGREE * radian;
  },

  /**
   * 广义取模运算
   * @param {Number} n 被取模的值
   * @param {Number} m 模
   * @return {Number} 返回n 被 m 取模的结果
   */
  mod: function (n, m) {
    return (n % m + m) % m;
  }
};

var TABLE = document.createElement('table');
var TABLE_TR = document.createElement('tr');
var FRAGMENT_REG = /^\s*<(\w+|!)[^>]*>/;
var CONTAINERS = {
  tr: document.createElement('tbody'),
  tbody: TABLE,
  thead: TABLE,
  tfoot: TABLE,
  td: TABLE_TR,
  th: TABLE_TR,
  '*': document.createElement('div')
};

var dom = {
  getBoundingClientRect: function (node) {
    var rect = node.getBoundingClientRect();
    var top = document.documentElement.clientTop;
    var left = document.documentElement.clientLeft;
    return {
      top: rect.top - top,
      bottom: rect.bottom - top,
      left: rect.left - left,
      right: rect.right - left
    };
  },

  /**
   * 获取样式
   * @param  {Object} dom DOM节点
   * @param  {String} name 样式名
   * @return {String} 属性值
   */
  getStyle: function (dom, name) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(dom, null)[name];
    }
    return dom.currentStyle[name];
  },
  modiCSS: function (dom, css) {
    for (var key in css) {
      if (css.hasOwnProperty(key)) {
        dom.style[key] = css[key];
      }
    }
    return dom;
  },

  /**
   * 创建DOM 节点
   * @param  {String} str Dom 字符串
   * @return {HTMLElement}  DOM 节点
   */
  createDom: function (str) {
    var name = FRAGMENT_REG.test(str) && RegExp.$1;
    if (!(name in CONTAINERS)) {
      name = '*';
    }
    var container = CONTAINERS[name];
    str = str.replace(/(^\s*)|(\s*$)/g, '');
    container.innerHTML = '' + str;
    return container.childNodes[0];
  },
  getRatio: function () {
    return window.devicePixelRatio ? window.devicePixelRatio : 2;
  },

  /**
   * 获取宽度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 宽度
   */
  getWidth: function (el) {
    var width = this.getStyle(el, 'width');
    if (width === 'auto') {
      width = el.offsetWidth;
    }
    return parseFloat(width);
  },

  /**
   * 获取高度
   * @param  {HTMLElement} el dom节点
   * @return {Number} 高度
   */
  getHeight: function (el) {
    var height = this.getStyle(el, 'height');
    if (height === 'auto') {
      height = el.offsetHeight;
    }
    return parseFloat(height);
  },

  /**
   * 获取外层高度
   * @param  {HTMLElement} el dom节点
   * @return {Number} 高度
   */
  getOuterHeight: function (el) {
    var height = this.getHeight(el);
    var bTop = parseFloat(this.getStyle(el, 'borderTopWidth')) || 0;
    var pTop = parseFloat(this.getStyle(el, 'paddingTop'));
    var pBottom = parseFloat(this.getStyle(el, 'paddingBottom'));
    var bBottom = parseFloat(this.getStyle(el, 'borderBottomWidth')) || 0;
    return height + bTop + bBottom + pTop + pBottom;
  },

  /**
   * TODO: 应该移除的
   * 添加时间监听器
   * @param  {Object} target DOM对象
   * @param  {Object} eventType 事件名
   * @param  {Funtion} callback 回调函数
   * @return {Object} 返回对象
   */
  addEventListener: function (target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function () {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function () {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },
  requestAnimationFrame: function (fn) {
    var method = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
      return setTimeout(fn, 16);
    };

    return method(fn);
  },
  cancelAnimationFrame: function (id) {
    var method = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || function (id) {
      return clearTimeout(id);
    };
    return method(id);
  }
};

var Util$3 = {};

common.merge(Util$3, common, dom, {
  mixin: function (c, mixins) {
    var Param = c.CFG ? 'CFG' : 'ATTRS';
    if (c && mixins) {
      c._mixins = mixins;
      c[Param] = c[Param] || {};
      var temp = {};
      Util$3.each(mixins, function (mixin) {
        Util$3.augment(c, mixin);
        var attrs = mixin[Param];
        if (attrs) {
          Util$3.merge(temp, attrs);
        }
      });
      c[Param] = Util$3.merge(temp, c[Param]);
    }
  }
});

var index$8 = Util$3;

var Event = function(type, event, bubbles, cancelable) {
  this.type = type;  // 事件类型
  this.target = null; // 目标
  this.currentTarget = null; // 当前目标
  this.bubbles = bubbles; // 冒泡
  this.cancelable = cancelable; // 是否能够阻止
  this.timeStamp = (new Date()).getTime(); // 时间戳
  this.defaultPrevented = false; // 阻止默认
  this.propagationStopped = false; // 阻止冒泡
  this.removed= false; //是否被移除
  this.event = event; // 触发的原生事件
};


index$4.augment(Event, {
  preventDefault: function() {
    this.defaultPrevented = this.cancelable && true;
  },
  stopPropagation: function() {
    this.propagationStopped = true;
  },
  remove: function() {
    this.remove = true;
  },
  clone: function() {
    return index$4.clone(this);
  },
  toString: function() {
    return '[Event (type=' + this.type + ')]';
  }
});

var event = Event;

var index$10 = event;

var MouseEvent = function (canvas) {
  this.canvas = canvas;
  this.el = canvas.get('el');
  this.current = null;
  this.pre = null;
};

index$8.augment(MouseEvent, {
  tryTrigger: function (element, event) {
    if (element.__listeners) {
      element.trigger(event);
    } else {
      return;
    }
  },
  getCurrent: function (e) {
    var canvas = this.canvas;
    var point = canvas.getPointByClient(e.clientX, e.clientY);
    this.point = point;
    this.pre = this.current;
    this.current = canvas.getShape(point.x, point.y);
  },
  mousemove: function (e) {
    this.getCurrent(e);
    var point = this.point;
    var canvas = this.canvas;
    if (canvas.has('canvas-mousemove')) {
      var canvasmousemove = new index$10('canvas-mousemove', e, true, true);
      canvasmousemove.x = point.x;
      canvasmousemove.y = point.y;
      canvasmousemove.clientX = e.clientX;
      canvasmousemove.clientY = e.clientY;
      canvasmousemove.currentTarget = canvas;
      this.tryTrigger(canvas, canvasmousemove);
    }

    if (this.pre && this.pre !== this.current) {
      var mouseleave = new index$10('mouseleave', e, true, true);
      mouseleave.x = point.x;
      mouseleave.y = point.y;
      mouseleave.clientX = e.clientX;
      mouseleave.clientY = e.clientY;
      mouseleave.currentTarget = this.pre;
      mouseleave.target = this.pre;
      this.tryTrigger(this.pre, mouseleave);
    }

    if (this.current) {
      var mousemove = new index$10('mousemove', e, true, true);
      mousemove.x = point.x;
      mousemove.y = point.y;
      mousemove.clientX = e.clientX;
      mousemove.clientY = e.clientY;
      mousemove.currentTarget = this.current;
      mousemove.target = this.current;
      this.tryTrigger(this.current, mousemove);

      if (this.pre !== this.current) {
        var mouseenter = new index$10('mouseenter', e, true, true);
        mouseenter.x = point.x;
        mouseenter.y = point.y;
        mouseenter.clientX = e.clientX;
        mouseenter.clientY = e.clientY;
        mouseenter.currentTarget = this.current;
        mouseenter.target = this.current;
        this.tryTrigger(this.current, mouseenter);
      }
    }
  },
  mousedown: function (e) {
    var point = this.point;
    var canvas = this.canvas;

    if (canvas.has('canvas-mousedown')) {
      var canvasmousedown = new index$10('canvas-mousedown', e, true, true);
      canvasmousedown.x = point.x;
      canvasmousedown.y = point.y;
      canvasmousedown.clientX = e.clientX;
      canvasmousedown.clientY = e.clientY;
      canvasmousedown.currentTarget = canvas;
      this.tryTrigger(canvas, canvasmousedown);
    }

    if (this.current) {
      var mousedown = new index$10('mousedown', e, true, true);
      mousedown.x = point.x;
      mousedown.y = point.y;
      mousedown.clientX = e.clientX;
      mousedown.clientY = e.clientY;
      mousedown.currentTarget = this.current;
      mousedown.target = this.current;
      this.tryTrigger(this.current, mousedown);
    }
  },
  mouseup: function (e) {
    var point = this.point;
    var canvas = this.canvas;
    if (canvas.has('canvas-mouseup')) {
      var canvasmouseup = new index$10('canvas-mouseup', e, true, true);
      canvasmouseup.x = point.x;
      canvasmouseup.y = point.y;
      canvasmouseup.clientX = e.clientX;
      canvasmouseup.clientY = e.clientY;
      canvasmouseup.currentTarget = canvas;
      this.tryTrigger(canvas, canvasmouseup);
    }
    if (this.current) {
      var mouseup = new index$10('mouseup', e, true, true);
      mouseup.x = point.x;
      mouseup.y = point.y;
      mouseup.clientX = e.clientX;
      mouseup.clientY = e.clientY;
      mouseup.currentTarget = this.current;
      mouseup.target = this.current;
      this.tryTrigger(this.current, mouseup);
    }
  },
  click: function (e) {
    this.getCurrent(e);
    var point = this.point;
    var canvas = this.canvas;
    if (canvas.has('canvas-click')) {
      var canvasclick = new index$10('canvas-click', e, true, true);
      canvasclick.x = point.x;
      canvasclick.y = point.y;
      canvasclick.clientX = e.clientX;
      canvasclick.clientY = e.clientY;
      canvasclick.currentTarget = canvas;
      this.tryTrigger(canvas, canvasclick);
    }

    if (this.current) {
      var click = new index$10('click', e, true, true);
      click.x = point.x;
      click.y = point.y;
      click.clientX = e.clientX;
      click.clientY = e.clientY;
      click.currentTarget = this.current;
      click.target = this.current;
      this.tryTrigger(this.current, click);
    }
  },
  dblclick: function (e) {
    var point = this.point;
    var canvas = this.canvas;

    if (canvas.has('canvas-dblclick')) {
      var canvasdblclick = new index$10('canvas-dblclick', e, true, true);
      canvasdblclick.x = point.x;
      canvasdblclick.y = point.y;
      canvasdblclick.clientX = e.clientX;
      canvasdblclick.clientY = e.clientY;
      canvasdblclick.currentTarget = canvas;
      this.tryTrigger(canvas, canvasdblclick);
    }

    if (this.current) {
      var dblclick = new index$10('dblclick', e, true, true);
      dblclick.x = point.x;
      dblclick.y = point.y;
      dblclick.clientX = e.clientX;
      dblclick.clientY = e.clientY;
      dblclick.currentTarget = this.current;
      dblclick.target = this.current;
      this.tryTrigger(this.current, dblclick);
    }
  },
  mouseout: function (e) {
    var point = this.point;
    var canvas = this.canvas;

    var canvasmouseleave = new index$10('canvas-mouseleave', e, true, true);
    canvasmouseleave.x = point.x;
    canvasmouseleave.y = point.y;
    canvasmouseleave.currentTarget = canvas;
    this.tryTrigger(canvas, canvasmouseleave);
  },
  mouseover: function (e) {
    var canvas = this.canvas;

    var canvasmouseenter = new index$10('canvas-mouseenter', e, true, true);
    canvasmouseenter.currentTarget = canvas;
    this.tryTrigger(canvas, canvasmouseenter);
  }
});

var mouseEvent = MouseEvent;

/**
 * @fileOverview 公共类
 * @author hankaiai@126.com
 */
var common$2 = {
  prefix: 'g',
  backupContext: document.createElement('canvas').getContext('2d'),
  debug: false,
  warn: function () {}
};

/**
 * @fileOverview gMath 基础数学工具类
 * @author hankaiai@126.com
 * @author dxq613@gmail.com
 * @ignore
 */

//取小于当前值的
function arrayFloor(values,value){
  var length = values.length;
  if (length === 0) {
    return NaN;
  }


  var pre = values[0];

  if(value < values[0]){
    return NaN;
  }

  if(value >= values[length - 1]){
    return values[length - 1];
  }
  for (var i = 1; i < values.length; i++) {
    if(value < values[i]){
      break;
    }
    pre = values[i];
  }

  return pre;
}
//大于当前值的第一个
function arrayCeiling(values,value){
  var length = values.length;
  if (length === 0) {
    return NaN;
  }
  var pre = values[0],
      rst;
  if(value > values[length - 1]){
    return NaN;
  }
  if(value < values[0]){
    return values[0];
  }

  for (var i = 1; i < values.length; i++) {
    if(value <= values[i]){
      rst = values[i];
      break;
    }
    pre = values[i];
  }

  return rst;
}


var gMath = {
  /**
   * 常亮：数据的精度，小于这个精度认为是0
   **/
  PRECISION: 0.00001,
  /**
   * 判断两个数是否相等
   * @param {Number} a 数
   * @param {Number} b 数
   * @return {Boolean} 是否相等
   **/
  equal: function(a, b) {
    return (Math.abs((a - b)) < gMath.PRECISION);
  },
  /**
   * 把a夹在min，max中间, 低于min的返回min，高于max的返回max，否则返回自身
   * @param {Number} a 数
   * @param {Number} min 下限
   * @param {Number} max 上限
   **/
  clamp: function(a, min, max) {
    if (a < min) {
      return min;
    } else if (a > max){
      return max;
    } else {
      return a;
    }
  },
  /**
   * 获取逼近的值，用于对齐数据
   * @param  {Array} values   数据集合
   * @param  {Number} value   数值
   * @return {Number} 逼近的值
   */
  snapTo : function(values, value){
    // 这里假定values是升序排列
    var floorVal = arrayFloor(values,value),
      ceilingVal = arrayCeiling(values,value);
    if(isNaN(floorVal) || isNaN(ceilingVal)){
      if(values[0] >= value){
        return values[0];
      }
      var last = values[values.length -1];
      if(last <= value){
        return last;
      }
    }


    if(Math.abs(value - floorVal) < Math.abs(ceilingVal - value)){
      return floorVal;
    }
    return ceilingVal;
  },
  /**
   * 获取逼近的最小值，用于对齐数据
   * @param  {Array} values   数据集合
   * @param  {Number} value   数值
   * @return {Number} 逼近的最小值
   */
  snapFloor : function(values,value){
    // 这里假定values是升序排列
    return arrayFloor(values,value);
  },
  /**
   * 获取逼近的最大值，用于对齐数据
   * @param  {Array} values   数据集合
   * @param  {Number} value   数值
   * @return {Number} 逼近的最大值
   */
  snapCeiling : function(values,value){
    // 这里假定values是升序排列
    return arrayCeiling(values,value);
  },
  /**
   * 获取角度对应的弧度
   * @param {Number} degree 角度
   * @return {Number} 弧度
   **/
  degreeToRad: function(degree) {
    return Math.PI / 180 * degree;
  },
  /**
   * 获取弧度对应的角度
   * @param {Number} rad 弧度
   * @return {Number} 角度
   **/
  radToDegree: function(rad) {
    return 180 / Math.PI * rad;
  },
  /**
   * 广义取模运算
   * @param {Number} v 被取模的值
   * @param {Number} m 模
   */
  mod: function(n, m) {
    return ( ( n % m ) + m ) % m;
  }
};



var math = gMath;

var index$16 = math;

function Matrix3() {
  this.elements = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];
}

Matrix3.multiply = function(m1, m2) {
  var te = m1.elements;
  var me = m2.elements;
  var m = new Matrix3();
  return m.set(
    te[0] * me[0] + te[3] * me[1] + te[6] * me[2], te[0] * me[3] + te[3] * me[4] + te[6] * me[5], te[0] * me[6] + te[3] * me[7] + te[6] * me[8],
    te[1] * me[0] + te[4] * me[1] + te[7] * me[2], te[1] * me[3] + te[4] * me[4] + te[7] * me[5], te[1] * me[6] + te[4] * me[7] + te[7] * me[8],
    te[2] * me[0] + te[5] * me[1] + te[8] * me[2], te[2] * me[3] + te[5] * me[4] + te[8] * me[5], te[2] * me[6] + te[5] * me[7] + te[8] * me[8]
  );
};

Matrix3.equal = function(m1, m2) {
  var m1e = m1.elements;
  var m2e = m2.elements;
  var res = true;
  for (var i = 0, l = m1e.length; i < l; i ++) {
    if (!index$16.equal(m1e[i], m2e[i])) {
      res = false;
      break;
    }
  }
  return res;
};

index$4.augment(Matrix3, {
  type: 'matrix3',
  set: function(
    n11, n12, n13,
    n21, n22, n23,
    n31, n32, n33
  ) {
    var te = this.elements;

    te[0] = n11; te[3] = n12; te[6] = n13;
    te[1] = n21; te[4] = n22; te[7] = n23;
    te[2] = n31; te[5] = n32; te[8] = n33;

    return this;
  },
  get: function(i, j) {
    i --;
    j --;
    return this.elements[j * 3 + i];
  },
  identity: function() {
    return this.set(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );
  },
  multiplyScalar: function(s) {
    var te = this.elements;

    te[0] *= s; te[3] *= s; te[6] *= s;
    te[1] *= s; te[4] *= s; te[7] *= s;
    te[2] *= s; te[5] *= s; te[8] *= s;

    return this;
  },
  det: function() {
    var te = this.elements;
    var a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
        d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
        g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

    return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
  },
  inverse: function(throwOnInvertible) {
    return this.copy(this.getInverse(throwOnInvertible));
  },
  getInverse: function(throwOnInvertible) {
    var det = this.det();
    if (det === 0) {
      if (throwOnInvertible) {
        throw 'matrix exception: get inverse matrix with 0 det';
      } else {
        console.warn('matrix cannot inverse');
        return new Matrix3();
      }
    }
    var te = this.elements;
    var a = te[ 0 ], b = te[ 3 ], c = te[ 6 ],
        d = te[ 1 ], e = te[ 4 ], f = te[ 7 ],
        g = te[ 2 ], h = te[ 5 ], i = te[ 8 ];
    var inverse = new Matrix3();
    inverse.set(
        te[4] * te[8] - te[7] * te[5] , -(te[3] * te[8] - te[6] * te[5]),   te[3] * te[7] - te[6] * te[4] ,
      -(te[1] * te[8] - te[7] * te[2]),   te[0] * te[8] - te[6] * te[2] , -(te[0] * te[7] - te[6] * te[1]),
        te[1] * te[5] - te[4] * te[2] , -(te[0] * te[5] - te[3] * te[2]),   te[0] * te[4] - te[3] * te[1]
    );
    inverse.multiplyScalar(1 / det);
    return inverse;
  },
  transpose: function() {
    var tmp, te = this.elements;
    tmp = te[1]; te[1] = te[3]; te[3] = tmp;
    tmp = te[2]; te[2] = te[6]; te[6] = tmp;
    tmp = te[5]; te[5] = te[7]; te[7] = tmp;
    return this;
  },
  multiply: function(m) {
    return this.copy(Matrix3.multiply(this, m));
  },
  translate: function(x, y) {
    var t = new Matrix3();
    t.set(
      1, 0, x,
      0, 1, y,
      0, 0, 1
    );
    return this.copy(Matrix3.multiply(t, this));
  },
  rotate: function(rad) {
    var r = new Matrix3();
    r.set(
      Math.cos(rad), -Math.sin(rad), 0,
      Math.sin(rad), Math.cos(rad), 0,
      0, 0, 1
    );
    return this.copy(Matrix3.multiply(r, this));
  },
  scale: function(s1, s2) {
    var s = new Matrix3();
    s.set(
      s1, 0, 0,
      0, s2, 0,
      0, 0,  1
    );
    return this.copy(Matrix3.multiply(s, this));
  },
  equal: function(m) {
    return Matrix3.equal(this, m);
  },
  copy: function(m) {
    var me = m.elements;
    var te = this.elements;
    for (var i = 0, l = me.length; i < l; i ++) {
      te[i] = me[i];
    }
    return this;
  },
  clone: function() {
    var m = new Matrix3();
    var me = m.elements;
    var te = this.elements;
    for (var i = 0, l = te.length; i < l; i ++) {
      me[i] = te[i];
    }
    return m;
  },
  to2DObject: function() {
    var te = this.elements;
    return {
      a: te[0],
      b: te[1],
      c: te[3],
      d: te[4],
      e: te[6],
      f: te[7]
    };
  },
  from2DObject: function(obj) {
    var te = this.elements;
    te[0] = obj.a;
    te[1] = obj.b;
    te[3] = obj.c;
    te[4] = obj.d;
    te[6] = obj.e;
    te[7] = obj.f;
    return this;
  }
});


var matrix3 = Matrix3;

function Vector2(x, y) {
  if (arguments.length === 1) {
    var arr = x;
    x = arr[0];
    y = arr[1];
  }
  this.x = x || 0;
  this.y = y || 0;
}

// v1 v2 和
Vector2.add = function(v1, v2) {
  return new Vector2(v1.x + v2.x, v1.y + v2.y);
};

// v1 v2 差
Vector2.sub = function(v1, v2) {
  return new Vector2(v1.x - v2.x, v1.y - v2.y);
};

// v1 v2 插值
Vector2.lerp = function(v1, v2, alpha) {
  return new Vector2(v1.x + (v2.x - v1.x) * alpha, v1.y + (v2.y - v1.y) * alpha);
};

// v1 v2 夹角
Vector2.angle = function(v1, v2) {
  var theta = v1.dot(v2) / (v1.length() * v2.length());

  return Math.acos(index$16.clamp(theta, -1, 1));
};

// v1 到 v2 夹角的方向
Vector2.direction = function(v1, v2) { // >= 0 顺时针 < 0 逆时针
  return v1.x * v2.y - v2.x * v1.y;
};



index$4.augment(Vector2, {
  type: 'vector2',
  set: function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  setComponent: function(index, value) {
    switch(index) {
      case 0: this.x = value; return this;
      case 1: this.y = value; return this;
      default: throw new Error('the index out of range:' + index);
    }
  },
  getComponent: function(index) {
    switch(index) {
      case 0: return this.x;
      case 1: return this.y;
      default: throw new Error('the index out of range:' + index);
    }
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },
  add: function(v) {
    return this.copy(Vector2.add(this, v));
  },
  sub: function(v) {
    return this.copy(Vector2.sub(this, v));
  },
  subBy: function(v) {
    return this.copy(Vector2.sub(v, this));
  },
  multiplyScaler: function(s) {
    this.x *= s;
    this.y *= s;
    return this;
  },
  divideScaler: function(s) {
    if (s !== 0) {
      var invScaler = 1 / s;
      this.x *= invScaler;
      this.y *= invScaler;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  },
  min: function(v) {
    if (this.x > v.x) {
      this.x = v.x;
    }

    if (this.y > v.y) {
      this.y = v.y;
    }
    return this;
  },
  max: function(v) {
    if (this.x < v.x) {
      this.x = v.x;
    }

    if (this.y < v.y) {
      this.y = v.y;
    }

    return this;
  },
  clamp: function(min, max) {
    if (this.x < min.x) {
      this.x = min.x;
    } else if (this.x > max.x){
      this.x = max.x;
    }

    if (this.y < min.y) {
      this.y = min.y;
    } else if (this.y > max.y) {
      this.y = max.y;
    }

    return this;
  },
  clampScale: (function() {
    var min, max;
    return function (minVal, maxVal) {
      if (min === undefined) {
        min = new Vector2();
        max = new Vector2();
      }
      min.set(minVal, minVal);
      max.set(maxVal, maxVal);

      return this.clamp(min, max);
    };
  })(),
  floor: function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  },
  ceil: function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  },
  round: function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  },
  roundToZero: function() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  },
  negate: function() {
    this.x = - this.x;
    this.y = - this.y;
    return this;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y;
  },
  lengthSq: function() {
    return this.x * this.x + this.y * this.y;
  },
  length: function() {
    return Math.sqrt(this.lengthSq());
  },
  normalize: function() {
    return this.divideScaler(this.length());
  },
  distanceToSquared: function(v) {
    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  },
  distanceTo: function(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },
  angleTo: function(v, direct) {
    var angle = this.angle(v);
    var angleLargeThanPi = Vector2.direction(this, v) >= 0;
    if (direct) {
      if (angleLargeThanPi) {
        return Math.PI * 2 - angle;
      } else {
        return angle;
      }
    } else {
      if (angleLargeThanPi) {
        return angle;
      } else {
        return Math.PI * 2 - angle;
      }
    }
  },
  vertical: function(left) {
    if (left) {
      return new Vector2(this.y, -this.x);
    } else {
      return new Vector2(-this.y, this.x);
    }
  },
  angle: function(v) {
    return Vector2.angle(this, v);
  },
  setLength: function(l) {
    var oldLength = this.length();
    if (oldLength !== 0 && l !== oldLength) {
      this.multiplyScaler(l / oldLength);
    }
    return this;
  },
  isZero: function() {
    return this.x === 0 && this.y === 0;
  },
  lerp: function(v, alpha) {
    return this.copy(Vector2.lerp(this, v, alpha));
  },
  equal: function(v) {
    return index$16.equal(this.x, v.x) && index$16.equal(this.y, v.y);
  },
  clone: function() {
    return new Vector2(this.x, this.y);
  },
  rotate: function(angle) {
    var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
    var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

    this.x = nx;
    this.y = ny;

    return this;
  }
});

var vector2 = Vector2;

function Vector3$1(x, y, z) {
  if (arguments.length === 1) {
    if (index$4.isArray(x)) {
      var arr = x;
      x = arr[0];
      y = arr[1];
      z = arr[2];
    } else if (x.type === 'vector2') {
      var v = x;
      x = v.x;
      y = v.y;
      z = 1;
    }
  }
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector3$1.add = function(v1, v2) {
  return new Vector3$1(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};

Vector3$1.sub = function(v1, v2) {
  return new Vector3$1(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};

Vector3$1.lerp = function(v1, v2, alpha) {
  return new Vector3$1(
    v1.x + (v2.x - v1.x) * alpha,
    v1.y + (v2.y - v1.y) * alpha,
    v1.z + (v2.z - v1.z) * alpha
  );
};

Vector3$1.cross = function(v, w) {
  var vx = v.x, vy = v.y, vz = v.z;
  var wx = w.x, wy = w.y, wz = w.z;
  return new Vector3$1(
    vy * wz - vz * wy,
    vz * wx - vx * wz,
    vx * wy - vy * wx
  );
};

Vector3$1.angle = function(v1, v2) {
  var theta = v1.dot(v2) / (v1.length() * v2.length());

  return Math.acos(index$16.clamp(theta, -1, 1));
};

index$4.augment(Vector3$1, {
  type: 'vector3',
  set: function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  setComponent: function(index, value) {
    switch(index) {
      case 0: this.x = value; return this;
      case 1: this.y = value; return this;
      case 2: this.z = value; return this;
      default: throw new Error('index is out of range:' + index);
    }
  },
  getComponent: function(index) {
    switch(index) {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: throw new Error('index is out of range:' + index);
    }
  },
  add: function(v) {
    return this.copy(Vector3$1.add(this, v));
  },
  sub: function(v) {
    return this.copy(Vector3$1.sub(this, v));
  },
  subBy: function(v) {
    return this.copy(Vector3$1.sub(v, this));
  },
  multiplyScaler: function(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  },
  divideScaler: function(s) {
    if (s !== 0) {
      var invs = 1 / s;
      this.x *= invs;
      this.y *= invs;
      this.z *= invs;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  },
  min: function(v) {
    if (this.x > v.x) {
      this.x = v.x;
    }
    if (this.y > v.y) {
      this.y = v.y;
    }
    if (this.z > v.z) {
      this.z = v.z;
    }
    return this;
  },
  max: function(v) {
    if (this.x < v.x) {
      this.x = v.x;
    }
    if (this.y < v.y) {
      this.y = v.y;
    }
    if (this.z < v.z) {
      this.z = v.z;
    }
    return this;
  },
  clamp: function(min, max) {
    if (this.x < min.x) {
      this.x = min.x;
    } else if (this.x > max.x){
      this.x = max.x;
    }

    if (this.y < min.y) {
      this.y = min.y;
    } else if (this.y > max.y){
      this.y = max.y;
    }

    if (this.z < min.z) {
      this.z = min.z;
    } else if (this.z > max.z) {
      this.z = max.z;
    }
    return this;
  },
  clampScale: function() {
    var min, max;
    return function(minVal, maxVal) {
      if (min === undefined) {
        min = new Vector3$1();
        max = new Vector3$1();
      }
      min.set(minVal, minVal, minVal);
      max.set(maxVal, maxVal, maxVal);

      return this.clamp(min, max);
    };
  }(),
  floor: function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  },
  ceil: function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  },
  round: function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  },
  roundToZero: function() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
    return this;
  },
  negate: function() {
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;

    return this;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  lengthSq: function() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },
  length: function() {
    return Math.sqrt(this.lengthSq());
  },
  lengthManhattan: function() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  },
  normalize: function() {
    return this.divideScaler(this.length());
  },
  setLength: function(l) {
    var oldLength = this.length();

    if (oldLength !== 0 && l !== oldLength) {
        this.multiplyScaler(l / oldLength);
    }
    return this;
  },
  lerp: function(v, alpha) {
    return this.copy(Vector3$1.lerp(this, v, alpha));
  },
  cross: function(v) {
    return this.copy(Vector3$1.cross(this, v));
  },
  // angleTo: function(v) {
  //   var theta = this.dot(v) / (this.length() * v.length());

  //   return Math.acos(gMath.clamp(theta, -1, 1));
  // },
  angle: function(v) {
    return Vector3$1.angle(this, v);
  },
  distanceToSquared: function(v) {
    var dx = this.x - v.x;
    var dy = this.y - v.y;
    var dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  },
  distanceTo: function(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },
  applyMatrix: function(m) {
    var me = m.elements;
    var x = me[0] * this.x + me[3] * this.y + me[6] * this.z;
    var y = me[1] * this.x + me[4] * this.y + me[7] * this.z;
    var z = me[2] * this.x + me[5] * this.y + me[8] * this.z;

    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z !== undefined ? v.z : 1;
    return this;
  },
  equal: function(v) {
    return index$16.equal(this.x, v.x)
        && index$16.equal(this.y, v.y)
        && index$16.equal(this.z, v.z);
  },
  clone: function() {
    return new Vector3$1(this.x, this.y, this.z);
  }
});

var vector3 = Vector3$1;

var gMatrix = {
  Matrix3: matrix3,
  Vector2: vector2,
  Vector3: vector3
};

var index$14 = gMatrix;

var Vector3$2 = index$14.Vector3;

var ALIAS_ATTRS = ['strokeStyle', 'fillStyle', 'globalAlpha'];
var CLIP_SHAPES = ['circle', 'ellipse', 'fan', 'polygon', 'rect', 'path'];
var CAPITALIZED_ATTRS_MAP = {
  r: 'R',
  opacity: 'Opacity',
  lineWidth: 'LineWidth',
  clip: 'Clip',
  stroke: 'Stroke',
  fill: 'Fill',
  strokeOpacity: 'Stroke',
  fillOpacity: 'Fill',
  x: 'X',
  y: 'Y',
  rx: 'Rx',
  ry: 'Ry',
  re: 'Re',
  rs: 'Rs',
  width: 'Width',
  height: 'Height',
  img: 'Img',
  x1: 'X1',
  x2: 'X2',
  y1: 'Y1',
  y2: 'Y2',
  points: 'Points',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
  text: 'Text',
  radius: 'Radius',
  textAlign: 'TextAlign',
  textBaseline: 'TextBaseline',
  font: 'Font',
  fontSize: 'FontSize',
  fontStyle: 'FontStyle',
  fontVariant: 'FontVariant',
  fontWeight: 'FontWeight',
  fontFamily: 'FontFamily',
  clockwise: 'Clockwise',
  startAngle: 'StartAngle',
  endAngle: 'EndAngle',
  path: 'Path'
};
var ALIAS_ATTRS_MAP = {
  stroke: 'strokeStyle',
  fill: 'fillStyle',
  opacity: 'globalAlpha'
};

var attributes = {
  canFill: false,
  canStroke: false,
  initAttrs: function (attrs) {
    this.__attrs = {
      opacity: 1,
      fillOpacity: 1,
      strokeOpacity: 1
    };
    this.attr(index$8.assign(this.getDefaultAttrs(), attrs));
    return this;
  },
  getDefaultAttrs: function () {
    return {};
  },

  /**
   * 设置或者设置属性，有以下 4 种情形：
   *   - name 不存在, 则返回属性集合
   *   - name 为字符串，value 为空，获取属性值
   *   - name 为字符串，value 不为空，设置属性值，返回 this
   *   - name 为键值对，value 为空，设置属性值
   *
   * @param  {String | Object} name  属性名
   * @param  {*} value 属性值
   * @return {*} 属性值
   */
  attr: function (name, value) {
    var self = this;
    if (arguments.length === 0) {
      return self.__attrs;
    }

    if (index$8.isObject(name)) {
      for (var k in name) {
        if (ALIAS_ATTRS.indexOf(k) === -1) {
          var v = name[k];
          self._setAttr(k, v);
        }
      }
      if (self.__afterSetAttrAll) {
        self.__afterSetAttrAll(name);
      }
      // self.setSilent('box', null);
      self.clearBBox();
      return self;
    }
    if (arguments.length === 2) {
      if (self._setAttr(name, value) !== false) {
        var m = '__afterSetAttr' + CAPITALIZED_ATTRS_MAP[name];
        if (self[m]) {
          self[m](value);
        }
      }
      // self.setSilent('box', null);
      self.clearBBox();
      return self;
    }
    return self._getAttr(name);
  },
  clearBBox: function () {
    this.setSilent('box', null);
  },
  __afterSetAttrAll: function () {},

  // 属性获取触发函数
  _getAttr: function (name) {
    return this.__attrs[name];
  },

  // 属性设置触发函数
  _setAttr: function (name, value) {
    var self = this;
    if (name === 'clip') {
      self.__setAttrClip(value);
      self.__attrs.clip = value;
    } else {
      self.__attrs[name] = value;
      var alias = ALIAS_ATTRS_MAP[name];
      if (alias) {
        self.__attrs[alias] = value;
      }
    }
    return self;
  },
  hasFill: function () {
    return this.canFill && this.__attrs.fillStyle;
  },
  hasStroke: function () {
    return this.canStroke && this.__attrs.strokeStyle;
  },

  // 设置透明度
  __setAttrOpacity: function (v) {
    this.__attrs.globalAlpha = v;
    return v;
  },
  __setAttrClip: function (clip) {
    var self = this;
    if (clip && CLIP_SHAPES.indexOf(clip.type) > -1) {
      if (clip.get('canvas') === null) {
        clip = index$8.clone(clip);
      }
      clip.set('parent', self.get('parent'));
      clip.set('context', self.get('context'));
      clip.inside = function (x, y) {
        var v = new Vector3$2(x, y, 1);
        clip.invert(v, self.get('canvas')); // 已经在外面转换
        return clip.__isPointInFill(v.x, v.y);
      };
      return clip;
    }
    return null;
  }
};

var Matrix3$1 = index$14.Matrix3;

// 是否未改变
function isUnchanged(m) {
  var elements = m.elements;
  return elements[0] === 1 && elements[1] === 0 && elements[3] === 0 && elements[4] === 1 && elements[6] === 0 && elements[7] === 0;
}

// 是否仅仅是scale
function isScale(m) {
  var elements = m.elements;
  return elements[1] === 0 && elements[3] === 0 && elements[6] === 0 && elements[7] === 0;
}

function multiple(m1, m2) {
  if (!isUnchanged(m2)) {
    if (isScale(m2)) {
      m1.elements[0] *= m2.elements[0];
      m1.elements[4] *= m2.elements[4];
    } else {
      m1.multiply(m2);
    }
  }
}

var transform = {
  initTransform: function () {
    this.__m = new Matrix3$1();
  },
  translate: function (tx, ty) {
    this.__m.translate(tx, ty);
    this.clearTotalMatrix();
    return this;
  },
  rotate: function (angle) {
    this.__m.rotate(angle); // 仅支持弧度，不再支持角度
    this.clearTotalMatrix();
    return this;
  },
  scale: function (s1, s2) {
    this.__m.scale(s1, s2);
    this.clearTotalMatrix();
    return this;
  },

  /**
   * 绕起始点旋转
   * @param  {Number} rotate 0～360
   */
  rotateAtStart: function (rotate) {
    var x = this.attr('x');
    var y = this.attr('y');
    if (Math.abs(rotate) > Math.PI * 2) {
      rotate = rotate / 180 * Math.PI;
    }
    this.transform([['t', -x, -y], ['r', rotate], ['t', x, y]]);
  },

  /**
   * 移动的到位置
   * @param  {Number} x 移动到x
   * @param  {Number} y 移动到y
   */
  move: function (x, y) {
    var cx = this.get('x') || 0; // 当前的x
    var cy = this.get('y') || 0; // 当前的y
    this.translate(x - cx, y - cy);
    this.set('x', x);
    this.set('y', y);
  },
  transform: function (ts) {
    var self = this;
    index$8.each(ts, function (t) {
      switch (t[0]) {
        case 't':
          self.translate(t[1], t[2]);
          break;
        case 's':
          self.scale(t[1], t[2]);
          break;
        case 'r':
          self.rotate(t[1]);
          break;
        case 'm':
          self.__m = Matrix3$1.multiply(t[1], self.__m);
          self.clearTotalMatrix();
          break;
        default:
          break;
      }
    });
    return self;
  },
  setTransform: function (ts) {
    this.__m.identity();
    return this.transform(ts);
  },
  getMatrix: function () {
    return this.__m;
  },
  setMatrix: function (m) {
    this.__m = m;
    this.clearTotalMatrix();
    return this;
  },
  apply: function (v, root) {
    var m = void 0;
    if (root) {
      m = this._getMatrixByRoot(root);
    } else {
      m = this.__m;
    }
    v.applyMatrix(m);
    return this;
  },

  // 获取到达指定根节点的矩阵
  _getMatrixByRoot: function (root) {
    var self = this;
    root = root || self;
    var parent = self;
    var parents = [];

    while (parent !== root) {
      parents.unshift(parent);
      parent = parent.get('parent');
    }
    parents.unshift(parent);

    var m = new Matrix3$1();
    index$8.each(parents, function (child) {
      m.multiply(child.__m);
    });
    return m;
  },

  /**
   * 应用到当前元素上的总的矩阵
   * @return {Matrix} 矩阵
   */
  getTotalMatrix: function () {
    var m = this.__cfg.totalMatrix;
    if (!m) {
      m = new Matrix3$1();
      var parent = this.__cfg.parent;
      if (parent) {
        var pm = parent.getTotalMatrix();
        /* if (!isUnchanged(pm)) {
          m.multiply(pm);
        } */
        multiple(m, pm);
      }
      /* if (!isUnchanged(this.__m)) {
        m.multiply(this.__m);
      } */
      multiple(m, this.__m);
      this.__cfg.totalMatrix = m;
    }
    return m;
  },

  // 清除当前的矩阵
  clearTotalMatrix: function () {
    // this.__cfg.totalMatrix = null;
  },
  invert: function (v) {
    var m = this.getTotalMatrix();
    // 单精屏幕下大多数矩阵没变化
    if (isScale(m)) {
      v.x /= m.elements[0];
      v.y /= m.elements[4];
    } else {
      var inm = m.getInverse();
      v.applyMatrix(inm);
    }
    return this;
  },
  resetTransform: function (context) {
    var mo = this.__m.to2DObject();
    // 不改变时
    if (!isUnchanged(this.__m)) {
      context.transform(mo.a, mo.b, mo.c, mo.d, mo.e, mo.f);
    }
  }
};

var Base;

// copy attr
function initClassAttrs(c){
  if(c._attrs || c === Base){
    return;
  }

  var superCon = c.superclass.constructor;
  if(superCon && !superCon._attrs){
    initClassAttrs(superCon);
  }
  c._attrs =  {};
  
  index$4.mix(true,c._attrs,superCon._attrs);
  index$4.mix(true,c._attrs,c.ATTRS);
}

Base = function (cfg) {
  initClassAttrs(this.constructor); // 初始化类的属性
  this._attrs = {}; // 存放变量
  this.events = {};
  var defaultCfg = this.getDefaultCfg(); 
  index$4.mix(this._attrs,defaultCfg,cfg); // 复制属性到对象
};

index$4.augment(Base,{

  /**
   * @protected
   * get the default cfg
   * @return {Object} default cfg
   */
  getDefaultCfg: function(){
    var _self = this,
      con = _self.constructor,
      attrs = con._attrs,
      rst = index$4.mix(true,{},attrs);
    return rst;
  },
  /**
   * 设置属性信息
   * @protected
   */
  set : function(name,value){
    var m = '_onRender' + index$4.ucfirst(name);
    if(this[m]){
      this[m](value,this._attrs[name]);
    }
    this._attrs[name] = value;
    return this;
  },
  /**
   * get the property
   * @protected
   */
  get : function(name){
    return this._attrs[name];
  },
  /**
   * bind event
   * @param  {String}   eventType event type
   * @param  {Function} fn  callback function
   */
  on : function(eventType,fn){

    var self = this,
      events = self.events,
      callbacks = events[eventType];

    if(!callbacks){
      callbacks = events[eventType] = [];
    }
    callbacks.push(fn);
    return self;
  },
  /**
   * fire the event
   * @param  {String} eventType event type
   */
  fire : function(eventType,eventObj){
    var _self = this,
      events = _self.events,
      callbacks = events[eventType];
    if(callbacks){
      index$4.each(callbacks,function(m){
        m(eventObj);
      });
    }
  },
  /**
   * remove the event
   * @param  {String}   eventType event type
   * @param  {Function} fn  the callback function
   */
  off : function(eventType,fn){
    var self = this,
      events = self.events,
      callbacks = events[eventType];
    if(!eventType){
      self.events = {};
      return self;
    }    
    if(callbacks){
      index$4.remove(callbacks,fn);
    }
    return self;
  },
  /**
   * 析构函数
   */
  destroy : function(){
    var self = this;
    var destroyed = self.destroyed;

    if(destroyed){
      return self;
    }
    self._attrs = {};
    self.events = {};
    self.destroyed = true;
  }

});



var base = Base;

var index$20 = base;

function path(a, b) {
  var curves = index$2.toCurve(a.path, b.path);
  var curvea = curves[0];
  var curveb = curves[1];
  return function(t) {
    var rst = [];
    if(t >= 1){
      return b.path;
    }
    if(t <= 0){
      return a.path;
    }
    for (var i = 0; i < curvea.length; i++) {
      rst[i] = [curvea[i][0]];
      for (var j = 1; j < curvea[i].length; j++) {
        rst[i][j] = (curveb[i][j] - curvea[i][j])*t + curvea[i][j];
      }
    }
    return rst;
  }
}

var path_1 = {
  path: path
};

function number(a, b) {
  a = +a;
  b = +b;
  return function(t) {
    return a * (1 - t) + b * t;
  };
}

function unNumber(a, b) {
  b -= a;
  return function(x) {
    return b === 0 ? 0 : (x - a) / b;
  }
}

var number_1 = {
  number: number,
  unNumber: unNumber
};

var HSL = function() {
  this.h = 0;
  this.s = 0;
  this.l = 0;
};

index$4.augment(HSL, {
  type: 'hsl',
  setHSL: function(h, s, l, a) {
    this.h = index$16.mod(h, 1);
    this.s = index$16.clamp(s, 0, 1);
    this.l = index$16.clamp(l, 0, 1);
    if (a !== undefined) {
      this.a = index$16.clamp(a, 0, 1);
    } else {
      this.a = undefined;
    }
  },
  toRGB: function () {
    function hue2rgb( p, q, t ) {
      if ( t < 0 ) t += 1;
      if ( t > 1 ) t -= 1;
      if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
      if ( t < 1 / 2 ) return q;
      if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
      return p;
    }
    return function () {
      // h,s,l ranges are in 0.0 - 1.0

      var self = this;
      var h = self.h;
      var s = self.s;
      var l = self.l;

      if ( s === 0 ) {
        return {
          r: l,
          g: l,
          b: l,
          a: self.a
        };
      } else {
        var p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
        var q = ( 2 * l ) - p;
      }
      return {
        r: hue2rgb( q, p, h + 1 / 3 ),
        g: hue2rgb( q, p, h ),
        b: hue2rgb( q, p, h - 1 / 3 ),
        a: self.a
      };
    };
  }(),
  clone: function() {
    var hsl = new HSL();
    hsl.h = this.h;
    hsl.s = this.s;
    hsl.l = this.l;
    hsl.a = this.a;
    return hsl;
  },
  copy: function(hsl) {
    this.h = hsl.h;
    this.s = hsl.s;
    this.l = hsl.l;
    this.a = hsl.a;
    return this;
  },
  getStyle: function() {
    var self = this;
    if (self.a === undefined) {
      return 'hsl(' + Math.round(self.h * 360) + ', ' + Math.round(self.s * 100) + '%, ' + Math.round(self.l * 100) + '%)';
    } else {
      return 'hsla(' + Math.round(self.h * 360) + ', ' + Math.round(self.s * 100) + '%, ' + Math.round(self.l * 100) + '%, ' + self.a +')';
    }
  }
});

var hsl$1 = HSL;

var RGB = function() {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.type = 'rgb';
};

index$4.augment(RGB, {
  type: 'rgb',
  setRGB: function(r, g, b, a) {
    this.r = index$16.clamp(r, 0, 1);
    this.g = index$16.clamp(g, 0, 1);
    this.b = index$16.clamp(b, 0, 1);
    if (a !== undefined) {
      this.a = index$16.clamp(a, 0, 1);
    } else {
      this.a = undefined;
    }
  },
  toHSL: function() {
    // h,s,l ranges are in 0.0 - 1.0
    var r = this.r, g = this.g, b = this.b;
    var max = Math.max( r, g, b );
    var min = Math.min( r, g, b );
    var hue, saturation;
    var lightness = ( min + max ) / 2.0;
    if ( min === max ) {
      hue = 0;
      saturation = 0;
    } else {
      var delta = max - min;
      saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );
      switch ( max ) {
        case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
        case g: hue = ( b - r ) / delta + 2; break;
        case b: hue = ( r - g ) / delta + 4; break;
      }
      hue /= 6;
    }

    return {
      h: hue,
      s: saturation,
      l: lightness,
      a: this.a
    };
  },
  getHex: function() {
    var hex = ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;
    return '#' + ('000000' + hex.toString(16)).slice(-6);
  },
  getStyle: function() {
    if (this.a === undefined) {
      return 'rgb(' + Math.round(this.r * 255).toString() + ', ' + Math.round(this.g * 255).toString() + ', ' + Math.round(this.b * 255).toString() + ')';
    } else {
      return 'rgba(' + Math.round(this.r * 255).toString() + ', ' + Math.round(this.g * 255).toString() + ', ' + Math.round(this.b * 255).toString() + ', ' + this.a + ')';
    }
  },
  getPreStyle: function() {
    if (this.a === undefined) {
      return 'rgb(' + Math.round(this.r * 100).toString() + '%, ' + Math.round(this.g * 100).toString() + '%, ' + Math.round(this.b * 100).toString() + '%)';
    } else {
      return 'rgba(' + Math.round(this.r * 100).toString() + '%, ' + Math.round(this.g * 100).toString() + '%, ' + Math.round(this.b * 100).toString() + '%, ' + this.a + ')';
    }
  },
  clone: function() {
    var rgb = new RGB();
    rgb.r = this.r;
    rgb.g = this.g;
    rgb.b = this.b;
    rgb.a = this.a;
    return rgb;
  },
  copy: function(rgb) {
    this.r = rgb.r;
    this.g = rgb.g;
    this.b = rgb.b;
    this.a = rgb.a;
    return this;
  }
});


var rgb$1 = RGB;

var colorKeywords = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };

var regex = {
  hex: /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/,                                          // #ffffff or #fff
  space: /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)$/,                                          // rbg | rgba | hsl | hsla
  rgbNum: /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/,                                       // rgb(255, 0, 120)
  rgbaNum: /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]*\.?[0-9]+)\s*$/,              // rgba(255, 0, 120, 0.2)
  rgbPre: /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*$/,                                 // rgb(100%, 20%, 50%)
  rgbaPre: /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*([0-9]*\.?[0-9]+)\s*$/,        // rgba(100%, 20%, 50%, 0.1)
  hsl: /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*$/,                          // hsl(360, 100%, 100%)
  hsla: /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*([0-9]*\.?[0-9]+)\s*$/  // hsla(360.0, 100%, 100%, 0.2)
};


function Color(color) {
  this.space = {};
  if(index$4.isString(color)) {
    this.setStyle(color);
  } else if(color instanceof Color){
    this.copy(color);
  }
}

index$4.augment(Color, {
  getType: function() {
    return this.space.type;
  },
  toRGB: function() {
    var space = this.space;
    if (space.type !== 'rgb') {
      var rgb = space.toRGB();
      this.setRGB(rgb.r, rgb.g, rgb.b, rgb.a);
    }
  },
  toHSL: function() {
    var space = this.space;
    if (space.type !== 'hsl') {
      var hsl = space.toHSL();
      this.setHSL(hsl.h, hsl.s, hsl.l, hsl.a);
    }
  },
  getR: function() {
    this.toRGB();
    return this.space.r;
  },
  getG: function() {
    this.toRGB();
    return this.space.g;
  },
  getB: function() {
    this.toRGB();
    return this.space.b;
  },
  getH: function() {
    this.toHSL();
    return this.space.h;
  },
  getS: function() {
    this.toHSL();
    return this.space.s;
  },
  getL: function() {
    this.toHSL();
    return this.space.l;
  },
  getA: function() {
    return this.space.a;
  },
  multiplyA: function(a) {
    if (a === undefined) {
      return this;
    }
    if (this.space.a === undefined) {
      this.space.a = 1;
    }
    this.space.a *= a;
    return this;
  },
  getRGBStyle: function() {
    this.toRGB();
    return this.space.getStyle();
  },
  getRGBPreStyle: function() {
    this.toRGB();
    return this.space.getPreStyle();
  },
  getHSLStyle: function() {
    this.toHSL();
    return this.space.getStyle();
  },
  getHex: function() {
    this.toRGB();
    return this.space.getHex();
  },
  setRGB: function(r, g, b, a) {
    this.space = new rgb$1();
    this.space.setRGB(r, g, b, a);
    return this;
  },
  setHSL: function(h, s, l, a) {
    this.space = new hsl$1();
    this.space.setHSL(h, s, l, a);
    return this;
  },
  setHex: function(hex) {
    this.space = new rgb$1();
    hex = Math.floor( hex );

    this.space.r = ( hex >> 16 & 255 ) / 255;
    this.space.g = ( hex >> 8 & 255 ) / 255;
    this.space.b = ( hex & 255 ) / 255;

    return this;
  },
  setStyle: function(style) {
    var m;
    if (m = regex.hex.exec(style)) {
      var hex = m[1];
      var size = hex.length;

      if (size === 3) {
        this.setRGB(
          parseInt( hex.charAt( 0 ) + hex.charAt( 0 ), 16 ) / 255,
          parseInt( hex.charAt( 1 ) + hex.charAt( 1 ), 16 ) / 255,
          parseInt( hex.charAt( 2 ) + hex.charAt( 2 ), 16 ) / 255
        );
        return this;
      } else if(size === 6) {

        this.setRGB(
          parseInt( hex.charAt( 0 ) + hex.charAt( 1 ), 16 ) / 255,
          parseInt( hex.charAt( 2 ) + hex.charAt( 3 ), 16 ) / 255,
          parseInt( hex.charAt( 4 ) + hex.charAt( 5 ), 16 ) / 255
        );
        return this;
      }
    } else if (m = regex.space.exec(style)){
      var name = m[1];
      var components = m[2];
      var color;
      switch(name) {
        case 'rgb':
          if (color = regex.rgbNum.exec(components)) {

            this.setRGB(
              parseInt(color[1], 10) / 255,
              parseInt(color[2], 10) / 255,
              parseInt(color[3], 10) / 255
            );
            return this;
          }

          if (color = regex.rgbPre.exec(components)) {
            this.setRGB(
              parseInt(color[1], 10) / 100,
              parseInt(color[2], 10) / 100,
              parseInt(color[3], 10) / 100
            );
            return this;
          }
          break;
        case 'rgba':
          if (color = regex.rgbaNum.exec(components)) {
            this.setRGB(
              parseInt(color[1], 10) / 255,
              parseInt(color[2], 10) / 255,
              parseInt(color[3], 10) / 255,
              parseFloat(color[4])
            );
            return this;
          }

          if (color = regex.rgbaPre.exec(components)) {
            this.setRGB(
              parseInt(color[1], 10) / 100,
              parseInt(color[2], 10) / 100,
              parseInt(color[3], 10) / 100,
              parseFloat(color[4])
            );
            return this;
          }
          break;
        case 'hsl':
          if (color = regex.hsl.exec(components)) {
            this.setHSL(
              parseInt(color[1], 10) / 360,
              parseInt(color[2], 10) / 100,
              parseInt(color[3], 10) / 100
            );
            return this;
          }
          break;
        case 'hsla':
          if (color = regex.hsla.exec(components)) {
            this.setHSL(
              parseInt(color[1], 10) / 360,
              parseInt(color[2], 10) / 100,
              parseInt(color[3], 10) / 100,
              parseFloat(color[4])
            );
            return this;
          }
          break;
      }
    } else {
      style = style.toLowerCase();
      if (colorKeywords[style] !== undefined) {
        this.setHex(colorKeywords[style]);
      } else {
        this.setHex(colorKeywords['black']);
      }
    }
  },
  copy: function(color) {
    this.space = color.space.clone();
  },
  clone: function() {
    return new Color(this);
  }
});


var color$1 = Color;

var index$24 = color$1;

function color(color1, color2) {
  switch(color2.getType()) {
    case 'rgb':
      return rgb(color1, color2);
    case 'hsl':
      return hsl(color1, color2);
  }
}

function unColor(color1, color2) {
  switch(color2.getType()) {
    case 'rgb':
      return unRgb(color1, color2);
    case 'hsl':
      return unHsl(color1, color2);
  }
}

function rgb(color1, color2) {
  var r1 = color1.getR();
  var g1 = color1.getG();
  var b1 = color1.getB();
  var a1 = color1.getA();


  var r2 = color2.getR() - r1;
  var g2 = color2.getG() - g1;
  var b2 = color2.getB() - b1;
  var a2 = color2.getA();

  if (a1 !== undefined || a2 !== undefined) {
    a1 = a1 || 1;
    a2 = (a2 === undefined ? 1 : a2) - a1;
  }

  return function(t) {
    var rst = new index$24();
    rst.setRGB(
      r1 + r2 * t,
      g1 + g2 * t,
      b1 + b2 * t,
      (a1 !== undefined && a2 !== undefined) ? a1 + a2 * t : undefined
    );
    return rst.getRGBStyle();
  };
}

function unRgb(color1, color2) {
  var r1 = color1.getR();
  var g1 = color1.getG();
  var b1 = color1.getB();
  var a1 = color1.getA();


  var r2 = color2.getR() - r1;
  var g2 = color2.getG() - g1;
  var b2 = color2.getB() - b1;
  var a2 = color2.getA();

  if (a1 !== undefined || a2 !== undefined) {
    a1 = a1 || 1;
    a2 = (a2 === undefined ? 1 : a2) - a1;
  }

  return function(color) {
    color = new index$24(color);
    if (!color.getType()) {
      return 0;
    }
    var r = color.getR();
    var g = color.getG();
    var b = color.getB();
    var a = color.getA();

    a = a || 1;

    var rst = 0;
    var num = 0;

    if (r2 !== 0) {
      rst += (r - r1) / r2;
      num ++;
    }
    if (g2 !== 0) {
      rst += (g - g1) / g2;
      num ++;
    }
    if (b2 !== 0) {
      rst += (b - b1) / b2;
      num ++;
    }
    if (a2 !== 0 && a2) {
      rst += (a - a1) / a2;
      num ++;
    }
    return num === 0 ? 0 : rst / num;
  }
}

function hsl(color1, color2) {
  var h1 = color1.getH();
  var s1 = color1.getS();
  var l1 = color1.getL();
  var a1 = color1.getA();

  var h2 = color2.getH() - h1;
  var s2 = color2.getS() - s1;
  var l2 = color2.getL() - l1;
  var a2 = color2.getA();

  if (a1 !== undefined || a2 !== undefined) {
    a1 = a1 || 1;
    a2 = (a2 === undefined ? 1 : a2) - a1;
  }

  return function(t) {
    var rst = new index$24();
    rst.setHSL(
      h1 + h2 * t,
      s1 + s2 * t,
      l1 + l2 * t,
      (a1 !== undefined && a2 !== undefined) ? a1 + a2 * t : undefined
    );
    return rst.getHSLStyle();
  };

}

function unHsl(color1, color2) {
  var h1 = color1.getH();
  var s1 = color1.getS();
  var l1 = color1.getL();
  var a1 = color1.getA();

  var h2 = color2.getH() - h1;
  var s2 = color2.getS() - s1;
  var l2 = color2.getL() - l1;
  var a2 = color2.getA();

  if (a1 !== undefined || a2 !== undefined) {
    a1 = a1 || 1;
    a2 = (a2 === undefined ? 1 : a2) - a1;
  }

  return function(color) {
    color = new index$24(color);
    if (!color.getType()) {
      return 0;
    }
    var h = color.getH();
    var s = color.getS();
    var l = color.getL();
    var a = color.getA();

    a = a || 1;

    var rst = 0;
    var num = 0;
    if (h2 !== 0) {
      rst += (h - h1) / h2;
      num ++;
    }

    if (s2 !== 0) {
      rst += (s - s1) / s2;
      num ++;
    }

    if (l2 !== 0) {
      rst += (l - l1) / l2;
      num ++;
    }

    if (a2 !== 0 && a2) {
      rst += (a - a1) / a2;
      num ++;
    }

    return num === 0 ? 0 : rst / num;
  }
}


var color_1 = {
  color: color,
  unColor: unColor
};

function singular(a, b) {
  if (index$4.isNumeric(a) && index$4.isNumeric(b)) {
    return number_1.number(a, b);
  } else if(index$4.isString(a) && index$4.isString(b)) {
    var color1 = new index$24(a);
    var color2 = new index$24(b);
    if (color1.getType() && color2.getType()) {
      return color_1.color(color1, color2);
    }
  }
}

function unSingular(a, b) {
  if (index$4.isNumeric(a) && index$4.isNumeric(b)) {
    return number_1.unNumber(a, b);
  } else if (index$4.isString(a) && index$4.isString(b)) {
    var color1 = new index$24(a);
    var color2 = new index$24(b);
    if (color1.getType() && color2.getType()) {
      return color_1.unColor(color1, color2);
    }
  }
}

var singular_1 = {
  singular: singular,
  unSingular: unSingular
};

function array(a, b) {
  var x = [];
  var l = Math.min(a.length, b.length);

  for (var i = 0; i < l; i ++) {
    if(index$4.isArray(a[i]) && index$4.isArray(b[i])) {
      x[i] = array(a[i], b[i]);
    } else {
      x[i] = singular_1.singular(a[i], b[i]);
    }
  }
  return function(t) {
    var c = [];
    for (var i = 0; i < l; i ++) {
      c[i] = x[i](t);
    }
    return c;
  }
}

function unArray(a, b) {
  var x = [];
  var l = Math.min(a.length, b.length);

  for (var i = 0; i < l; i ++) {
    if(index$4.isArray(a[i]) && index$4.isArray(b[i])) {
      x[i] = unArray(a[i], b[i]);
    } else {
      x[i] = singular_1.unSingular(a[i], b[i]);
    }
  }

  return function(c) {
    var l = Math.min(x.length, c.length);
    var rst = 0;
    var num = 0;
    for (var i = 0; i < l; i ++) {
      rst += x[i](c[i]);
      num ++;
    }
    return num === 0 ? 0 : rst / num;
  }
}

var array_1 = {
  array: array,
  unArray: unArray
};

function object(a, b) {
  var x = {};

  for (var k in a) {
    if (k in b) {
      x[k] = singular_1.singular(a[k], b[k]);
    }
  }

  return function(t) {
    var c = {};
    for (var k in x) {
      c[k] = x[k](t);
    }
    return c;
  }
}

function unObject(a, b) {
  var x = {};
  for (var k in a) {
    if (k in b) {
      x[k] = singular_1.unSingular(a[k], b[k]);
    }
  }

  return function(c) {
    var rst = 0;
    var num = 0;
    for (var k in x) {
      if (k in c) {
        rst += x[k](c[k]);
        num ++;
      }
    }
    return num === 0 ? 0 : rst / num;
  }
}

var object_1 = {
  object: object,
  unObject: unObject
};

var Matrix3$4 = index$14.Matrix3;

var l = 9;

function matrix(m1, m2) {
  var x = [];
  var m1e = m1.elements;
  var m2e = m2.elements;

  for (var i = 0; i < l; i ++) {
    x[i] = singular_1.singular(m1e[i], m2e[i]);
  }

  return function(t) {
    var m = new Matrix3$4();
    var me = m.elements;

    for (var i = 0; i < l; i ++) {
      me[i] = x[i](t);
    }

    return m;
  }
}

function unMatrix(m1, m2) {
  var x = [];
  var m1e = m1.elements;
  var m2e = m2.elements;

  for (var i = 0; i < l; i ++) {
    x[i] = singular_1.unSingular(m1e[i], m2e[i]);
  }

  return function(m) {
    var me = m.elements;
    var rst = 0;
    var num = 0;
    for (var i = 0; i < l; i ++) {
      var r = x[i](me[i]);
      if (r !== 0) {
        rst += r;
        num ++;
      }
    }
    return rst / num;
  }
}

var matrix_1 = {
  matrix: matrix,
  unMatrix: unMatrix
};

function interpolation(a, b) {
  if (index$4.isObject(a) && index$4.isObject(b)) {
    if ((a.type === 'matrix3') && (b.type === 'matrix3')) {
      return matrix_1.matrix(a, b);
    } else if ((a.type === 'path') && (b.type === 'path')) {
      return path_1.path(a, b);
    }
    return object_1.object(a, b);
  } else if (index$4.isArray(a) && index$4.isArray(b)) {
    return array_1.array(a, b);
  } else {
    return singular_1.singular(a, b);
  }
}

function unInterpolation(a, b) {
  if ((a.type === 'matrix3') && (b.type === 'matrix3')) {
    return matrix_1.unMatrix(a, b);
  } else if (index$4.isArray(a) && index$4.isArray(b)) {
    return array_1.unArray(a, b);
  } else if (index$4.isObject(a) && index$4.isObject(b)) {
    return object_1.unObject(a, b);
  } else {
    return singular_1.unSingular(a, b);
  }
}

var interpolation_1 = {
  interpolation: interpolation,
  unInterpolation: unInterpolation
};

var index$22 = {
  interpolation: interpolation_1.interpolation,
  unInterpolation: interpolation_1.unInterpolation
};

var ReservedProps = {
  duration: 'duration',
  destroy: 'destroy',
  delay: 'delay',
  repeat: 'repeat',
  onUpdate: 'onUpdate'
};
var Matrix3$2 = index$14.Matrix3;

var TweenUtil = {
  /**
   * 差值函数
   * @return  {Function} fun 差值函数
   */
  interpolation: index$22.interpolation,
  /**
   * 获得帧
   * @param   {Nmuber} ratio 比率
   * @param   {Object} skf 起始关键帧
   * @param   {Object} ekf 结束关键帧
   * @param   {Object} interpolations 插值器集
   * @param   {Object} target 目标图形对象
   * @return  {Object} frame 当前比率帧
   */
  getFrame: function(ratio, skf, ekf, interpolations, target) {
    var frame = {
      attrs: {},
      matrix: null
    };
    var onUpdate = ekf.onUpdate;

    for (var k in interpolations.attrs) {
      frame.attrs[k] = interpolations.attrs[k](ratio);
    }
    if(interpolations.matrix) {
      frame.matrix = interpolations.matrix(ratio);
    }
    if (index$4.isFunction(onUpdate)) {
      onUpdate(frame, ratio);
    }
    return frame;
  },
  /**
   * 获取插值函数
   * @param   {Object} startKeyFrame 起始帧
   * @param   {Object} endKeyFrame   结束帧
   * @return  {Object} interpolation 插值器集
   */
  getInterpolations: function(startKeyFrame, endKeyFrame) {
    var interpolations = {
      attrs: {},
      matrix: null
    };
    var interpolation;
    index$4.each(startKeyFrame.attrs, function(v, k) {
      interpolation = null;
      if(typeof v === typeof endKeyFrame.attrs[k]){
        if(k === 'path'){
          interpolation = TweenUtil.interpolation({
            path: v,
            type: 'path'
          }, {
            path: endKeyFrame.attrs[k],
            type: 'path'
          });
        } else {
          interpolation = TweenUtil.interpolation(v, endKeyFrame.attrs[k]);
        }
        if(interpolation) {
          interpolations.attrs[k] = interpolation;
        }
      }
    });
    if(endKeyFrame.matrix && startKeyFrame.matrix && !Matrix3$2.equal(startKeyFrame.matrix, endKeyFrame.matrix)) {
      interpolations.matrix = TweenUtil.interpolation(startKeyFrame.matrix, endKeyFrame.matrix);
    }
    return interpolations;
  },
  /**
   * 通过Props获取Frames
   * @param   {Object} target 目标图形对象
   * @param   {Object} props 目标属性(包括矩阵和图形属性)
   * @return  {Object} frames 帧集
   */
  getKeyFrameByProps: function(target, props) {
    var frames = [];
    var endKeyFrame = TweenUtil.props2frame(target, props);
    var startKeyFrame = {
      attrs: TweenUtil.getTargetAttrs(target, endKeyFrame.attrs),
      matrix: target.getMatrix()
    };
    frames[0] = startKeyFrame;
    frames[1] = endKeyFrame;
    return frames;
  },
  /**
   * 格式化Props 为 Frame
   * @param   {Object} target 目标图形对象
   * @param   {Object} props 目标属性(包括矩阵和图形属性)
   * @return  {Object} frame 帧
   */
  props2frame: function(target, props) {
    var frame = {
      matrix: null,
      attrs: {}
    };
    index$4.each(props, function(v, k) {
      if (k === 'transform' && !props['k']) {
        frame.matrix = TweenUtil.transform(target.getMatrix(), v);
      } else if (k === 'matrix') {
        frame.matrix = v;
      } else if(k === 'onUpdate') {
        frame.onUpdate = props.onUpdate;
      } else if (!ReservedProps[k]) {
        frame.attrs[k] = v;
      }
    });
    return frame;
  },
  /**
   * 变换快捷方式
   * @param  {Object} m 矩阵
   * @param  {Array} ts 变换数组同
   * @return  {Object} this 回调函数
   */
  transform: function(m, ts) {
    m = m.clone();
    index$4.each(ts, function(t) {
      switch (t[0]) {
        case 't':
          m.translate(t[1], t[2]);
          break;
        case 's':
          m.scale(t[1], t[2]);
          break;
        case 'r':
          m.rotate(t[1]);
          break;
        case 'm':
          m.multiply(t[1]);
          break;
        default:
          return false;
      }
    });
    return m;
  },
  /** 获取图形相应的图形属性
   * @param   {Object} target 目标图形对象
   * @param   {Object} attrs 参考图形属性
   * @return  {Object} rst 图形属性
   */
  getTargetAttrs: function(target, attrs) {
    var rst = {};
    var k;
    for (k in attrs) {
      rst[k] = target.attr(k);
    }
    return rst;
  }
};

var tweenUtil = TweenUtil;

var Ease = {
	linear: function (t) {
		return t;
	},
	easeInQuad: function (t) {
		return t * t;
	},
	easeOutQuad: function (t) {
		return -1 * t * (t - 2);
	},
	easeInOutQuad: function (t) {
		if ((t /= 1 / 2) < 1){
			return 1 / 2 * t * t;
		}
		return -1 / 2 * ((--t) * (t - 2) - 1);
	},
	easeInCubic: function (t) {
		return t * t * t;
	},
	easeOutCubic: function (t) {
		return 1 * ((t = t / 1 - 1) * t * t + 1);
	},
	easeInOutCubic: function (t) {
		if ((t /= 1 / 2) < 1){
			return 1 / 2 * t * t * t;
		}
		return 1 / 2 * ((t -= 2) * t * t + 2);
	},
	easeInQuart: function (t) {
		return t * t * t * t;
	},
	easeOutQuart: function (t) {
		return -1 * ((t = t / 1 - 1) * t * t * t - 1);
	},
	easeInOutQuart: function (t) {
		if ((t /= 1 / 2) < 1){
			return 1 / 2 * t * t * t * t;
		}
		return -1 / 2 * ((t -= 2) * t * t * t - 2);
	},
	easeInQuint: function (t) {
		return 1 * (t /= 1) * t * t * t * t;
	},
	easeOutQuint: function (t) {
		return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
	},
	easeInOutQuint: function (t) {
		if ((t /= 1 / 2) < 1){
			return 1 / 2 * t * t * t * t * t;
		}
		return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
	},
	easeInSine: function (t) {
		return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
	},
	easeOutSine: function (t) {
		return 1 * Math.sin(t / 1 * (Math.PI / 2));
	},
	easeInOutSine: function (t) {
		return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
	},
	easeInExpo: function (t) {
		return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
	},
	easeOutExpo: function (t) {
		return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
	},
	easeInOutExpo: function (t) {
		if (t === 0){
			return 0;
		}
		if (t === 1){
			return 1;
		}
		if ((t /= 1 / 2) < 1){
			return 1 / 2 * Math.pow(2, 10 * (t - 1));
		}
		return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
	},
	easeInCirc: function (t) {
		if (t >= 1){
			return t;
		}
		return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
	},
	easeOutCirc: function (t) {
		return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
	},
	easeInOutCirc: function (t) {
		if ((t /= 1 / 2) < 1){
			return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
		}
		return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	easeInElastic: function (t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0){
			return 0;
		}
		if ((t /= 1) == 1){
			return 1;
		}
		if (!p){
			p = 1 * 0.3;
		}
		if (a < Math.abs(1)) {
			a = 1;
			s = p / 4;
		} else{
			s = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
	},
	easeOutElastic: function (t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0){
			return 0;
		}
		if ((t /= 1) == 1){
			return 1;
		}
		if (!p){
			p = 1 * 0.3;
		}
		if (a < Math.abs(1)) {
			a = 1;
			s = p / 4;
		} else{
			s = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
	},
	easeInOutElastic: function (t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0){
			return 0;
		}
		if ((t /= 1 / 2) == 2){
			return 1;
		}
		if (!p){
			p = 1 * (0.3 * 1.5);
		}
		if (a < Math.abs(1)) {
			a = 1;
			s = p / 4;
		} else {
			s = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		if (t < 1){
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));}
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},
	easeInBack: function (t) {
		var s = 1.70158;
		return 1 * (t /= 1) * t * ((s + 1) * t - s);
	},
	easeOutBack: function (t) {
		var s = 1.70158;
		return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
	},
	easeInOutBack: function (t) {
		var s = 1.70158;
		if ((t /= 1 / 2) < 1){
			return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
		}
		return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
	},
	easeInBounce: function (t) {
		return 1 - Ease.easeOutBounce(1 - t);
	},
	easeOutBounce: function (t) {
		if ((t /= 1) < (1 / 2.75)) {
			return 1 * (7.5625 * t * t);
		} else if (t < (2 / 2.75)) {
			return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
		} else if (t < (2.5 / 2.75)) {
			return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
		} else {
			return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
		}
	},
	easeInOutBounce: function (t) {
		if (t < 1 / 2){
			return Ease.easeInBounce(t * 2) * 0.5;
		}
		return Ease.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
	}
};
var ease = Ease;

var Tween = function(cfg) {
  index$4.mix(this, cfg);
  this._init();
};

index$4.augment(Tween, {
  /**
   * 类型
   * @type {String}
   */
  type: 'tween',
  /**
   * 画布对象
   * @type {Object}
   */
  canvas: null,
  /**
   * 目标图形对象
   * @type {Object}
   */
  target: null,
  /**
   * 起始时间
   * @type {Number}
   */
  startTime: null,
  /**
   * 结束时间
   * @type {Number}
   */
  endTime: null,
  /**
   * 持续时间
   * @type {Number}
   */
  duration: null,
  /**
   * 绘制比率
   * @type {Number}
   */
  ratio: 0,
  /**
   * 动画结束后是否要被清除目标对象
   * @type {Boolean}
   */
  destroyTarget: false,
  /**
   * 是否要被清除
   * @type {Boolean}
   */
  needsDestroy: false,
  /**
   * 是否可被执行
   * @type {Boolean}
   */
  available: true,
  /**
   * 是否重复
   * @type {Boolean}
   */
  repeat: false,
  /**
   * 回调函数
   * @type {Function}
   */
  callBack: null,
  /**
   * 当前帧
   * @type {Object}
   */
  currentFrame: null,
  /**
   * 起始关键帧
   * @type {Object}
   */
  startKeyFrame: {
    attrs: null,
    matrix: null
  },
  /**
   * 结束关键帧
   * @type {Object}
   */
  endKeyFrame: {
    attrs: null,
    matrix: null
  },
  /**
   * 插值器集
   * @type {Object}
   */
  interpolations: null,
  _init: function() {
    var startTime = this.startTime;
    var duration = this.duration;
    this.endTime = startTime + duration;
  },
  /**
   * 尝试执行
   * @param  {Number} time 时间戳
   */
  tryStep: function(time) {
    var startTime = this.startTime;
    var duration = this.duration;
    var startKeyFrame = this.startKeyFrame;
    var target = this.target;
    var realStartTime = startTime;
    if(!target || target.get('destroyed')) {
      this.needsDestroy = true;
      return false;
    }
    try {
      this.step(time);
    } catch (ev) { // 异常，中断重绘
      this.needsDestroy = true;
      return false;
    }
  },
  /**
   * 执行
   * @param  {Number} time 时间戳
   */
  step: function(time) {
    var target = this.target; // 目标对象
    var startTime = this.startTime; // 开始时间
    var elapsed = time - startTime; // 逝去时间
    var duration = this.duration; // 持续时间
    var skf = this.startKeyFrame; // 开始帧
    var ekf = this.endKeyFrame; // 结束帧
    var easing = this.easing; // 缓动函数名
    var interpolations = this.interpolations;
    var ckf; // 当前帧
    var ratio; // 真实比率
    var easeRatio; // 绘制比率

    if (!index$4.isFunction(easing)) easing = ease[easing] ? ease[easing] : ease['linear'];
    ratio = elapsed / duration;
    ratio = ratio <= 0 ? 0 : ratio >= 1 ? 1 : ratio;
    easeRatio = easing(ratio);
    ckf = tweenUtil.getFrame(easeRatio, skf, ekf, interpolations, target);
    ckf.attrs && target.attr(ckf.attrs);
    ckf.matrix && target.setMatrix(ckf.matrix);
    this.ratio = ratio;
    this.currentFrame = ckf;
    this.updateStatus();
    return target;
  },
  /**
   * 更新状态
   */
  updateStatus: function() {
    var ratio = this.ratio;
    var callBack = this.callBack;
    var destroyTarget = this.destroyTarget;
    var target = this.target;
    var repeat = this.repeat;
    if (ratio >= 1) {
      if (repeat) {
        var startTime = this.startTime;
        var endTime = this.endTime;
        var duration = this.duration;
        this.startTime = startTime + duration;
        this.endTime = endTime + duration;
        this.reset();
      } else {
        this.needsDestroy = true;
        callBack && callBack.call(target);
        destroyTarget && !target.get('destroyed') && target.remove(true);
      }
    } else {
      return;
    }
  },
  /**
   * 重置当前补间
   */
  reset: function() {
    var target = this.target;
    var skf = this.startKeyFrame;
    skf.attrs && target.attr(skf.attrs);
    skf.matrix && target.setMatrix(skf.matrix);
    this.ratio = 0;
    this.needsDestroy = false;
  },
  destroy: function(){
    var target = this.target;
    var ekf = this.endKeyFrame;
    if(target && !target.get('destroyed')){
      ekf.attrs && target.attr(ekf.attrs);
      ekf.matrix && target.setMatrix(ekf.matrix);
    }
    this.destroyed = true;
  }
});

var tween$1 = Tween;

var Creator = function(cfg) {
  index$4.mix(this, cfg);
};

index$4.augment(Creator, {
  /**
   * 目标图形对象
   * @type {Object}
   */
  target: null,
  /**
   * 时间轴
   * @type {Object}
   */
  timeline: null,
  /**
   * 开始时间
   * @type {Number}
   */
  startTime: null,
  /**
   * 添加方法
   * @param {Number} time 开始时间
   * @param {Object} props 属性
   * @param {String} easing 补间动画类型
   * @param {Function} callBack 回调函数
   */
  append: function(time, props, easing, callBack){
    var id = index$4.guid('tween_');
    var target = this.target;
    var tweens = this.tweens;
    var timeline = this.timeline;
    var startTime = this.startTime;
    var frames = tweenUtil.getKeyFrameByProps(target, props);
    var startKeyFrame = frames[0]; // startKeyFrame 起始帧
    var endKeyFrame = frames[1]; // endKeyFrame   结束帧
    var interpolations = tweenUtil.getInterpolations(startKeyFrame, endKeyFrame);
    var tween;
    time = time ? time : startTime;
    if(props && props.delay) time += props.delay;
    tween = new tween$1({
      id: id,
      canvas: target.get('canvas'),
      startTime: time,
      target: target,
      easing: easing,
      callBack: callBack,
      startKeyFrame: startKeyFrame,
      endKeyFrame: endKeyFrame,
      interpolations: interpolations,
      duration: props.duration ? props.duration : 1000,
      repeat: props.repeat ? props.repeat : false,
      destroyTarget: props.destroy ? props.destroy : false
    });
    timeline && timeline.add(tween); // 如果时间轴存在，则添加到时间轴
    return this;
  }
});

var tweenCreator = Creator;

var Timeline = function(cfg) {
  Timeline.superclass.constructor.call(this, cfg);
  this._init();
};

Timeline.ATTRS = {
  /**
   * 运行到的时间
   * @type {Boolean}
   */
  time: 0,

  /**
   * 创建时间
   * @type {Number}
   */
  createTime: null,

  /**
   * 播放时间
   * @type {Number}
   */
  playTime: null,

  /**
   * 距离上次播放的暂停间隔时间
   * @type {Number}
   */
  pauseTimeSpace: 0,

  /**
   * 是否可被执行
   * @type {Boolean}
   */
  available: false,
  /**
   * 画布集
   * @type {Array}
   */
  canvases: [],

  /**
   * 补间集
   * @type {Array}
   */
  tweens: [],

  /**
   * 结束时间
   * @type {Number}
   */
  endTime: 0,

  /**
   * 是否自动播放
   * @type {Boolean}
   */
  autoPlay: false,

  /**
   * 状态
   * @type {String}
   * silent 静默
   * playing 播放
   */
  status: 'silent',

  /**
   * 自动绘制
   * @type {Boolean}
   */
  autoDraw: true
};

index$4.extend(Timeline, index$20);

index$4.augment(Timeline, {
  // 初始化
  _init: function() {
    var autoPlay = this.get('autoPlay');
    this.set('createTime', +new Date());
    if (autoPlay) {
      this.play();
    }
  },
  // 尝试设置结束时间
  _trySetEndTime: function(tween){
    var self = this;
    if (index$4.isObject(tween)) {
      self._setEndTime(tween);
    }else if (index$4.isArray(tween)) {
      index$4.each(tween, function(v, k){
        self._setEndTime(v);
      });
    }
  },
  // 尝试设置Canvas
  _trySetCanvases: function(tween){
    var self = this;
    if (index$4.isObject(tween)) {
      self._setCanvases(tween);
    }else if (index$4.isArray(tween)) {
      index$4.each(tween, function(v, k){
        self._setCanvases(v);
      });
    }
  },
  // 设置结束时间
  _setEndTime: function(tween){
    var endTime = this.get('endTime');
    var tweenEndTime = tween.endTime;
    if(tweenEndTime > endTime){
      this.set('endTime', tweenEndTime);
    }
  },
  // 设置画布
  _setCanvases: function(tween){
    var canvas = tween.canvas;
    var canvases = this.get('canvases');
    if (canvases.indexOf(canvas) === -1) {
      canvases.push(canvas);
    }
  },
  // 重置补间
  _resetTweens: function(){
    var tweens = this.get('tweens');
    tweens.sort(function(a, b){ // 需要让起始时间最小的最后重设
      return b.get('startTime')-a.get('startTime');
    });
    index$4.each(tweens, function(v) {
      v.reset();
    });
  },
  // 获取自身时间轴
  _getTime: function(){
    var playTime = this.get('playTime');
    var pauseTimeSpace = this.get('pauseTimeSpace');
    return +new Date() - playTime + pauseTimeSpace;
  },
  // 刷新 （画布刷新）
  _refresh: function(time){
    var tweens = this.get('tweens');
    var canvases = this.get('canvases');
    var autoDraw = this.get('autoDraw');
    var tweensStash = []; // 缓存未销毁的补间
    var canvasesStash = []; // 缓存当前动画涉及画布
    var canvas;
    var tween;
    for (var i = 0; i < tweens.length; i++) {
      tween = tweens[i];
      canvas = tween.canvas;
      if (tween.needsDestroy) {
        tween.destroy();
      } else if (!tween.destroyed && !tween.needsDestroy) {
        tween.tryStep(time); // 尝试运行
      }
      if (!tween.destroyed) {
        tweensStash.push(tween);
      }
      if (!index$4.inArray(canvasesStash, canvas) && !tween.destroyed){
        canvasesStash.push(canvas);
      }
    }
    if(autoDraw) {
      this.draw();
    }
    this.set('canvases', canvasesStash);
    this.set('tweens', tweensStash);
  },
  // 更新（时间和状态）
  _update: function() {
    if(!this.get('available')) {
      return; // 不可用则强制停止所有更新
    }
    var self = this;
    var tweens = self.get('tweens');
    var time;
    if(tweens.length > 0){
      time = self._getTime();
      self._refresh(time);
    }
    self.fire('update');
    index$4.requestAnimationFrame(function() {
      self._update();
    });
  },
  /**
   * 生成补间生成器
   * @param   {Object} target 图形对象
   * @param   {Number} startTime 开始时间
   * @return  {Object} tweenCreator 补间生成器
   */
  animate: function(target, startTime) {
    var tweenCreator$$1 = new tweenCreator({
      target: target,
      timeline: this,
      startTime: startTime ? startTime : 0
    });
    return tweenCreator$$1;
  },
  /**
   * 添加补间
   * @param   {Object || Array} tweens 补间
   * @return  {Object} this
   */
  add: function(tween) {
    var tweens = this.get('tweens');
    var rst;
    if (index$4.isArray(tween)) {
      rst = tweens.concat(tween);
    } else if (index$4.isObject(tween) && tween.type === 'tween') {
      tweens.push(tween);
      rst = tweens;
    } else {
      console.error('Timeline not Support this type');
    }
    this.set('tweens', rst);
    this._trySetCanvases(tween);
    this._trySetEndTime(tween);
    return this;
  },
  /**
   * 获取当前时间
   * @param {Nmuber} time 自身时间轴时间点
   */
  getNow: function() {
    var playTime = this.get('playTime');
    return playTime ? (+new Date() - playTime) : 0 ;
  },
  /**
   * 通过实际时间，获取时间轴时间 (同getNow, 0.3.x废弃)
   * @param {Nmuber} time 自身时间轴时间点
   */
  getTime: function() {
    var playTime = this.get('playTime');
    return playTime ? (+new Date() - playTime) : 0 ;
  },
  /**
   * 播放
   */
  play: function() {
    var status = this.get('status');
    if (status === 'silent') {
      this.set('playTime', +new Date());
      this.set('available', true);
      this.set('status', 'playing');
      this._update();
    }
    return this;
  },
  /**
   * 停止
   */
  stop: function(){
    this.set('status', 'silent');
    this.set('available', false);
    this.set('pauseTimeSpace', 0);
    this._resetTweens();
    this._refresh(0); // 画面刷新至初始态
    this.draw();
  },
  /**
   * 暂停
   */
  pause: function() {
    var available = this.get('available');
    if(available) this.set('pauseTimeSpace', +new Date() - this.get('playTime'));
    this.set('available', false);
    this.set('status', 'silent');
    return this;
  },
  /**
   * 重置
   */
  reset: function() {
    this.set('status', 'silent');
    this.set('available', false);
    this.set('pauseTimeSpace', 0);
    this.set('playTime', 0);
    this.set('endTime', 0);
    this.set('tweens', []);
    this.set('canvases', []);
  },
  /**
   * 绘制
   */
  draw: function() {
    var canvases = this.get('canvases');
    var canvas;
    for (var i = 0; i < canvases.length; i++) {
      canvas = canvases[i];
      !canvas.get('destroyed') && canvas.draw();
    }
    return;
  }
});

var timeline = Timeline;

timeline.Tween = tween$1;
timeline.Ease = ease;
var index$18 = timeline;

var tween = new index$18();

var animate = {
  tween: tween,
  animate: function (toProps, duration, easing, callBack) {
    var now = tween.getNow();
    var cfg = index$8.merge({}, toProps, {
      duration: duration
    });
    tween.animate(this).append(now, cfg, easing, callBack);
    if (tween.get('status') === 'silent') tween.play();
  }
};

var eventDispatcher = {
  /**
   * 事件分发器的处理函数
   */
  initEventDispatcher: function () {
    this.__listeners = {};
  },

  /**
   * 为对象注册事件
   * @param  {String} type 事件类型
   * @param  {Function} listener 回调函数
   * @return {Object} this
   */
  on: function (type, listener) {
    var listeners = this.__listeners;

    if (index$8.isNil(listeners[type])) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
    return this;
  },

  /**
   * 为对象取消事件回调
   * 三个模式
   * 模式1: 没有参数的时候，取消所有回调处理函数
   * 模式2: 只有type的时候，取消所有type的回调类别
   * 模式3: 同时具有type, listener参数时，只取消type中listener对应的回调
   * @param  {String} type 事件类型
   * @param  {Function} listener 回调函数
   * @return {Object} this
   */
  off: function (type, listener) {
    var listeners = this.__listeners;
    if (arguments.length === 0) {
      this.__listeners = {};
      return this;
    }

    if (arguments.length === 1 && index$8.isString(type)) {
      listeners[type] = [];
      return this;
    }

    if (arguments.length === 2 && index$8.isString(type) && index$8.isFunction(listener)) {
      index$8.remove(listeners[type], listener);
      return this;
    }
  },

  /**
   * 判断某个listener是否是当前对象的回调函数
   * @param  {String} type 事件类型
   * @param  {Function} listener 回调函数
   * @return {Object} this
   */
  has: function (type, listener) {
    var listeners = this.__listeners;

    if (arguments.length === 0) {
      if (!index$8.isEmpty(listeners)) {
        return true;
      }
    }

    if (arguments.length === 1) {
      if (listeners[type] && !index$8.isEmpty(listeners[type])) {
        return true;
      }
    }

    if (arguments.length === 2) {
      if (listeners[type] && listeners[type].indexOf(listener) !== -1) {
        return true;
      }
    }

    return false;
  },
  trigger: function (event) {
    var self = this;
    var listeners = self.__listeners;
    var listenersArray = listeners[event.type];
    event.target = self;
    if (!index$8.isNil(listenersArray)) {
      listenersArray.forEach(function (listener) {
        listener.call(self, event);
      });
    }
    if (event.bubbles) {
      var parent = self.get('parent');
      if (parent && !event.propagationStopped) {
        parent.trigger(event);
      }
    }
    return self;
  },

  /**
   * fire the event
   * @param  {String} eventType event type
   * @param {Object} [eventObj] event
   */
  fire: function (eventType, eventObj) {
    var event = new index$10(eventType);
    index$8.each(eventObj, function (v, k) {
      event[k] = v;
    });
    this.trigger(event);
  }
};

var regexTags = /[MLHVQTCSAZ]([^MLHVQTCSAZ]*)/ig;
var regexDot = /[^\s\,]+/ig;
var regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
var regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
var regexPR = /^p\s*([axyn])\s+(.*)/i;
var regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/ig;
var numColorCache = {};

function multiplyOpacity(color, opacity) {
  if (opacity === undefined) {
    return color;
  }
  color = new index$24(color);
  color.multiplyA(opacity);
  var type = color.getType();
  if (type === 'hsl') {
    return color.getHSLStyle();
  } else if (type === 'rgb') {
    return color.getRGBStyle();
  }
}

function addStop(steps, gradient, opacity) {
  var arr = steps.match(regexColorStop);
  index$8.each(arr, function (item) {
    item = item.split(':');
    var color = multiplyOpacity(item[1], opacity);
    gradient.addColorStop(item[0], color);
  });
}

function parseLineGradient(color, self, opacity) {
  var arr = regexLG.exec(color);
  var angle = index$8.mod(index$8.toRadian(parseFloat(arr[1])), Math.PI * 2);
  var steps = arr[2];
  var box = self.getBBox();
  var start = void 0;
  var end = void 0;

  if (angle >= 0 && angle < 0.5 * Math.PI) {
    start = {
      x: box.minX,
      y: box.minY
    };
    end = {
      x: box.maxX,
      y: box.maxY
    };
  } else if (0.5 * Math.PI <= angle && angle < Math.PI) {
    start = {
      x: box.maxX,
      y: box.minY
    };
    end = {
      x: box.minX,
      y: box.maxY
    };
  } else if (Math.PI <= angle && angle < 1.5 * Math.PI) {
    start = {
      x: box.maxX,
      y: box.maxY
    };
    end = {
      x: box.minX,
      y: box.minY
    };
  } else {
    start = {
      x: box.minX,
      y: box.maxY
    };
    end = {
      x: box.maxX,
      y: box.minY
    };
  }

  var tanTheta = Math.tan(angle);
  var tanTheta2 = tanTheta * tanTheta;

  var x = (end.x - start.x + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.x;
  var y = tanTheta * (end.x - start.x + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.y;
  var context = self.get('context');
  var gradient = context.createLinearGradient(start.x, start.y, x, y);
  addStop(steps, gradient, opacity);
  return gradient;
}

function parseRadialGradient(color, self, opacity) {
  var arr = regexRG.exec(color);
  var fx = parseFloat(arr[1]);
  var fy = parseFloat(arr[2]);
  var fr = parseFloat(arr[3]);
  var steps = arr[4];
  var box = self.getBBox();
  var context = self.get('context');
  var width = box.maxX - box.minX;
  var height = box.maxY - box.minY;
  var r = Math.sqrt(width * width + height * height) / 2;
  var gradient = context.createRadialGradient(box.minX + width * fx, box.minY + height * fy, fr, box.minX + width / 2, box.minY + height / 2, r);
  addStop(steps, gradient, opacity);
  return gradient;
}

function parsePattern(color, self) {
  var arr = regexPR.exec(color);
  var repeat = arr[1];
  var id = arr[2];
  switch (repeat) {
    case 'a':
      repeat = 'repeat';
      break;
    case 'x':
      repeat = 'repeat-x';
      break;
    case 'y':
      repeat = 'repeat-y';
      break;
    case 'n':
      repeat = 'no-repeat';
      break;
    default:
      repeat = 'no-repeat';
  }
  var img = document.getElementById(id);
  var context = self.get('context');
  var pattern = context.createPattern(img, repeat);
  return pattern;
}

var format = {
  parsePath: function (path) {
    path = path || [];
    if (index$8.isArray(path)) {
      return path;
    }

    if (index$8.isString(path)) {
      path = path.match(regexTags);
      index$8.each(path, function (item, index) {
        item = item.match(regexDot);
        if (item[0].length > 1) {
          var tag = item[0].charAt(0);
          item.splice(1, 0, item[0].substr(1));
          item[0] = tag;
        }
        index$8.each(item, function (sub, i) {
          if (!isNaN(sub)) {
            item[i] = +sub;
          }
        });
        path[index] = item;
      });
      return path;
    }
  },
  parseStyle: function (color, self, opacity) {
    if (index$8.isString(color)) {
      if (color[1] === '(' || color[2] === '(') {
        if (color[0] === 'l') {
          // regexLG.test(color)
          return parseLineGradient(color, self, opacity);
        } else if (color[0] === 'r') {
          // regexRG.test(color)
          return parseRadialGradient(color, self, opacity);
        } else if (color[0] === 'p') {
          // regexPR.test(color)
          return parsePattern(color, self);
        }
      }
      if (index$8.isNil(opacity)) {
        return color;
      }
      return multiplyOpacity(color, opacity);
    }
  },
  numberToColor: function (num) {
    // 增加缓存
    var color = numColorCache[num];
    if (!color) {
      var str = num.toString(16);
      for (var i = str.length; i < 6; i++) {
        str = '0' + str;
      }
      color = '#' + str;
      numColorCache[num] = color;
    }
    return color;
  }
};

var SHAPE_ATTRS = ['fillStyle', 'font', 'globalAlpha', 'lineCap', 'lineWidth', 'lineJoin', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'strokeStyle', 'textAlign', 'textBaseline', 'lineDash'];

var Element = function (cfg) {
  this.__cfg = {
    zIndex: 0,
    capture: true,
    visible: true,
    destroyed: false
  }; // 配置存放地

  index$8.assign(this.__cfg, this.getDefaultCfg(), cfg); // Element.CFG不合并，提升性能 合并默认配置，用户配置->继承默认配置->Element默认配置
  this.initAttrs(this.__cfg.attrs); // 初始化绘图属性
  this.initTransform(); // 初始化变换
  this.initEventDispatcher();
  this.init(); // 类型初始化
};

Element.CFG = {
  /**
   * 唯一标示
   * @type {Number}
   */
  id: null,
  /**
   * Z轴的层叠关系，Z值越大离用户越近
   * @type {Number}
   */
  zIndex: 0,
  /**
   * Canvas对象
   * @type: {Object}
   */
  canvas: null,
  /**
   * 父元素指针
   * @type {Object}
   */
  parent: null,
  /**
   * 用来设置当前对象是否能被捕捉
   * true 能
   * false 不能
   * 对象默认是都可以被捕捉的, 当capture为false时，group.getShape(x, y)方法无法获得该元素
   * 通过将不必要捕捉的元素的该属性设置成false, 来提高捕捉性能
   * @type {Boolean}
   **/
  capture: true,
  /**
   * 画布的上下文
   * @type {Object}
   */
  context: null,
  /**
   * 是否显示
   * @type {Boolean}
   */
  visible: true,
  /**
   * 是否被销毁
   * @type: {Boolean}
   */
  destroyed: false
};

index$8.augment(Element, attributes, eventDispatcher, transform, animate, {
  init: function () {
    this.setSilent('animable', true);
    var attrs = this.__attrs;
    if (attrs && attrs.rotate) {
      this.rotateAtStart(attrs.rotate);
    }
  },
  getParent: function () {
    return this.get('parent');
  },

  /**
   * 获取默认的配置信息
   * @protected
   * @return {Object} 默认的属性
   */
  getDefaultCfg: function () {
    return {};
  },
  set: function (name, value) {
    var m = '__set' + index$8.upperFirst(name);

    if (this[m]) {
      value = this[m](value);
    }
    this.__cfg[name] = value;
    return this;
  },
  setSilent: function (name, value) {
    this.__cfg[name] = value;
  },
  get: function (name) {
    return this.__cfg[name];
  },
  draw: function (context) {
    if (this.get('destroyed')) {
      return;
    }
    if (this.get('visible')) {
      this.setContext(context);
      this.drawInner(context);
      this.restoreContext(context);
    }
  },
  setContext: function (context) {
    var clip = this.__attrs.clip;
    context.save();
    if (clip) {
      // context.save();
      clip.resetTransform(context);
      clip.createPath(context);
      context.clip();
      // context.restore();
    }
    this.resetContext(context);
    this.resetTransform(context);
  },
  restoreContext: function (context) {
    context.restore();
  },
  resetContext: function (context) {
    var elAttrs = this.__attrs;
    // var canvas = this.get('canvas');
    if (!this.isGroup) {
      // canvas.registShape(this); // 快速拾取方案暂时不执行
      for (var k in elAttrs) {
        if (SHAPE_ATTRS.indexOf(k) > -1) {
          // 非canvas属性不附加
          var v = elAttrs[k];
          if (k === 'fillStyle') {
            v = format.parseStyle(v, this);
          }
          if (k === 'strokeStyle') {
            v = format.parseStyle(v, this);
          }
          if (k === 'lineDash' && context.setLineDash) {
            if (index$8.isArray(v)) {
              context.setLineDash(v);
            } else if (index$8.isString(v)) {
              context.setLineDash(v.split(' '));
            }
          } else {
            context[k] = v;
          }
        }
      }
    }
  },
  drawInner: function () /* context */{},
  show: function () {
    this.set('visible', true);
    return this;
  },
  hide: function () {
    this.set('visible', false);
    return this;
  },
  remove: function (destroy) {
    if (destroy === undefined) {
      destroy = true;
    }

    if (this.get('parent')) {
      var parent = this.get('parent');
      var children = parent.get('children');
      index$8.remove(children, this);
      // this.set('parent', null);
    }

    if (destroy) {
      this.destroy();
    }

    return this;
  },
  destroy: function () {
    var destroyed = this.get('destroyed');

    if (destroyed) {
      return;
    }
    this.__cfg = {};
    this.__attrs = null;
    this.__listeners = null;
    this.__m = null;
    this.set('destroyed', true);
  },
  __setZIndex: function (zIndex) {
    this.__cfg.zIndex = zIndex;
    if (!index$8.isNil(this.get('parent'))) {
      this.get('parent').sort();
    }
    return zIndex;
  },
  __setAttrs: function (attrs) {
    this.attr(attrs);
    return attrs;
  },
  clone: function () {
    return index$8.clone(this);
  },
  getBBox: function () {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    };
  }
});

var element = Element;

/**
 * @fileOverview 直线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2$1 = index$14.Vector2;

var line = {
  at: function (p1, p2, t) {
    return (p2 - p1) * t + p1;
  },
  pointDistance: function (x1, y1, x2, y2, x, y) {
    var d = new Vector2$1(x2 - x1, y2 - y1);
    if (d.isZero()) {
      return NaN;
    }

    var u = d.vertical();
    u.normalize();
    var a = new Vector2$1(x - x1, y - y1);
    return Math.abs(a.dot(u));
  },
  box: function (x1, y1, x2, y2, lineWidth) {
    var halfWidth = lineWidth / 2;
    var minX = Math.min(x1, x2);
    var maxX = Math.max(x1, x2);
    var minY = Math.min(y1, y2);
    var maxY = Math.max(y1, y2);

    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
    };
  },
  len: function (x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
};

/**
 * @fileOverview 二次贝赛尔曲线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2$2 = index$14.Vector2;


function quadraticAt(p0, p1, p2, t) {
  var onet = 1 - t;
  return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

function quadraticProjectPoint(x1, y1, x2, y2, x3, y3, x, y, out) {
  var t = void 0;
  var interval = 0.005;
  var d = Infinity;
  var d1 = void 0;
  var v1 = void 0;
  var v2 = void 0;
  var _t = void 0;
  var d2 = void 0;
  var i = void 0;
  var EPSILON = 0.0001;
  var v0 = new Vector2$2(x, y);

  for (_t = 0; _t < 1; _t += 0.05) {
    v1 = new Vector2$2(quadraticAt(x1, x2, x3, _t), quadraticAt(y1, y2, y3, _t));

    d1 = v1.distanceToSquared(v0);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  for (i = 0; i < 32; i++) {
    if (interval < EPSILON) {
      break;
    }

    var prev = t - interval;
    var next = t + interval;

    v1 = new Vector2$2(quadraticAt(x1, x2, x3, prev), quadraticAt(y1, y2, y3, prev));

    d1 = v1.distanceToSquared(v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      v2 = new Vector2$2(quadraticAt(x1, x2, x3, next), quadraticAt(y1, y2, y3, next));

      d2 = v2.distanceToSquared(v0);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }

  if (out) {
    out.x = quadraticAt(x1, x2, x3, t);
    out.y = quadraticAt(y1, y2, y3, t);
  }

  return Math.sqrt(d);
}

function quadraticExtrema(p0, p1, p2) {
  var a = p0 + p2 - 2 * p1;
  if (index$8.isNumberEqual(a, 0)) {
    return [0.5];
  }
  var rst = (p0 - p1) / a;
  if (rst <= 1 && rst >= 0) {
    return [rst];
  }
  return [];
}

var quadratic = {
  at: quadraticAt,
  projectPoint: function (x1, y1, x2, y2, x3, y3, x, y) {
    var rst = {};
    quadraticProjectPoint(x1, y1, x2, y2, x3, y3, x, y, rst);
    return rst;
  },

  pointDistance: quadraticProjectPoint,
  extrema: quadraticExtrema
};

/**
 * @fileOverview 三次贝赛尔曲线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2$3 = index$14.Vector2;


function cubicAt(p0, p1, p2, p3, t) {
  var onet = 1 - t;
  return onet * onet * (onet * p3 + 3 * t * p2) + t * t * (t * p0 + 3 * onet * p1);
}

function cubicDerivativeAt(p0, p1, p2, p3, t) {
  var onet = 1 - t;
  return 3 * (((p1 - p0) * onet + 2 * (p2 - p1) * t) * onet + (p3 - p2) * t * t);
}

function cubicProjectPoint(x1, y1, x2, y2, x3, y3, x4, y4, x, y, out) {
  var t = void 0;
  var interval = 0.005;
  var d = Infinity;
  var _t = void 0;
  var v1 = void 0;
  var d1 = void 0;
  var d2 = void 0;
  var v2 = void 0;
  var prev = void 0;
  var next = void 0;
  var EPSILON = 0.0001;
  var v0 = new Vector2$3(x, y);

  for (_t = 0; _t < 1; _t += 0.05) {
    v1 = new Vector2$3(cubicAt(x1, x2, x3, x4, _t), cubicAt(y1, y2, y3, y4, _t));

    d1 = v1.distanceToSquared(v0);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  for (var i = 0; i < 32; i++) {
    if (interval < EPSILON) {
      break;
    }

    prev = t - interval;
    next = t + interval;

    v1 = new Vector2$3(cubicAt(x1, x2, x3, x4, prev), cubicAt(y1, y2, y3, y4, prev));

    d1 = v1.distanceToSquared(v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      v2 = new Vector2$3(cubicAt(x1, x2, x3, x4, next), cubicAt(y1, y2, y3, y4, next));

      d2 = v2.distanceToSquared(v0);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }

  if (out) {
    out.x = cubicAt(x1, x2, x3, x4, t);
    out.y = cubicAt(y1, y2, y3, y4, t);
  }

  return Math.sqrt(d);
}

function cubicExtrema(p0, p1, p2, p3) {
  var a = 3 * p0 - 9 * p1 + 9 * p2 - 3 * p3;
  var b = 6 * p1 - 12 * p2 + 6 * p3;
  var c = 3 * p2 - 3 * p3;
  var extrema = [];
  var t1 = void 0;
  var t2 = void 0;
  var discSqrt = void 0;

  if (index$8.isNumberEqual(a, 0)) {
    if (!index$8.isNumberEqual(b, 0)) {
      t1 = -c / b;
      if (t1 >= 0 && t1 <= 1) {
        extrema.push(t1);
      }
    }
  } else {
    var disc = b * b - 4 * a * c;
    if (index$8.isNumberEqual(disc, 0)) {
      extrema.push(-b / (2 * a));
    } else if (disc > 0) {
      discSqrt = Math.sqrt(disc);
      t1 = (-b + discSqrt) / (2 * a);
      t2 = (-b - discSqrt) / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        extrema.push(t1);
      }
      if (t2 >= 0 && t2 <= 1) {
        extrema.push(t2);
      }
    }
  }
  return extrema;
}

function base3(t, p1, p2, p3, p4) {
  var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4;
  var t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
}

function cubiclLen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
  if (index$8.isNil(z)) {
    z = 1;
  }
  z = z > 1 ? 1 : z < 0 ? 0 : z;
  var z2 = z / 2;
  var n = 12;
  var Tvalues = [-0.1252, 0.1252, -0.3678, 0.3678, -0.5873, 0.5873, -0.7699, 0.7699, -0.9041, 0.9041, -0.9816, 0.9816];
  var Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472];
  var sum = 0;
  for (var i = 0; i < n; i++) {
    var ct = z2 * Tvalues[i] + z2;
    var xbase = base3(ct, x1, x2, x3, x4);
    var ybase = base3(ct, y1, y2, y3, y4);
    var comb = xbase * xbase + ybase * ybase;
    sum += Cvalues[i] * Math.sqrt(comb);
  }
  return z2 * sum;
}

var cubic = {
  at: cubicAt,
  derivativeAt: cubicDerivativeAt,
  projectPoint: function (x1, y1, x2, y2, x3, y3, x4, y4, x, y) {
    var rst = {};
    cubicProjectPoint(x1, y1, x2, y2, x3, y3, x4, y4, x, y, rst);
    return rst;
  },

  pointDistance: cubicProjectPoint,
  extrema: cubicExtrema,
  len: cubiclLen
};

/**
 * @fileOverview 圆弧线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2$4 = index$14.Vector2;


function circlePoint(cx, cy, r, angle) {
  return {
    x: Math.cos(angle) * r + cx,
    y: Math.sin(angle) * r + cy
  };
}

function angleNearTo(angle, min, max, out) {
  var v1 = void 0;
  var v2 = void 0;
  if (out) {
    if (angle < min) {
      v1 = min - angle;
      v2 = Math.PI * 2 - max + angle;
    } else if (angle > max) {
      v1 = Math.PI * 2 - angle + min;
      v2 = angle - max;
    }
  } else {
    v1 = angle - min;
    v2 = max - angle;
  }

  return v1 > v2 ? max : min;
}

function nearAngle(angle, startAngle, endAngle, clockwise) {
  var plus = 0;
  if (endAngle - startAngle >= Math.PI * 2) {
    plus = Math.PI * 2;
  }
  startAngle = index$8.mod(startAngle, Math.PI * 2);
  endAngle = index$8.mod(endAngle, Math.PI * 2) + plus;
  angle = index$8.mod(angle, Math.PI * 2);
  if (clockwise) {
    if (startAngle >= endAngle) {
      if (angle > endAngle && angle < startAngle) {
        return angle;
      }
      return angleNearTo(angle, endAngle, startAngle, true);
    }
    if (angle < startAngle || angle > endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle);
  }
  if (startAngle <= endAngle) {
    if (startAngle < angle && angle < endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle, true);
  }
  if (angle > startAngle || angle < endAngle) {
    return angle;
  }
  return angleNearTo(angle, endAngle, startAngle);
}

function arcProjectPoint(cx, cy, r, startAngle, endAngle, clockwise, x, y, out) {
  var v = new Vector2$4(x, y);
  var v0 = new Vector2$4(cx, cy);
  var v1 = new Vector2$4(1, 0);
  var subv = Vector2$4.sub(v, v0);
  var angle = v1.angleTo(subv);

  angle = nearAngle(angle, startAngle, endAngle, clockwise);
  var vpoint = new Vector2$4(r * Math.cos(angle) + cx, r * Math.sin(angle) + cy);
  if (out) {
    out.x = vpoint.x;
    out.y = vpoint.y;
  }
  var d = v.distanceTo(vpoint);
  return d;
}

function arcBox(cx, cy, r, startAngle, endAngle, clockwise) {
  var angleRight = 0;
  var angleBottom = Math.PI / 2;
  var angleLeft = Math.PI;
  var angleTop = Math.PI * 3 / 2;
  var points = [];
  var angle = nearAngle(angleRight, startAngle, endAngle, clockwise);
  if (angle === angleRight) {
    points.push(circlePoint(cx, cy, r, angleRight));
  }

  angle = nearAngle(angleBottom, startAngle, endAngle, clockwise);
  if (angle === angleBottom) {
    points.push(circlePoint(cx, cy, r, angleBottom));
  }

  angle = nearAngle(angleLeft, startAngle, endAngle, clockwise);
  if (angle === angleLeft) {
    points.push(circlePoint(cx, cy, r, angleLeft));
  }

  angle = nearAngle(angleTop, startAngle, endAngle, clockwise);
  if (angle === angleTop) {
    points.push(circlePoint(cx, cy, r, angleTop));
  }

  points.push(circlePoint(cx, cy, r, startAngle));
  points.push(circlePoint(cx, cy, r, endAngle));
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  index$8.each(points, function (point) {
    if (minX > point.x) {
      minX = point.x;
    }
    if (maxX < point.x) {
      maxX = point.x;
    }
    if (minY > point.y) {
      minY = point.y;
    }
    if (maxY < point.y) {
      maxY = point.y;
    }
  });

  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
}

var arc = {
  nearAngle: nearAngle,
  projectPoint: function (cx, cy, r, startAngle, endAngle, clockwise, x, y) {
    var rst = {};
    arcProjectPoint(cx, cy, r, startAngle, endAngle, clockwise, x, y, rst);
    return rst;
  },

  pointDistance: arcProjectPoint,
  box: arcBox
};

/**
 * @fileOverview isInside
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */





var inside = {
  line: function (x1, y1, x2, y2, lineWidth, x, y) {
    var box = line.box(x1, y1, x2, y2, lineWidth);

    if (!this.box(box.minX, box.maxX, box.minY, box.maxY, x, y)) {
      return false;
    }

    var d = line.pointDistance(x1, y1, x2, y2, x, y);
    if (isNaN(d)) {
      return false;
    }
    return d <= lineWidth / 2;
  },
  polyline: function (points, lineWidth, x, y) {
    var l = points.length - 1;
    if (l < 1) {
      return false;
    }
    for (var i = 0; i < l; i++) {
      var x1 = points[i][0];
      var y1 = points[i][1];
      var x2 = points[i + 1][0];
      var y2 = points[i + 1][1];

      if (this.line(x1, y1, x2, y2, lineWidth, x, y)) {
        return true;
      }
    }

    return false;
  },
  cubicline: function (x1, y1, x2, y2, x3, y3, x4, y4, lineWidth, x, y) {
    return cubic.pointDistance(x1, y1, x2, y2, x3, y3, x4, y4, x, y) <= lineWidth / 2;
  },
  quadraticline: function (x1, y1, x2, y2, x3, y3, lineWidth, x, y) {
    return quadratic.pointDistance(x1, y1, x2, y2, x3, y3, x, y) <= lineWidth / 2;
  },
  arcline: function (cx, cy, r, startAngle, endAngle, clockwise, lineWidth, x, y) {
    return arc.pointDistance(cx, cy, r, startAngle, endAngle, clockwise, x, y) <= lineWidth / 2;
  },
  rect: function (rx, ry, width, height, x, y) {
    return rx <= x && x <= rx + width && ry <= y && y <= ry + height;
  },
  circle: function (cx, cy, r, x, y) {
    return Math.pow(x - cx, 2) + Math.pow(y - cy, 2) <= Math.pow(r, 2);
  },
  box: function (minX, maxX, minY, maxY, x, y) {
    return minX <= x && x <= maxX && minY <= y && y <= maxY;
  }
};

var Vector3$3 = index$14.Vector3;

var Shape$1 = function (cfg) {
  Shape$1.superclass.constructor.call(this, cfg);
};

Shape$1.ATTRS = {};

index$8.extend(Shape$1, element);

index$8.augment(Shape$1, {
  isShape: true,
  createPath: function () {},
  drawInner: function (context) {
    var self = this;
    var attrs = self.__attrs;
    self.createPath(context);
    var originOpacity = context.globalAlpha;
    if (self.hasFill()) {
      var fillOpacity = attrs.fillOpacity;
      if (!index$8.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        context.fill();
        context.globalAlpha = originOpacity;
      } else {
        context.fill();
      }
    }
    if (self.hasStroke()) {
      var lineWidth = self.__attrs.lineWidth;
      if (lineWidth > 0) {
        var strokeOpacity = attrs.strokeOpacity;
        if (!index$8.isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        context.stroke();
      }
    }
  },

  /**
   * 节点是否在图形中
   * @param  {Number}  x x 坐标
   * @param  {Number}  y y 坐标
   * @return {Boolean}  是否在图形中
   */
  isPointInPath: function () {
    return false;
  },

  /**
   * 击中图形时是否进行包围盒判断
   * @return {Boolean} [description]
   */
  isHitBox: function () {
    return true;
  },

  /**
   * 节点是否能够被击中
   * @param {Number} x x坐标
   * @param {Number} y y坐标
   * @return {Boolean} 是否在图形中
   */
  isHit: function (x, y) {
    var self = this;
    var v = new Vector3$3(x, y, 1);
    self.invert(v); // canvas

    if (self.isHitBox()) {
      var box = self.getBBox();
      if (box && !inside.box(box.minX, box.maxX, box.minY, box.maxY, v.x, v.y)) {
        return false;
      }
    }
    var clip = self.__attrs.clip;
    if (clip) {
      if (clip.inside(x, y)) {
        return self.isPointInPath(v.x, v.y);
      }
    } else {
      return self.isPointInPath(v.x, v.y);
    }
    return false;
  },

  /**
   * @protected
   * 计算包围盒
   * @return {Object} 包围盒
   */
  calculateBox: function () {
    return null;
  },

  // 清除当前的矩阵
  clearTotalMatrix: function () {
    this.__cfg.totalMatrix = null;
    this.__cfg.region = null;
  },
  clearBBox: function () {
    this.__cfg.box = null;
    this.__cfg.region = null;
  },
  getBBox: function () {
    var box = this.__cfg.box;
    // 延迟计算
    if (!box) {
      box = this.calculateBox();
      if (box) {
        box.x = box.minX;
        box.y = box.minY;
        box.width = box.maxX - box.minX;
        box.height = box.maxY - box.minY;
      }
      this.__cfg.box = box;
    }
    return box;
  }
});

var shape = Shape$1;

/**
 * @fileOverview 矩形
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */




var Rect = function (cfg) {
  Rect.superclass.constructor.call(this, cfg);
};

Rect.ATTRS = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  lineWidth: 1
};

index$8.extend(Rect, shape);

index$8.augment(Rect, {
  canFill: true,
  canStroke: true,
  type: 'rect',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1,
      radius: 0
    };
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    var lineWidth = attrs.lineWidth;

    var halfWidth = lineWidth / 2;
    return {
      minX: x - halfWidth,
      minY: y - halfWidth,
      maxX: x + width + halfWidth,
      maxY: y + height + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var self = this;
    var fill = self.hasFill();
    var stroke = self.hasStroke();

    if (fill && stroke) {
      return self.__isPointInFill(x, y) || self.__isPointInStroke(x, y);
    }

    if (fill) {
      return self.__isPointInFill(x, y);
    }

    if (stroke) {
      return self.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function (x, y) {
    var context = this.get('context');

    if (!context) return false;
    this.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke: function (x, y) {
    var self = this;
    var attrs = self.__attrs;
    var rx = attrs.x;
    var ry = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    var radius = attrs.radius;
    var lineWidth = attrs.lineWidth;

    if (radius === 0) {
      var halfWidth = lineWidth / 2;
      return inside.line(rx - halfWidth, ry, rx + width + halfWidth, ry, lineWidth, x, y) || inside.line(rx + width, ry - halfWidth, rx + width, ry + height + halfWidth, lineWidth, x, y) || inside.line(rx + width + halfWidth, ry + height, rx - halfWidth, ry + height, lineWidth, x, y) || inside.line(rx, ry + height + halfWidth, rx, ry - halfWidth, lineWidth, x, y);
    }

    return inside.line(rx + radius, ry, rx + width - radius, ry, lineWidth, x, y) || inside.line(rx + width, ry + radius, rx + width, ry + height - radius, lineWidth, x, y) || inside.line(rx + width - radius, ry + height, rx + radius, ry + height, lineWidth, x, y) || inside.line(rx, ry + height - radius, rx, ry + radius, lineWidth, x, y) || inside.arcline(rx + width - radius, ry + radius, radius, 1.5 * Math.PI, 2 * Math.PI, false, lineWidth, x, y) || inside.arcline(rx + width - radius, ry + height - radius, radius, 0, 0.5 * Math.PI, false, lineWidth, x, y) || inside.arcline(rx + radius, ry + height - radius, radius, 0.5 * Math.PI, Math.PI, false, lineWidth, x, y) || inside.arcline(rx + radius, ry + radius, radius, Math.PI, 1.5 * Math.PI, false, lineWidth, x, y);
  },
  createPath: function (context) {
    var self = this;
    var attrs = self.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    var radius = attrs.radius;
    context = context || self.get('context');

    context.beginPath();
    if (radius === 0) {
      // 改成原生的rect方法
      context.rect(x, y, width, height);
    } else {
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
      context.lineTo(x + width, y + height - radius);
      context.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
      context.lineTo(x + radius, y + height);
      context.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
      context.lineTo(x, y + radius);
      context.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2, false);
      context.closePath();
    }
  }
});

var rect = Rect;

/**
 * @fileOverview circle
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */




var Circle = function (cfg) {
  Circle.superclass.constructor.call(this, cfg);
};

Circle.ATTRS = {
  x: 0,
  y: 0,
  r: 0,
  lineWidth: 1
};

index$8.extend(Circle, shape);

index$8.augment(Circle, {
  canFill: true,
  canStroke: true,
  type: 'circle',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var lineWidth = attrs.lineWidth;
    var halfWidth = lineWidth / 2 + r;
    return {
      minX: cx - halfWidth,
      minY: cy - halfWidth,
      maxX: cx + halfWidth,
      maxY: cy + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var fill = this.hasFill();
    var stroke = this.hasStroke();
    if (fill && stroke) {
      return this.__isPointInFill(x, y) || this.__isPointInStroke(x, y);
    }

    if (fill) {
      return this.__isPointInFill(x, y);
    }

    if (stroke) {
      return this.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;

    return inside.circle(cx, cy, r, x, y);
  },
  __isPointInStroke: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var lineWidth = attrs.lineWidth;

    return inside.arcline(cx, cy, r, 0, Math.PI * 2, false, lineWidth, x, y);
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    context = context || self.get('context');

    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2, false);
  }
});

var circle = Circle;

/**
 * @fileOverview Ellipse
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */




var Matrix3$5 = index$14.Matrix3;
var Vector3$4 = index$14.Vector3;

var Ellipse = function (cfg) {
  Ellipse.superclass.constructor.call(this, cfg);
};

Ellipse.ATTRS = {
  x: 0,
  y: 0,
  rx: 1,
  ry: 1,
  lineWidth: 1
};

index$8.extend(Ellipse, shape);

index$8.augment(Ellipse, {
  canFill: true,
  canStroke: true,
  type: 'ellipse',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;
    var lineWidth = attrs.lineWidth;
    var halfXWidth = rx + lineWidth / 2;
    var halfYWidth = ry + lineWidth / 2;

    return {
      minX: cx - halfXWidth,
      minY: cy - halfYWidth,
      maxX: cx + halfXWidth,
      maxY: cy + halfYWidth
    };
  },
  isPointInPath: function (x, y) {
    var fill = this.hasFill();
    var stroke = this.hasStroke();

    if (fill && stroke) {
      return this.__isPointInFill(x, y) || this.__isPointInStroke(x, y);
    }

    if (fill) {
      return this.__isPointInFill(x, y);
    }

    if (stroke) {
      return this.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;

    var r = rx > ry ? rx : ry;
    var scaleX = rx > ry ? 1 : rx / ry;
    var scaleY = rx > ry ? ry / rx : 1;

    var p = new Vector3$4(x, y, 1);
    var m = new Matrix3$5();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    var inm = m.getInverse();
    p.applyMatrix(inm);

    return inside.circle(0, 0, r, p.x, p.y);
  },
  __isPointInStroke: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;
    var lineWidth = attrs.lineWidth;

    var r = rx > ry ? rx : ry;
    var scaleX = rx > ry ? 1 : rx / ry;
    var scaleY = rx > ry ? ry / rx : 1;

    var p = new Vector3$4(x, y, 1);
    var m = new Matrix3$5();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    var inm = m.getInverse();
    p.applyMatrix(inm);

    return inside.arcline(0, 0, r, 0, Math.PI * 2, false, lineWidth, p.x, p.y);
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;

    context = context || self.get('context');
    var r = rx > ry ? rx : ry;
    var scaleX = rx > ry ? 1 : rx / ry;
    var scaleY = rx > ry ? ry / rx : 1;

    var m = new Matrix3$5();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    var mo = m.to2DObject();
    context.beginPath();
    context.save();
    context.transform(mo.a, mo.b, mo.c, mo.d, mo.e, mo.f);
    context.arc(0, 0, r, 0, Math.PI * 2);
    context.restore();
    context.closePath();
  }
});

var ellipse = Ellipse;

/**
 * @fileOverview ellipse math
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var ellipse$2 = {
  xAt: function (psi, rx, ry, cx, t) {
    return rx * Math.cos(psi) * Math.cos(t) - ry * Math.sin(psi) * Math.sin(t) + cx;
  },
  yAt: function (psi, rx, ry, cy, t) {
    return rx * Math.sin(psi) * Math.cos(t) + ry * Math.cos(psi) * Math.sin(t) + cy;
  },
  xExtrema: function (psi, rx, ry) {
    return Math.atan(-ry / rx * Math.tan(psi));
  },
  yExtrema: function (psi, rx, ry) {
    return Math.atan(ry / (rx * Math.tan(psi)));
  }
};

/**
 * @fileOverview Path
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */






var Vector2$6 = index$14.Vector2;
var Vector3$5 = index$14.Vector3;
var Matrix3$6 = index$14.Matrix3;

var ARR_CMD = ['m', 'l', 'c', 'a', 'q', 'h', 'v', 't', 's', 'z'];

function toAbsolute(x, y, curPoint) {
  // 获取绝对坐标
  return {
    x: curPoint.x + x,
    y: curPoint.y + y
  };
}

function toSymmetry(point, center) {
  // 点对称
  return {
    x: center.x + (center.x - point.x),
    y: center.y + (center.y - point.y)
  };
}

function vMag(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function vRatio(u, v) {
  return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
}

function vAngle(u, v) {
  return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
}

function getArcParams(point1, point2, fa, fs, rx, ry, psiDeg) {
  var psi = index$8.mod(index$8.toRadian(psiDeg), Math.PI * 2);
  var x1 = point1.x;
  var y1 = point1.y;
  var x2 = point2.x;
  var y2 = point2.y;
  var xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
  var yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;
  var lambda = xp * xp / (rx * rx) + yp * yp / (ry * ry);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) / (rx * rx * (yp * yp) + ry * ry * (xp * xp)));

  if (fa === fs) {
    f *= -1;
  }
  if (isNaN(f)) {
    f = 0;
  }

  var cxp = f * rx * yp / ry;
  var cyp = f * -ry * xp / rx;

  var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
  var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;

  var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
  var u = [(xp - cxp) / rx, (yp - cyp) / ry];
  var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
  var dTheta = vAngle(u, v);

  if (vRatio(u, v) <= -1) {
    dTheta = Math.PI;
  }
  if (vRatio(u, v) >= 1) {
    dTheta = 0;
  }
  if (fs === 0 && dTheta > 0) {
    dTheta = dTheta - 2 * Math.PI;
  }
  if (fs === 1 && dTheta < 0) {
    dTheta = dTheta + 2 * Math.PI;
  }
  return [point1, cx, cy, rx, ry, theta, dTheta, psi, fs];
}

var PathSegment = function (item, preSegment, isLast) {
  this.preSegment = preSegment;
  this.isLast = isLast;
  this.init(item, preSegment);
};

index$8.augment(PathSegment, {
  init: function (item, preSegment) {
    var command = item[0];
    preSegment = preSegment || {
      endPoint: {
        x: 0,
        y: 0
      }
    };
    var relative = ARR_CMD.indexOf(command) >= 0; // /[a-z]/.test(command);
    var cmd = relative ? command.toUpperCase() : command;
    var p = item;
    var point1 = void 0;
    var point2 = void 0;
    var point3 = void 0;
    var point = void 0;
    var preEndPoint = preSegment.endPoint;

    var p1 = p[1];
    var p2 = p[2];
    switch (cmd) {
      default:
        break;
      case 'M':
        if (relative) {
          point = toAbsolute(p1, p2, preEndPoint);
        } else {
          point = {
            x: p1,
            y: p2
          };
        }
        this.command = 'M';
        this.params = [preEndPoint, point];
        this.subStart = point;
        this.endPoint = point;
        break;
      case 'L':
        if (relative) {
          point = toAbsolute(p1, p2, preEndPoint);
        } else {
          point = {
            x: p1,
            y: p2
          };
        }
        this.command = 'L';
        this.params = [preEndPoint, point];
        this.subStart = preSegment.subStart;
        this.endPoint = point;
        if (this.isLast) {
          this.endTangent = function () {
            return new Vector2$6(point.x - preEndPoint.x, point.y - preEndPoint.y);
          };
        }
        break;
      case 'H':
        if (relative) {
          point = toAbsolute(p1, 0, preEndPoint);
        } else {
          point = {
            x: p1,
            y: preEndPoint.y
          };
        }
        this.command = 'L';
        this.params = [preEndPoint, point];
        this.subStart = preSegment.subStart;
        this.endPoint = point;
        this.endTangent = function () {
          return new Vector2$6(point.x - preEndPoint.x, point.y - preEndPoint.y);
        };
        break;
      case 'V':
        if (relative) {
          point = toAbsolute(0, p1, preEndPoint);
        } else {
          point = {
            x: preEndPoint.x,
            y: p1
          };
        }
        this.command = 'L';
        this.params = [preEndPoint, point];
        this.subStart = preSegment.subStart;
        this.endPoint = point;
        this.endTangent = function () {
          return new Vector2$6(point.x - preEndPoint.x, point.y - preEndPoint.y);
        };
        break;
      case 'Q':
        if (relative) {
          point1 = toAbsolute(p1, p2, preEndPoint);
          point2 = toAbsolute(p[3], p[4], preEndPoint);
        } else {
          point1 = {
            x: p1,
            y: p2
          };
          point2 = {
            x: p[3],
            y: p[4]
          };
        }
        this.command = 'Q';
        this.params = [preEndPoint, point1, point2];
        this.subStart = preSegment.subStart;
        this.endPoint = point2;
        this.endTangent = function () {
          return new Vector2$6(point2.x - point1.x, point2.y - point1.y);
        };
        break;
      case 'T':
        if (relative) {
          point2 = toAbsolute(p1, p2, preEndPoint);
        } else {
          point2 = {
            x: p1,
            y: p2
          };
        }
        if (preSegment.command === 'Q') {
          point1 = toSymmetry(preSegment.params[1], preEndPoint);
          this.command = 'Q';
          this.params = [preEndPoint, point1, point2];
          this.subStart = preSegment.subStart;
          this.endPoint = point2;
          this.endTangent = function () {
            return new Vector2$6(point2.x - point1.x, point2.y - point1.y);
          };
        } else {
          this.command = 'TL';
          this.params = [preEndPoint, point2];
          this.subStart = preSegment.subStart;
          this.endPoint = point2;
          this.endTangent = function () {
            return new Vector2$6(point2.x - preEndPoint.x, point2.y - preEndPoint.y);
          };
        }

        break;
      case 'C':
        if (relative) {
          point1 = toAbsolute(p1, p2, preEndPoint);
          point2 = toAbsolute(p[3], p[4], preEndPoint);
          point3 = toAbsolute(p[5], p[6], preEndPoint);
        } else {
          point1 = {
            x: p1,
            y: p2
          };
          point2 = {
            x: p[3],
            y: p[4]
          };
          point3 = {
            x: p[5],
            y: p[6]
          };
        }
        this.command = 'C';
        this.params = [preEndPoint, point1, point2, point3];
        this.subStart = preSegment.subStart;
        this.endPoint = point3;
        this.endTangent = function () {
          return new Vector2$6(point3.x - point2.x, point3.y - point2.y);
        };
        break;
      case 'S':
        if (relative) {
          point2 = toAbsolute(p1, p2, preEndPoint);
          point3 = toAbsolute(p[3], p[4], preEndPoint);
        } else {
          point2 = {
            x: p1,
            y: p2
          };
          point3 = {
            x: p[3],
            y: p[4]
          };
        }
        if (preSegment.command === 'C') {
          point1 = toSymmetry(preSegment.params[2], preEndPoint);
          this.command = 'C';
          this.params = [preEndPoint, point1, point2, point3];
          this.subStart = preSegment.subStart;
          this.endPoint = point3;
          this.endTangent = function () {
            return new Vector2$6(point3.x - point2.x, point3.y - point2.y);
          };
        } else {
          this.command = 'SQ';
          this.params = [preEndPoint, point2, point3];
          this.subStart = preSegment.subStart;
          this.endPoint = point3;
          this.endTangent = function () {
            return new Vector2$6(point3.x - point2.x, point3.y - point2.y);
          };
        }
        break;
      case 'A':
        {
          var rx = p1;
          var ry = p2;
          var psi = p[3];
          var fa = p[4];
          var fs = p[5];
          if (relative) {
            point = toAbsolute(p[6], p[7], preEndPoint);
          } else {
            point = {
              x: p[6],
              y: p[7]
            };
          }

          this.command = 'A';
          this.params = getArcParams(preEndPoint, point, fa, fs, rx, ry, psi);
          this.subStart = preSegment.subStart;
          this.endPoint = point;
          break;
        }
      case 'Z':
        {
          this.command = 'Z';
          this.params = [preEndPoint, preSegment.subStart];
          this.subStart = preSegment.subStart;
          this.endPoint = preSegment.subStart;
        }
    }
  },
  isInside: function (x, y, lineWidth) {
    var self = this;
    var command = self.command;
    var params = self.params;
    var box = self.box;
    if (box) {
      if (!inside.box(box.minX, box.maxX, box.minY, box.maxY, x, y)) {
        return false;
      }
    }
    switch (command) {
      default:
        break;
      case 'M':
        return false;
      case 'TL':
      case 'L':
      case 'Z':
        return inside.line(params[0].x, params[0].y, params[1].x, params[1].y, lineWidth, x, y);
      case 'SQ':
      case 'Q':
        return inside.quadraticline(params[0].x, params[0].y, params[1].x, params[1].y, params[2].x, params[2].y, lineWidth, x, y);
      case 'C':
        {
          return inside.cubicline(params[0].x, params[0].y, params[1].x, params[1].y, params[2].x, params[2].y, params[3].x, params[3].y, lineWidth, x, y);
        }
      case 'A':
        {
          var p = params;
          var cx = p[1];
          var cy = p[2];
          var rx = p[3];
          var ry = p[4];
          var theta = p[5];
          var dTheta = p[6];
          var psi = p[7];
          var fs = p[8];

          var r = rx > ry ? rx : ry;
          var scaleX = rx > ry ? 1 : rx / ry;
          var scaleY = rx > ry ? ry / rx : 1;

          p = new Vector3$5(x, y, 1);
          var m = new Matrix3$6();
          m.translate(-cx, -cy);
          m.rotate(-psi);
          m.scale(1 / scaleX, 1 / scaleY);
          p.applyMatrix(m);
          return inside.arcline(0, 0, r, theta, theta + dTheta, 1 - fs, lineWidth, p.x, p.y);
        }
    }
    return false;
  },
  draw: function (context) {
    var command = this.command;
    var params = this.params;
    var point1 = void 0;
    var point2 = void 0;
    var point3 = void 0;

    switch (command) {
      default:
        break;
      case 'M':
        context.moveTo(params[1].x, params[1].y);
        break;
      case 'TL':
      case 'L':
        context.lineTo(params[1].x, params[1].y);
        break;
      case 'SQ':
      case 'Q':
        point1 = params[1];
        point2 = params[2];
        context.quadraticCurveTo(point1.x, point1.y, point2.x, point2.y);
        break;
      case 'C':
        point1 = params[1];
        point2 = params[2];
        point3 = params[3];
        context.bezierCurveTo(point1.x, point1.y, point2.x, point2.y, point3.x, point3.y);
        break;
      case 'A':
        {
          var p = params;
          var p1 = p[1];
          var p2 = p[2];
          var cx = p1;
          var cy = p2;
          var rx = p[3];
          var ry = p[4];
          var theta = p[5];
          var dTheta = p[6];
          var psi = p[7];
          var fs = p[8];

          var r = rx > ry ? rx : ry;
          var scaleX = rx > ry ? 1 : rx / ry;
          var scaleY = rx > ry ? ry / rx : 1;

          context.translate(cx, cy);
          context.rotate(psi);
          context.scale(scaleX, scaleY);
          context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
          context.scale(1 / scaleX, 1 / scaleY);
          context.rotate(-psi);
          context.translate(-cx, -cy);
          break;
        }
      case 'Z':
        context.closePath();
        break;
    }
  },
  getBBox: function (lineWidth) {
    var halfWidth = lineWidth / 2;
    var params = this.params;
    var yDims = void 0;
    var xDims = void 0;
    var i = void 0;
    var l = void 0;

    switch (this.command) {
      default:
      case 'M':
      case 'Z':
        break;
      case 'TL':
      case 'L':
        this.box = {
          minX: Math.min(params[0].x, params[1].x) - halfWidth,
          maxX: Math.max(params[0].x, params[1].x) + halfWidth,
          minY: Math.min(params[0].y, params[1].y) - halfWidth,
          maxY: Math.max(params[0].y, params[1].y) + halfWidth
        };
        break;
      case 'SQ':
      case 'Q':
        xDims = quadratic.extrema(params[0].x, params[1].x, params[2].x);
        for (i = 0, l = xDims.length; i < l; i++) {
          xDims[i] = quadratic.at(params[0].x, params[1].x, params[2].x, xDims[i]);
        }
        xDims.push(params[0].x, params[2].x);
        yDims = quadratic.extrema(params[0].y, params[1].y, params[2].y);
        for (i = 0, l = yDims.length; i < l; i++) {
          yDims[i] = quadratic.at(params[0].y, params[1].y, params[2].y, yDims);
        }
        yDims.push(params[0].y, params[2].y);
        this.box = {
          minX: Math.min.apply(Math, xDims) - halfWidth,
          maxX: Math.max.apply(Math, xDims) + halfWidth,
          minY: Math.min.apply(Math, yDims) - halfWidth,
          maxY: Math.max.apply(Math, yDims) + halfWidth
        };
        break;
      case 'C':
        xDims = cubic.extrema(params[0].x, params[1].x, params[2].x, params[3].x);
        for (i = 0, l = xDims.length; i < l; i++) {
          xDims[i] = cubic.at(params[0].x, params[1].x, params[2].x, params[3].x, xDims[i]);
        }
        yDims = cubic.extrema(params[0].y, params[1].y, params[2].y, params[3].y);
        for (i = 0, l = yDims.length; i < l; i++) {
          yDims[i] = cubic.at(params[0].y, params[1].y, params[2].y, params[3].y, yDims[i]);
        }
        xDims.push(params[0].x, params[3].x);
        yDims.push(params[0].y, params[3].y);
        this.box = {
          minX: Math.min.apply(Math, xDims) - halfWidth,
          maxX: Math.max.apply(Math, xDims) + halfWidth,
          minY: Math.min.apply(Math, yDims) - halfWidth,
          maxY: Math.max.apply(Math, yDims) + halfWidth
        };
        break;
      case 'A':
        {
          // todo 待优化
          var p = params;
          var cx = p[1];
          var cy = p[2];
          var rx = p[3];
          var ry = p[4];
          var theta = p[5];
          var dTheta = p[6];
          var psi = p[7];
          var fs = p[8];
          var start = theta;
          var end = theta + dTheta;

          var xDim = ellipse$2.xExtrema(psi, rx, ry);
          var minX = Infinity;
          var maxX = -Infinity;
          var xs = [start, end];
          for (i = -Math.PI * 2; i <= Math.PI * 2; i += Math.PI) {
            var xAngle = xDim + i;
            if (fs === 1) {
              if (start < xAngle && xAngle < end) {
                xs.push(xAngle);
              }
            } else {
              if (end < xAngle && xAngle < start) {
                xs.push(xAngle);
              }
            }
          }

          for (i = 0, l = xs.length; i < l; i++) {
            var x = ellipse$2.xAt(psi, rx, ry, cx, xs[i]);
            if (x < minX) {
              minX = x;
            }
            if (x > maxX) {
              maxX = x;
            }
          }

          var yDim = ellipse$2.yExtrema(psi, rx, ry);
          var minY = Infinity;
          var maxY = -Infinity;
          var ys = [start, end];
          for (i = -Math.PI * 2; i <= Math.PI * 2; i += Math.PI) {
            var yAngle = yDim + i;
            if (fs === 1) {
              if (start < yAngle && yAngle < end) {
                ys.push(yAngle);
              }
            } else {
              if (end < yAngle && yAngle < start) {
                ys.push(yAngle);
              }
            }
          }

          for (i = 0, l = ys.length; i < l; i++) {
            var y = ellipse$2.yAt(psi, rx, ry, cy, ys[i]);
            if (y < minY) {
              minY = y;
            }
            if (y > maxY) {
              maxY = y;
            }
          }
          this.box = {
            minX: minX - halfWidth,
            maxX: maxX + halfWidth,
            minY: minY - halfWidth,
            maxY: maxY + halfWidth
          };
          break;
        }
    }
  }
});

var pathSegment = PathSegment;

var Vector2$7 = index$14.Vector2;

var THETA = Math.PI / 6;

function calculatePoints(vector, end, lineWidth) {
  var angle = new Vector2$7(1, 0).angleTo(vector);
  var downAngle = angle - THETA;
  var upAngle = angle + THETA;
  var length = 6 + lineWidth * 3;
  return [{
    x: end.x - length * Math.cos(downAngle),
    y: end.y - length * Math.sin(downAngle)
  }, end, {
    x: end.x - length * Math.cos(upAngle),
    y: end.y - length * Math.sin(upAngle)
  }];
}

function arrow(context, points) {
  context.moveTo(points[0].x, points[0].y);
  context.lineTo(points[1].x, points[1].y);
  context.lineTo(points[2].x, points[2].y);
}

function makeArrow(context, vector, end, lineWidth) {
  arrow(context, calculatePoints(vector, end, lineWidth));
}

function getEndPoint(vector, end, lineWidth) {
  var miterLimit = lineWidth / Math.sin(THETA);
  vector.setLength(miterLimit / 2);
  end.sub(vector);
  return end;
}

var arrow_1 = {
  makeArrow: makeArrow,
  getEndPoint: getEndPoint
};

/**
 * @fileOverview Path
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @see http://www.w3.org/TR/2011/REC-SVG11-20110816/paths.html#PathData
 * @ignore
 */








var Vector2$5 = index$14.Vector2;

var Path = function (cfg) {
  Path.superclass.constructor.call(this, cfg);
};

Path.ATTRS = {
  path: null,
  lineWidth: 1,
  curve: null, // 曲线path
  tCache: null
};

index$8.extend(Path, shape);

index$8.augment(Path, {
  canFill: true,
  canStroke: true,
  type: 'path',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1
    };
  },
  __afterSetAttrPath: function (path) {
    var self = this;
    if (index$8.isNil(path)) {
      self.setSilent('segments', null);
      self.setSilent('box', undefined);
      return;
    }
    var pathArray = format.parsePath(path);
    var preSegment = void 0;
    var segments = [];

    if (!index$8.isArray(pathArray) || pathArray.length === 0 || pathArray[0][0] !== 'M' && pathArray[0][0] !== 'm') {
      return;
    }
    var count = pathArray.length;
    for (var i = 0; i < pathArray.length; i++) {
      var item = pathArray[i];
      preSegment = new pathSegment(item, preSegment, i === count - 1);
      segments.push(preSegment);
    }
    self.setSilent('segments', segments);
    self.set('tCache', null);
    this.setSilent('box', null);
  },
  __afterSetAttrAll: function (objs) {
    if (objs.path) {
      this.__afterSetAttrPath(objs.path);
    }
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var lineWidth = attrs.lineWidth;
    var lineAppendWidth = attrs.lineAppendWidth || 0;
    var segments = self.get('segments');

    if (!segments) {
      return null;
    }
    lineWidth += lineAppendWidth;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    index$8.each(segments, function (segment) {
      segment.getBBox(lineWidth);
      var box = segment.box;
      if (box) {
        if (box.minX < minX) {
          minX = box.minX;
        }

        if (box.maxX > maxX) {
          maxX = box.maxX;
        }

        if (box.minY < minY) {
          minY = box.minY;
        }

        if (box.maxY > maxY) {
          maxY = box.maxY;
        }
      }
    });
    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  },
  isPointInPath: function (x, y) {
    var self = this;
    var fill = self.hasFill();
    var stroke = self.hasStroke();

    if (fill && stroke) {
      return self.__isPointInFill(x, y) || self.__isPointInStroke(x, y);
    }

    if (fill) {
      return self.__isPointInFill(x, y);
    }

    if (stroke) {
      return self.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function (x, y) {
    var self = this;
    var context = self.get('context');
    if (!context) return undefined;
    self.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke: function (x, y) {
    var self = this;
    var segments = self.get('segments');
    var attrs = self.__attrs;
    var lineWidth = attrs.lineWidth;
    var appendWidth = attrs.lineAppendWidth || 0;
    lineWidth += appendWidth;
    for (var i = 0, l = segments.length; i < l; i++) {
      if (segments[i].isInside(x, y, lineWidth)) {
        return true;
      }
    }

    return false;
  },
  __setTcache: function () {
    var totalLength = 0;
    var tempLength = 0;
    var tCache = [];
    var segmentT = void 0;
    var segmentL = void 0;
    var segmentN = void 0;
    var l = void 0;
    var curve = this.curve;

    if (!curve) {
      return;
    }

    index$8.each(curve, function (segment, i) {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        totalLength += cubic.len(segment[l - 2], segment[l - 1], segmentN[1], segmentN[2], segmentN[3], segmentN[4], segmentN[5], segmentN[6]);
      }
    });

    index$8.each(curve, function (segment, i) {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = cubic.len(segment[l - 2], segment[l - 1], segmentN[1], segmentN[2], segmentN[3], segmentN[4], segmentN[5], segmentN[6]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });

    this.tCache = tCache;
  },
  __calculateCurve: function () {
    var self = this;
    var attrs = self.__attrs;
    var path = attrs.path;
    this.curve = index$2.toCurve(path);
  },
  getPoint: function (t) {
    var tCache = this.tCache;
    var subt = void 0;
    var index = void 0;

    if (!tCache) {
      this.__calculateCurve();
      this.__setTcache();
      tCache = this.tCache;
    }

    var curve = this.curve;

    if (!tCache) {
      if (curve) {
        return {
          x: curve[0][1],
          y: curve[0][2]
        };
      }
      return null;
    }
    index$8.each(tCache, function (v, i) {
      if (t >= v[0] && t <= v[1]) {
        subt = (t - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });
    var seg = curve[index];
    if (index$8.isNil(seg) || index$8.isNil(index)) {
      return null;
    }
    var l = seg.length;
    var nextSeg = curve[index + 1];
    return {
      x: cubic.at(seg[l - 2], nextSeg[1], nextSeg[3], nextSeg[5], 1 - subt),
      y: cubic.at(seg[l - 1], nextSeg[2], nextSeg[4], nextSeg[6], 1 - subt)
    };
  },
  createPath: function (context) {
    var self = this;
    var attrs = self.__attrs;
    var segments = self.get('segments');
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;

    if (!index$8.isArray(segments)) return;
    context = context || self.get('context');
    context.beginPath();
    for (var i = 0, l = segments.length; i < l; i++) {
      if (i === l - 1 && arrow) {
        var lastSeg = segments[i];
        var endTangent = segments[i].endTangent;
        var endPoint = {
          x: lastSeg.params[lastSeg.params.length - 1].x,
          y: lastSeg.params[lastSeg.params.length - 1].y
        };
        if (lastSeg && index$8.isFunction(endTangent)) {
          var v = endTangent();
          var end = arrow_1.getEndPoint(v, new Vector2$5(endPoint.x, endPoint.y), lineWidth);
          lastSeg.params[lastSeg.params.length - 1] = end;
          segments[i].draw(context);
          arrow_1.makeArrow(context, v, end, lineWidth);
          lastSeg.params[lastSeg.params.length - 1] = endPoint;
        }
      } else {
        segments[i].draw(context);
      }
    }
  }
});

var path$2 = Path;

/**
 * @fileOverview text 文本
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */





var CText = function (cfg) {
  CText.superclass.constructor.call(this, cfg);
};

CText.ATTRS = {
  x: 0,
  y: 0,
  text: null,
  fontSize: 12,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontVariant: 'normal',
  textAlign: 'start',
  textBaseline: 'bottom',
  lineHeight: null,
  textArr: null
};

index$8.extend(CText, shape);

index$8.augment(CText, {
  canFill: true,
  canStroke: true,
  type: 'text',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1,
      lineCount: 1,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontVariant: 'normal',
      textAlign: 'start',
      textBaseline: 'bottom'
    };
  },
  __assembleFont: function () {
    // var self = this;
    var attrs = this.__attrs;
    var fontSize = attrs.fontSize;
    var fontFamily = attrs.fontFamily;
    var fontWeight = attrs.fontWeight;
    var fontStyle = attrs.fontStyle; // self.attr('fontStyle');
    var fontVariant = attrs.fontVariant; // self.attr('fontVariant');
    // self.attr('font', [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' '));
    attrs.font = [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' ');
  },
  __afterSetAttrFontSize: function () {
    /* this.attr({
      height: this.__getTextHeight()
    }); */
    this.__assembleFont();
  },
  __afterSetAttrFontFamily: function () {
    this.__assembleFont();
  },
  __afterSetAttrFontWeight: function () {
    this.__assembleFont();
  },
  __afterSetAttrFontStyle: function () {
    this.__assembleFont();
  },
  __afterSetAttrFontVariant: function () {
    this.__assembleFont();
  },
  __afterSetAttrFont: function () {
    // this.attr('width', this.measureText());
  },
  __afterSetAttrText: function () {
    var attrs = this.__attrs;
    var text = attrs.text;
    var textArr = void 0;
    if (index$8.isString(text) && text.indexOf('\n') !== -1) {
      textArr = text.split('\n');
      var lineCount = textArr.length;
      attrs.lineCount = lineCount;
      attrs.textArr = textArr;
    }
    // attrs.height = this.__getTextHeight();
    // attrs.width = this.measureText();
  },
  __getTextHeight: function () {
    var attrs = this.__attrs;
    var lineCount = attrs.lineCount;
    var fontSize = attrs.fontSize * 1;
    if (lineCount > 1) {
      var spaceingY = this.__getSpaceingY();
      return fontSize * lineCount + spaceingY * (lineCount - 1);
    }
    return fontSize;
  },

  // 计算浪费，效率低，待优化
  __afterSetAttrAll: function (objs) {
    var self = this;
    if ('fontSize' in objs || 'fontWeight' in objs || 'fontStyle' in objs || 'fontVariant' in objs || 'fontFamily' in objs) {
      self.__assembleFont();
    }

    if ('text' in objs) {
      self.__afterSetAttrText(objs.text);
    }
  },
  isHitBox: function () {
    return false;
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = self.measureText(); // attrs.width
    if (!width) {
      // 如果width不存在，四点共其实点
      return {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      };
    }
    var height = self.__getTextHeight(); // attrs.height
    var textAlign = attrs.textAlign;
    var textBaseline = attrs.textBaseline;
    var lineWidth = attrs.lineWidth;
    var point = {
      x: x,
      y: y - height
    };

    if (textAlign) {
      if (textAlign === 'end' || textAlign === 'right') {
        point.x -= width;
      } else if (textAlign === 'center') {
        point.x -= width / 2;
      }
    }

    if (textBaseline) {
      if (textBaseline === 'top') {
        point.y += height;
      } else if (textBaseline === 'middle') {
        point.y += height / 2;
      }
    }

    this.set('startPoint', point);
    var halfWidth = lineWidth / 2;
    return {
      minX: point.x - halfWidth,
      minY: point.y - halfWidth,
      maxX: point.x + width + halfWidth,
      maxY: point.y + height + halfWidth
    };
  },
  __getSpaceingY: function () {
    var attrs = this.__attrs;
    var lineHeight = attrs.lineHeight;
    var fontSize = attrs.fontSize * 1;
    return lineHeight ? lineHeight - fontSize : fontSize * 0.14;
  },
  isPointInPath: function (x, y) {
    var self = this;
    var box = self.getBBox();
    if (self.hasFill() || self.hasStroke()) {
      return inside.box(box.minX, box.maxX, box.minY, box.maxY, x, y);
    }
  },
  drawInner: function (context) {
    var self = this;
    var attrs = self.__attrs;
    var text = attrs.text;
    if (!text) {
      return;
    }
    var textArr = attrs.textArr;
    var fontSize = attrs.fontSize * 1;
    var spaceingY = self.__getSpaceingY();
    var x = attrs.x;
    var y = attrs.y;
    var textBaseline = attrs.textBaseline;
    var height = void 0;
    if (textArr) {
      var box = self.getBBox();
      height = box.maxY - box.minY;
    }
    var subY = void 0;

    context.beginPath();
    if (self.hasFill()) {
      var fillOpacity = attrs.fillOpacity;
      if (!index$8.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
      }
      if (textArr) {
        index$8.each(textArr, function (subText, index) {
          subY = y + index * (spaceingY + fontSize) - height + fontSize; // bottom;
          if (textBaseline === 'middle') subY += height - fontSize - (height - fontSize) / 2;
          if (textBaseline === 'top') subY += height - fontSize;
          context.fillText(subText, x, subY);
        });
      } else {
        context.fillText(text, x, y);
      }
    }

    if (self.hasStroke()) {
      if (textArr) {
        index$8.each(textArr, function (subText, index) {
          subY = y + index * (spaceingY + fontSize) - height + fontSize; // bottom;
          if (textBaseline === 'middle') subY += height - fontSize - (height - fontSize) / 2;
          if (textBaseline === 'top') subY += height - fontSize;
          context.strokeText(subText, x, subY);
        });
      } else {
        context.strokeText(text, x, y);
      }
    }
  },
  measureText: function () {
    var self = this;
    var attrs = self.__attrs;
    var text = attrs.text;
    var font = attrs.font;
    var textArr = attrs.textArr;
    var measureWidth = void 0;
    var width = 0;

    if (index$8.isNil(text)) return undefined;
    var context = common$2.backupContext;
    context.save();
    context.font = font;
    if (textArr) {
      index$8.each(textArr, function (subText) {
        measureWidth = context.measureText(subText).width;
        if (width < measureWidth) {
          width = measureWidth;
        }
        context.restore();
      });
    } else {
      width = context.measureText(text).width;
      context.restore();
    }
    return width;
  }
});

var text = CText;

/**
 * @fileOverview 直线
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */






var Vector2$8 = index$14.Vector2;

var Line = function (cfg) {
  Line.superclass.constructor.call(this, cfg);
};

Line.ATTRS = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  lineWidth: 1,
  arrow: false
};

index$8.extend(Line, shape);

index$8.augment(Line, {
  canStroke: true,
  type: 'line',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var x1 = attrs.x1;
    var y1 = attrs.y1;
    var x2 = attrs.x2;
    var y2 = attrs.y2;
    var lineWidth = attrs.lineWidth;

    return line.box(x1, y1, x2, y2, lineWidth);
  },
  isPointInPath: function (x, y) {
    var attrs = this.__attrs;
    var x1 = attrs.x1;
    var y1 = attrs.y1;
    var x2 = attrs.x2;
    var y2 = attrs.y2;
    var lineWidth = attrs.lineWidth;
    if (this.hasStroke()) {
      return inside.line(x1, y1, x2, y2, lineWidth, x, y);
    }

    return false;
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var x1 = attrs.x1;
    var y1 = attrs.y1;
    var x2 = attrs.x2;
    var y2 = attrs.y2;
    var arrow = attrs.arrow;
    var lineWidth = attrs.lineWidth;
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(x1, y1);
    if (arrow) {
      var v = new Vector2$8(x2 - x1, y2 - y1);
      var end = arrow_1.getEndPoint(v, new Vector2$8(x2, y2), lineWidth);
      context.lineTo(end.x, end.y);
      arrow_1.makeArrow(context, v, end, lineWidth);
    } else {
      context.lineTo(x2, y2);
    }
  },
  getPoint: function (t) {
    var attrs = this.__attrs;
    return {
      x: line.at(attrs.x1, attrs.x2, t),
      y: line.at(attrs.y1, attrs.y2, t)
    };
  }
});

var line$2 = Line;

/**
 * @fileOverview 图像
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */




var CImage = function (cfg) {
  CImage.superclass.constructor.call(this, cfg);
};

CImage.ATTRS = {
  x: 0,
  y: 0,
  img: undefined,
  width: 0,
  height: 0,
  sx: null,
  sy: null,
  swidth: null,
  sheight: null
};

index$8.extend(CImage, shape);

index$8.augment(CImage, {
  type: 'image',
  __afterSetAttrImg: function (img) {
    this.__setAttrImg(img);
  },
  __afterSetAttrAll: function (params) {
    if (params.img) {
      this.__setAttrImg(params.img);
    }
  },
  isHitBox: function () {
    return false;
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = attrs.width;
    var height = attrs.height;

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  },
  isPointInPath: function (x, y) {
    var attrs = this.__attrs;
    if (this.get('toDraw') || !attrs.img) {
      return false;
    }
    var rx = attrs.x;
    var ry = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    return inside.rect(rx, ry, width, height, x, y);
  },
  __setLoading: function (loading) {
    var canvas = this.get('canvas');
    if (loading === false && this.get('toDraw') === true) {
      this.__cfg.loading = false;
      canvas.draw();
    }
    return loading;
  },
  __setAttrImg: function (img) {
    var self = this;
    var attrs = self.__attrs;
    if (index$8.isString(img)) {
      var image = new Image();
      image.onload = function () {
        if (self.get('destroyed')) return false;
        self.attr('imgSrc', img);
        self.attr('img', image);
        var callback = self.get('callback');
        if (callback) {
          callback.call(self);
        }
        self.set('loading', false);
      };
      image.src = img;
      self.set('loading', true);
    } else if (img instanceof Image) {
      if (!attrs.width) {
        self.attr('width', img.width);
      }

      if (!attrs.height) {
        self.attr('height', img.height);
      }
      return img;
    } else if (img instanceof HTMLElement && index$8.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS') {
      if (!attrs.width) {
        self.attr('width', Number(img.getAttribute('width')));
      }

      if (!attrs.height) {
        self.attr('height', Number(img.getAttribute('height')));
      }
      return img;
    } else if (img instanceof ImageData) {
      if (!attrs.width) {
        self.attr('width', img.width);
      }

      if (!attrs.height) {
        self.attr('height', img.height);
      }
      return img;
    } else {
      return null;
    }
  },
  drawInner: function (context) {
    if (this.get('loading')) {
      this.set('toDraw', true);
      return;
    }
    this.__drawImage(context);
  },
  __drawImage: function (context) {
    var attrs = this.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var img = attrs.img;
    var width = attrs.width;
    var height = attrs.height;
    var sx = attrs.sx;
    var sy = attrs.sy;
    var swidth = attrs.swidth;
    var sheight = attrs.sheight;
    this.set('toDraw', false);

    if (img instanceof Image || img instanceof HTMLElement && index$8.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS') {
      if (index$8.isNil(sx) || index$8.isNil(sy) || index$8.isNil(swidth) || index$8.isNil(sheight)) {
        context.drawImage(img, x, y, width, height);
        return;
      }
      if (!index$8.isNil(sx) && !index$8.isNil(sy) && !index$8.isNil(swidth) && !index$8.isNil(sheight)) {
        context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
        return;
      }
    } else if (img instanceof ImageData) {
      context.putImageData(img, x, y, sx || 0, sy || 0, swidth || width, sheight || height);
      return;
    }
    return;
  }
});

var image = CImage;

/**
 * @fileOverview polygon
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */




var Polygon = function (cfg) {
  Polygon.superclass.constructor.call(this, cfg);
};

Polygon.ATTRS = {
  points: null,
  lineWidth: 1
};

index$8.extend(Polygon, shape);

index$8.augment(Polygon, {
  canFill: true,
  canStroke: true,
  type: 'polygon',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    var lineWidth = attrs.lineWidth;
    if (!points || points.length === 0) {
      return null;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    index$8.each(points, function (point) {
      var x = point[0];
      var y = point[1];
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }

      if (y < minY) {
        minY = y;
      }

      if (y > maxY) {
        maxY = y;
      }
    });

    var halfWidth = lineWidth / 2;
    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var self = this;
    var fill = self.hasFill();
    var stroke = self.hasStroke();

    if (fill && stroke) {
      return self.__isPointInFill(x, y) || self.__isPointInStroke(x, y);
    }

    if (fill) {
      return self.__isPointInFill(x, y);
    }

    if (stroke) {
      return self.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function (x, y) {
    var self = this;
    var context = self.get('context');
    self.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke: function (x, y) {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    if (points.length < 2) {
      return false;
    }
    var lineWidth = attrs.lineWidth;
    var outPoints = points.slice(0);
    if (points.length >= 3) {
      outPoints.push(points[0]);
    }

    return inside.polyline(outPoints, lineWidth, x, y);
  },
  createPath: function (context) {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    if (points.length < 2) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    index$8.each(points, function (point, index) {
      if (index === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    });
    context.closePath();
  }
});

var polygon = Polygon;

/**
 * @fileOverview polyline
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */






var Vector2$9 = index$14.Vector2;

var Polyline = function (cfg) {
  Polyline.superclass.constructor.call(this, cfg);
};

Polyline.ATTRS = {
  points: null,
  lineWidth: 1,
  arrow: false,
  tCache: null
};

index$8.extend(Polyline, shape);

index$8.augment(Polyline, {
  canStroke: true,
  type: 'polyline',
  tCache: null, // 缓存各点的t
  getDefaultAttrs: function () {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var lineWidth = attrs.lineWidth;
    var points = attrs.points;
    if (!points || points.length === 0) {
      return null;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    index$8.each(points, function (point) {
      var x = point[0];
      var y = point[1];
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }

      if (y < minY) {
        minY = y;
      }

      if (y > maxY) {
        maxY = y;
      }
    });

    var halfWidth = lineWidth / 2;
    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
    };
  },
  __setTcache: function () {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    var totalLength = 0;
    var tempLength = 0;
    var tCache = [];
    var segmentT = void 0;
    var segmentL = void 0;
    if (!points || points.length === 0) {
      return;
    }

    index$8.each(points, function (p, i) {
      if (points[i + 1]) {
        totalLength += line.len(p[0], p[1], points[i + 1][0], points[i + 1][1]);
      }
    });
    if (totalLength <= 0) {
      return;
    }
    index$8.each(points, function (p, i) {
      if (points[i + 1]) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = line.len(p[0], p[1], points[i + 1][0], points[i + 1][1]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });
    this.tCache = tCache;
  },
  isPointInPath: function (x, y) {
    var self = this;
    var attrs = self.__attrs;
    if (self.hasStroke()) {
      var points = attrs.points;
      if (points.length < 2) {
        return false;
      }
      var lineWidth = attrs.lineWidth;
      return inside.polyline(points, lineWidth, x, y);
    }
    return false;
  },
  createPath: function (context) {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    var arrow = attrs.arrow;
    var lineWidth = attrs.lineWidth;
    var l = void 0;
    var i = void 0;

    if (points.length < 2) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (i = 1, l = points.length - 1; i < l; i++) {
      context.lineTo(points[i][0], points[i][1]);
    }
    if (arrow) {
      var v = new Vector2$9(points[l][0] - points[l - 1][0], points[l][1] - points[l - 1][1]);
      var end = arrow_1.getEndPoint(v, new Vector2$9(points[l][0], points[l][1]), lineWidth);
      context.lineTo(end.x, end.y);
      arrow_1.makeArrow(context, v, end, lineWidth);
    } else {
      context.lineTo(points[l][0], points[l][1]);
    }
  },
  getPoint: function (t) {
    var attrs = this.__attrs;
    var points = attrs.points;
    var tCache = this.tCache;
    var subt = void 0;
    var index = void 0;
    if (!tCache) {
      this.__setTcache();
      tCache = this.tCache;
    }
    index$8.each(tCache, function (v, i) {
      if (t >= v[0] && t <= v[1]) {
        subt = (t - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });
    return {
      x: line.at(points[index][0], points[index + 1][0], subt),
      y: line.at(points[index][1], points[index + 1][1], subt)
    };
  }
});

var polyline = Polyline;

/**
 * @fileOverview arc
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */


var Vector2$10 = index$14.Vector2;





var Arc = function (cfg) {
  Arc.superclass.constructor.call(this, cfg);
};

Arc.ATTRS = {
  x: 0,
  y: 0,
  r: 0,
  startAngle: 0,
  endAngle: 0,
  clockwise: false,
  lineWidth: 1,
  arrow: false
};

index$8.extend(Arc, shape);

index$8.augment(Arc, {
  canStroke: true,
  type: 'arc',
  getDefaultAttrs: function () {
    return {
      x: 0,
      y: 0,
      r: 0,
      startAngle: 0,
      endAngle: 0,
      clockwise: false,
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;
    var halfWidth = lineWidth / 2;
    var box = arc.box(cx, cy, r, startAngle, endAngle, clockwise);
    box.minX -= halfWidth;
    box.minY -= halfWidth;
    box.maxX += halfWidth;
    box.maxY += halfWidth;
    return box;
  },
  isPointInPath: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;

    if (this.hasStroke()) {
      return inside.arcline(cx, cy, r, startAngle, endAngle, clockwise, lineWidth, x, y);
    }
    return false;
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;
    context = context || self.get('context');

    context.beginPath();
    context.arc(cx, cy, r, startAngle, endAngle, clockwise);

    if (arrow) {
      var end = {
        x: cx + r * Math.cos(endAngle),
        y: cy + r * Math.sin(endAngle)
      };

      var v = new Vector2$10(-r * Math.sin(endAngle), r * Math.cos(endAngle));
      if (clockwise) {
        v.multiplyScaler(-1);
      }
      arrow_1.makeArrow(context, v, end, lineWidth);
    }
  }
});

var arc$2 = Arc;

/**
 * @fileOverview 扇形
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */





var Vector2$11 = index$14.Vector2;

var Fan = function (cfg) {
  Fan.superclass.constructor.call(this, cfg);
};

Fan.ATTRS = {
  x: 0,
  y: 0,
  rs: 0,
  re: 0,
  startAngle: 0,
  endAngle: 0,
  clockwise: false,
  lineWidth: 1
};

index$8.extend(Fan, shape);

index$8.augment(Fan, {
  canFill: true,
  canStroke: true,
  type: 'fan',
  getDefaultAttrs: function () {
    return {
      clockwise: false,
      lineWidth: 1,
      rs: 0,
      re: 0
    };
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rs = attrs.rs;
    var re = attrs.re;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;

    var boxs = arc.box(cx, cy, rs, startAngle, endAngle, clockwise);
    var boxe = arc.box(cx, cy, re, startAngle, endAngle, clockwise);
    var minX = Math.min(boxs.minX, boxe.minX);
    var minY = Math.min(boxs.minY, boxe.minY);
    var maxX = Math.max(boxs.maxX, boxe.maxX);
    var maxY = Math.max(boxs.maxY, boxe.maxY);

    var halfWidth = lineWidth / 2;
    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var fill = this.hasFill();
    var stroke = this.hasStroke();

    if (fill && stroke) {
      return this.__isPointInFill(x, y) || this.__isPointInStroke(x, y);
    }

    if (fill) {
      return this.__isPointInFill(x, y);
    }

    if (stroke) {
      return this.__isPointInStroke(x, y);
    }
    return false;
  },
  __isPointInFill: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rs = attrs.rs;
    var re = attrs.re;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;

    var v1 = new Vector2$11(1, 0);
    var subv = new Vector2$11(x - cx, y - cy);
    var angle = v1.angleTo(subv);

    var angle1 = arc.nearAngle(angle, startAngle, endAngle, clockwise);

    if (index$8.isNumberEqual(angle, angle1)) {
      var ls = subv.lengthSq();
      if (rs * rs <= ls && ls <= re * re) {
        return true;
      }
    }
    return false;
  },
  __isPointInStroke: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rs = attrs.rs;
    var re = attrs.re;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;

    var ssp = {
      x: Math.cos(startAngle) * rs + cx,
      y: Math.sin(startAngle) * rs + cy
    };
    var sep = {
      x: Math.cos(startAngle) * re + cx,
      y: Math.sin(startAngle) * re + cy
    };
    var esp = {
      x: Math.cos(endAngle) * rs + cx,
      y: Math.sin(endAngle) * rs + cy
    };
    var eep = {
      x: Math.cos(endAngle) * re + cx,
      y: Math.sin(endAngle) * re + cy
    };

    if (inside.line(ssp.x, ssp.y, sep.x, sep.y, lineWidth, x, y)) {
      return true;
    }

    if (inside.line(esp.x, esp.y, eep.x, eep.y, lineWidth, x, y)) {
      return true;
    }

    if (inside.arcline(cx, cy, rs, startAngle, endAngle, clockwise, lineWidth, x, y)) {
      return true;
    }

    if (inside.arcline(cx, cy, re, startAngle, endAngle, clockwise, lineWidth, x, y)) {
      return true;
    }

    return false;
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rs = attrs.rs;
    var re = attrs.re;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;

    var ssp = {
      x: Math.cos(startAngle) * rs + cx,
      y: Math.sin(startAngle) * rs + cy
    };
    var sep = {
      x: Math.cos(startAngle) * re + cx,
      y: Math.sin(startAngle) * re + cy
    };
    var esp = {
      x: Math.cos(endAngle) * rs + cx,
      y: Math.sin(endAngle) * rs + cy
    };

    context = context || self.get('context');
    context.beginPath();
    context.moveTo(ssp.x, ssp.y);
    context.lineTo(sep.x, sep.y);
    context.arc(cx, cy, re, startAngle, endAngle, clockwise);
    context.lineTo(esp.x, esp.y);
    context.arc(cx, cy, rs, endAngle, startAngle, !clockwise);
    context.closePath();
  }
});

var fan = Fan;

/**
 * @fileOverview Cubic
 * @author hankaiai@126.com
 * @ignore
 */





var Vector2$12 = index$14.Vector2;

var Cubic = function (cfg) {
  Cubic.superclass.constructor.call(this, cfg);
};

Cubic.ATTRS = {
  p1: null,
  p2: null,
  p3: null,
  p4: null,
  lineWidth: 1,
  arrow: false
};

index$8.extend(Cubic, shape);

index$8.augment(Cubic, {
  canStroke: true,
  type: 'cubic',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var p4 = attrs.p4;
    var i = void 0;
    var l = void 0;

    if (index$8.isNil(p1) || index$8.isNil(p2) || index$8.isNil(p3) || index$8.isNil(p4)) {
      return null;
    }
    var halfWidth = attrs.lineWidth / 2;

    var xDim = cubic.extrema(p1[0], p2[0], p3[0], p4[0]);
    for (i = 0, l = xDim.length; i < l; i++) {
      xDim[i] = cubic.at(p1[0], p2[0], p3[0], p4[0], xDim[i]);
    }
    var yDim = cubic.extrema(p1[1], p2[1], p3[1], p4[1]);
    for (i = 0, l = yDim.length; i < l; i++) {
      yDim[i] = cubic.at(p1[1], p2[1], p3[1], p4[1], yDim[i]);
    }
    xDim.push(p1[0], p4[0]);
    yDim.push(p1[1], p4[1]);

    return {
      minX: Math.min.apply(Math, xDim) - halfWidth,
      maxX: Math.max.apply(Math, xDim) + halfWidth,
      minY: Math.min.apply(Math, yDim) - halfWidth,
      maxY: Math.max.apply(Math, yDim) + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var attrs = this.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var p4 = attrs.p4;
    var lineWidth = attrs.lineWidth;

    return inside.cubicline(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1], lineWidth, x, y);
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var p4 = attrs.p4;
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;
    context = context || self.get('context');
    if (index$8.isNil(p1) || index$8.isNil(p2) || index$8.isNil(p3) || index$8.isNil(p4)) {
      return;
    }

    context.beginPath();
    context.moveTo(p1[0], p1[1]);

    if (arrow) {
      var v = new Vector2$12(p4[0] - p3[0], p4[1] - p3[1]);
      var end = arrow_1.getEndPoint(v, new Vector2$12(p4[0], p4[1]), lineWidth);
      context.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], end.x, end.y);
      arrow_1.makeArrow(context, v, end, lineWidth);
    } else {
      context.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
    }
  },
  getPoint: function (t) {
    var attrs = this.__attrs;
    return {
      x: cubic.at(attrs.p4[0], attrs.p3[0], attrs.p2[0], attrs.p1[0], t),
      y: cubic.at(attrs.p4[1], attrs.p3[1], attrs.p2[1], attrs.p1[1], t)
    };
  }
});

var cubic$2 = Cubic;

/**
 * @fileOverview Quadratic
 * @author hankaiai@126.com
 * @ignore
 */





var Vector2$13 = index$14.Vector2;

var Quadratic = function (cfg) {
  Quadratic.superclass.constructor.call(this, cfg);
};

Quadratic.ATTRS = {
  p1: null,
  p2: null,
  p3: null,
  lineWidth: 1,
  arrow: false
};

index$8.extend(Quadratic, shape);

index$8.augment(Quadratic, {
  canStroke: true,
  type: 'quadratic',
  getDefaultAttrs: function () {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function () {
    var self = this;
    var attrs = self.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var i = void 0;
    var l = void 0;

    if (index$8.isNil(p1) || index$8.isNil(p2) || index$8.isNil(p3)) {
      return null;
    }
    var halfWidth = attrs.lineWidth / 2;

    var xDims = quadratic.extrema(p1[0], p2[0], p3[0]);
    for (i = 0, l = xDims.length; i < l; i++) {
      xDims[i] = quadratic.at(p1[0], p2[0], p3[0], xDims[i]);
    }
    xDims.push(p1[0], p3[0]);
    var yDims = quadratic.extrema(p1[1], p2[1], p3[1]);
    for (i = 0, l = yDims.length; i < l; i++) {
      yDims[i] = quadratic.at(p1[1], p2[1], p3[1], yDims[i]);
    }
    yDims.push(p1[1], p3[1]);

    return {
      minX: Math.min.apply(Math, xDims) - halfWidth,
      maxX: Math.max.apply(Math, xDims) + halfWidth,
      minY: Math.min.apply(Math, yDims) - halfWidth,
      maxY: Math.max.apply(Math, yDims) + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var self = this;
    var attrs = self.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var lineWidth = attrs.lineWidth;

    return inside.quadraticline(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], lineWidth, x, y);
  },
  createPath: function (context) {
    var self = this;
    var attrs = self.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;

    if (index$8.isNil(p1) || index$8.isNil(p2) || index$8.isNil(p3)) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(p1[0], p1[1]);

    if (arrow) {
      var v = new Vector2$13(p3[0] - p2[0], p3[1] - p2[1]);
      var end = arrow_1.getEndPoint(v, new Vector2$13(p3[0], p3[1]), lineWidth);
      context.quadraticCurveTo(p2[0], p2[1], end.x, end.y);
      arrow_1.makeArrow(context, v, end, lineWidth);
    } else {
      context.quadraticCurveTo(p2[0], p2[1], p3[0], p3[1]);
    }
  },
  getPoint: function (t) {
    var attrs = this.__attrs;
    return {
      x: quadratic.at(attrs.p1[0], attrs.p2[0], attrs.p3[0], t),
      y: quadratic.at(attrs.p1[1], attrs.p2[1], attrs.p3[1], t)
    };
  }
});

var quadratic$2 = Quadratic;

var Marker = function (cfg) {
  Marker.superclass.constructor.call(this, cfg);
};

Marker.Symbols = {
  // 圆
  circle: function (x, y, r, ctx) {
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
  },

  // 正方形
  square: function (x, y, r, ctx) {
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.lineTo(x - r, y + r);
    ctx.closePath();
  },

  // 菱形
  diamond: function (x, y, r, ctx) {
    ctx.moveTo(x - r, y);
    ctx.lineTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.closePath();
  },

  // 三角形
  triangle: function (x, y, r, ctx) {
    var diffX = r / 0.966;
    var diffY = r;
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + diffX, y + diffY);
    ctx.lineTo(x - diffX, y + diffY);
    ctx.closePath();
  },

  // 倒三角形
  'triangle-down': function (x, y, r, ctx) {
    var diffX = r / 0.966;
    var diffY = r;
    ctx.moveTo(x, y + r);
    ctx.lineTo(x + diffX, y - diffY);
    ctx.lineTo(x - diffX, y - diffY);
    ctx.closePath();
  }
};

Marker.ATTRS = {
  path: null,
  lineWidth: 1
};

index$8.extend(Marker, shape);

index$8.augment(Marker, {
  type: 'marker',
  canFill: true,
  canStroke: true,
  getDefaultAttrs: function () {
    return {
      x: 0,
      y: 0,
      lineWidth: 1
    };
  },
  calculateBox: function () {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.radius;
    var lineWidth = attrs.lineWidth;
    var halfWidth = lineWidth / 2 + r;
    return {
      minX: cx - halfWidth,
      minY: cy - halfWidth,
      maxX: cx + halfWidth,
      maxY: cy + halfWidth
    };
  },
  isPointInPath: function (x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.radius;
    return inside.circle(cx, cy, r, x, y);
  },
  createPath: function (context) {
    var attrs = this.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var r = attrs.radius;
    var symbol = attrs.symbol || 'circle';
    var method = void 0;
    if (index$8.isFunction(symbol)) {
      method = symbol;
    } else {
      method = Marker.Symbols[symbol];
    }
    context.beginPath();
    method(x, y, r, context);
  } /**/

});

var marker = Marker;

var Shape = {
  Rect: rect,
  Circle: circle,
  Ellipse: ellipse,
  Path: path$2,
  Text: text,
  Line: line$2,
  Image: image,
  Polygon: polygon,
  Polyline: polyline,
  Arc: arc$2,
  Fan: fan,
  Cubic: cubic$2,
  Quadratic: quadratic$2,
  Marker: marker
};

var index$26 = Shape;

var Vector3 = index$14.Vector3;


var SHAPE_MAP = {}; // 缓存图形类型

function find(children, x, y) {
  var rst = void 0;
  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    if (child.__cfg.visible && child.__cfg.capture) {
      if (child.isGroup) {
        rst = child.getShape(x, y);
      } else if (child.isHit(x, y)) {
        rst = child;
      }
    }
    if (rst) {
      break;
    }
  }
  return rst;
}

var Group = function (cfg) {
  Group.superclass.constructor.call(this, cfg);
  this.set('children', []);

  this._beforeRenderUI();
  this._renderUI();
  this._bindUI();
};

function initClassCfgs(c) {
  if (c.__cfg || c === Group) {
    return;
  }
  var superCon = c.superclass.constructor;
  if (superCon && !superCon.__cfg) {
    initClassCfgs(superCon);
  }
  c.__cfg = {};

  index$8.merge(c.__cfg, superCon.__cfg);
  index$8.merge(c.__cfg, c.CFG);
}

index$8.extend(Group, element);

index$8.augment(Group, {
  isGroup: true,
  canFill: true,
  canStroke: true,
  getDefaultCfg: function () {
    initClassCfgs(this.constructor);
    return index$8.merge({}, this.constructor.__cfg);
  },
  _beforeRenderUI: function () {},
  _renderUI: function () {},
  _bindUI: function () {},
  addShape: function (type, cfg) {
    var canvas = this.get('canvas');
    cfg = cfg || {};
    var shapeType = SHAPE_MAP[type];
    if (!shapeType) {
      shapeType = index$8.upperFirst(type);
      SHAPE_MAP[type] = shapeType;
    }
    if (cfg.attrs) {
      var attrs = cfg.attrs;
      if (type === 'text') {
        // 临时解决
        var topFontFamily = canvas.get('fontFamily');
        if (topFontFamily) {
          attrs.fontFamily = attrs.fontFamily ? attrs.fontFamily : topFontFamily;
        }
      }
    }
    cfg.canvas = canvas;
    cfg.type = type;
    var rst = new index$26[shapeType](cfg);
    this.add(rst);
    return rst;
  },

  /** 添加图组
   * @param  {Function|Object|undefined} param 图组类
   * @param  {Object} cfg 配置项
   * @return {Object} rst 图组
   */
  addGroup: function (param, cfg) {
    var canvas = this.get('canvas');
    var rst = void 0;
    cfg = index$8.merge({}, cfg);
    if (index$8.isFunction(param)) {
      if (cfg) {
        cfg.canvas = canvas;
        cfg.parent = this;
        rst = new param(cfg);
      } else {
        rst = new param({
          canvas: canvas,
          parent: this
        });
      }
      this.add(rst);
    } else if (index$8.isObject(param)) {
      param.canvas = canvas;
      rst = new Group(param);
      this.add(rst);
    } else if (param === undefined) {
      rst = new Group();
      this.add(rst);
    } else {
      return false;
    }
    return rst;
  },

  /** 绘制背景
   * @param  {Array} padding 内边距
   * @param  {Attrs} attrs 图形属性
   * @param  {Shape} backShape 背景图形
   * @return {Object} 背景层对象
   */
  renderBack: function (padding, attrs) {
    var backShape = this.get('backShape');
    var innerBox = this.getBBox();
    var parent = this.get('parent'); // getParent
    index$8.merge(attrs, {
      x: innerBox.minX - padding[3],
      y: innerBox.minY - padding[0],
      width: innerBox.width + padding[1] + padding[3],
      height: innerBox.height + padding[0] + padding[2]
    });
    if (backShape) {
      backShape.attr(attrs);
    } else {
      backShape = parent.addShape('rect', {
        zIndex: -1,
        attrs: attrs
      });
    }
    this.set('backShape', backShape);
    parent.sort();
    return backShape;
  },
  removeChild: function (item, destroy) {
    if (arguments.length >= 2) {
      if (this.contain(item)) {
        item.remove(destroy);
      }
    } else {
      if (arguments.length === 1) {
        if (index$8.isBoolean(item)) {
          destroy = item;
        } else {
          if (this.contain(item)) {
            item.remove(true);
          }
          return this;
        }
      }
      if (arguments.length === 0) {
        destroy = true;
      }

      Group.superclass.remove.call(this, destroy);
    }
    return this;
  },

  /**
   * 向组中添加shape或者group
   * @param {Object} items 图形或者分组
   * @return {Object} group 本尊
   */
  add: function (items) {
    var self = this;
    var children = self.get('children');
    if (index$8.isArray(items)) {
      index$8.each(items, function (item) {
        var parent = item.get('parent');
        if (parent) {
          parent.removeChild(item, false);
        }
        self.__setEvn(item);
      });
      children.push.apply(children, items);
    } else {
      var item = items;
      var parent = item.get('parent');
      if (parent) {
        parent.removeChild(item, false);
      }
      self.__setEvn(item);
      children.push(item);
    }
    return self;
  },
  contain: function (item) {
    var children = this.get('children');
    return children.indexOf(item) > -1;
  },
  getChildByIndex: function (index) {
    var children = this.get('children');
    return children[index];
  },
  getFirst: function () {
    return this.getChildByIndex(0);
  },
  getLast: function () {
    var lastIndex = this.get('children').length - 1;
    return this.getChildByIndex(lastIndex);
  },
  __setEvn: function (item) {
    var self = this;
    item.__cfg.parent = self;
    item.__cfg.context = self.__cfg.context;
    item.__cfg.canvas = self.__cfg.canvas;
    var clip = item.__attrs.clip;
    if (clip) {
      clip.setSilent('parent', self);
      clip.setSilent('context', self.get('context'));
    }
    var children = item.__cfg.children;
    if (children) {
      index$8.each(children, function (child) {
        item.__setEvn(child);
      });
    }
  },
  getBBox: function () {
    var self = this;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    var children = self.get('children');
    index$8.each(children, function (child) {
      if (child.get('visible')) {
        var _box = child.getBBox();
        if (!_box) {
          return true;
        }
        var leftTop = new Vector3(_box.minX, _box.minY, 1);
        var leftBottom = new Vector3(_box.minX, _box.maxY, 1);
        var rightTop = new Vector3(_box.maxX, _box.minY, 1);
        var rightBottom = new Vector3(_box.maxX, _box.maxY, 1);

        child.apply(leftTop);
        child.apply(leftBottom);
        child.apply(rightTop);
        child.apply(rightBottom);

        var boxMinX = Math.min(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x);
        var boxMaxX = Math.max(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x);
        var boxMinY = Math.min(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y);
        var boxMaxY = Math.max(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y);

        if (boxMinX < minX) {
          minX = boxMinX;
        }

        if (boxMaxX > maxX) {
          maxX = boxMaxX;
        }

        if (boxMinY < minY) {
          minY = boxMinY;
        }

        if (boxMaxY > maxY) {
          maxY = boxMaxY;
        }
      }
    });
    var box = {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
    box.x = box.minX;
    box.y = box.minY;
    box.width = box.maxX - box.minX;
    box.height = box.maxY - box.minY;
    return box;
  },
  drawInner: function (context) {
    var children = this.get('children');
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      child.draw(context);
    }
    return this;
  },
  getCount: function () {
    return this.get('children').length;
  },
  sort: function () {
    var children = this.get('children');
    children.sort(function (obj1, obj2) {
      return obj1.get('zIndex') - obj2.get('zIndex');
    });
    return this;
  },
  find: function (id) {
    return this.findBy(function (item) {
      return item.get('id') === id;
    });
  },

  /**
   * 根据查找函数查找分组或者图形
   * @param  {Function} fn 匹配函数
   * @return {Canvas.Base} 分组或者图形
   */
  findBy: function (fn) {
    var children = this.get('children');
    var rst = null;

    index$8.each(children, function (item) {
      if (fn(item)) {
        rst = item;
      } else if (item.findBy) {
        rst = item.findBy(fn);
      }
      if (rst) {
        return false;
      }
    });
    return rst;
  },
  findAllBy: function (fn) {
    var children = this.get('children');
    var rst = [];
    var childRst = [];
    index$8.each(children, function (item) {
      if (fn(item)) {
        rst.push(item);
      }
      if (item.findAllBy) {
        childRst = item.findAllBy(fn);
        rst = rst.concat(childRst);
      }
    });
    return rst;
  },

  /**
   * 根据x，y轴坐标获取对应的图形
   * @param  {Number} x x坐标
   * @param  {Number} y y坐标
   * @return {Object}  最上面的图形
   */
  getShape: function (x, y) {
    var self = this;
    var clip = self.__attrs.clip;
    var children = self.__cfg.children;
    var rst = void 0;
    if (clip) {
      if (clip.inside(x, y)) {
        rst = find(children, x, y);
      }
    } else {
      rst = find(children, x, y);
    }
    return rst;
  },
  clearTotalMatrix: function () {
    var m = this.get('totalMatrix');
    if (m) {
      this.setSilent('totalMatrix', null);
      var children = this.__cfg.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        child.clearTotalMatrix();
      }
    }
  },
  clear: function () {
    var children = this.get('children');

    while (children.length !== 0) {
      children[children.length - 1].remove();
    }
    return this;
  },
  destroy: function () {
    if (this.get('destroyed')) {
      return;
    }
    this.clear();
    Group.superclass.destroy.call(this);
  }
});

var group = Group;

var G = {
  Group: group,
  Shape: shape,
  Rect: rect,
  Circle: circle,
  Ellipse: ellipse,
  Path: path$2,
  Text: text,
  Line: line$2,
  Image: image,
  Polygon: polygon,
  Polyline: polyline,
  Arc: arc$2,
  Fan: fan,
  Cubic: cubic$2,
  Quadratic: quadratic$2,
  Marker: marker,
  debug: function (debug) {
    common$2.debug = debug;
  }
};

var index$12 = G;

var Canvas = function (cfg) {
  Canvas.superclass.constructor.call(this, cfg);
};

Canvas.CFG = {
  eventEnable: true,
  /**
   * 像素宽度
   * @type {Number}
   */
  width: null,
  /**
   * 像素高度
   * @type {Number}
   */
  height: null,
  /**
   * 画布宽度
   * @type {Number}
   */
  widthCanvas: null,
  /**
   * 画布高度
   * @type {Number}
   */
  heightCanvas: null,
  /**
   * CSS宽
   * @type {String}
   */
  widthStyle: null,
  /**
   * CSS高
   * @type {String}
   */
  heightStyle: null,
  /**
   * 容器DOM
   * @type {Object}
   */
  containerDOM: null,
  /**
   * 当前Canvas的DOM
   * @type {Object}
   */
  canvasDOM: null,
  /**
   * 屏幕像素比
   * @type {Number}
   */
  pixelRatio: null
};

index$8.extend(Canvas, index$12.Group);

index$8.augment(Canvas, {
  init: function () {
    Canvas.superclass.init.call(this);
    this._setGlobalParam();
    this._setDOM();
    this._setInitSize();
    this._setCanvas();
    this._scale();
    if (this.get('eventEnable')) {
      this._registEvents();
    }
  },
  _registEvents: function () {
    var self = this;
    var el = self.get('el');
    var mouseEvent$$1 = new mouseEvent(self);

    el.addEventListener('mouseout', function (e) {
      mouseEvent$$1.mouseout(e);
    }, false);

    el.addEventListener('mouseover', function (e) {
      mouseEvent$$1.mouseover(e);
    }, false);

    el.addEventListener('mousemove', function (e) {
      mouseEvent$$1.mousemove(e);
    }, false);

    el.addEventListener('mousedown', function (e) {
      mouseEvent$$1.mousedown(e);
    }, false);

    el.addEventListener('mouseup', function (e) {
      mouseEvent$$1.mouseup(e);
    }, false);

    el.addEventListener('click', function (e) {
      mouseEvent$$1.click(e);
    }, false);

    el.addEventListener('dblclick', function (e) {
      mouseEvent$$1.dblclick(e);
    }, false);
  },
  _scale: function () {
    var pixelRatio = this.get('pixelRatio');
    this.scale(pixelRatio, pixelRatio);
  },
  _setCanvas: function () {
    var canvasDOM = this.get('canvasDOM');
    this.set('el', canvasDOM);
    this.set('context', canvasDOM.getContext('2d'));
    this.set('canvas', this);
  },
  _setGlobalParam: function () {
    var pixelRatio = this.get('pixelRatio');
    if (!pixelRatio) {
      this.set('pixelRatio', index$8.getRatio());
    }
    return;
  },
  _setDOM: function () {
    this._setContainer();
    this._setLayer();
  },
  _setContainer: function () {
    var containerId = this.get('containerId');
    var containerDOM = this.get('containerDOM');
    if (!containerDOM) {
      containerDOM = document.getElementById(containerId);
      this.set('containerDOM', containerDOM);
    }
    index$8.modiCSS(containerDOM, {
      position: 'relative'
    });
  },
  _setLayer: function () {
    var containerDOM = this.get('containerDOM');
    var canvasId = index$8.uniqueId('canvas_');
    if (containerDOM) {
      var canvasDOM = index$8.createDom('<canvas id="' + canvasId + '"></canvas>');
      containerDOM.appendChild(canvasDOM);
      this.set('canvasDOM', canvasDOM);
    }
  },
  _setInitSize: function () {
    this.changeSize(this.get('width'), this.get('height'));
  },
  _reSize: function () {
    var canvasDOM = this.get('canvasDOM');
    var widthCanvas = this.get('widthCanvas');
    var heightCanvas = this.get('heightCanvas');
    var widthStyle = this.get('widthStyle');
    var heightStyle = this.get('heightStyle');

    canvasDOM.style.width = widthStyle;
    canvasDOM.style.height = heightStyle;
    canvasDOM.setAttribute('width', widthCanvas);
    canvasDOM.setAttribute('height', heightCanvas);
  },
  getWidth: function () {
    var pixelRatio = this.get('pixelRatio');
    var width = this.get('width');
    return width * pixelRatio;
  },
  getHeight: function () {
    var pixelRatio = this.get('pixelRatio');
    var height = this.get('height');
    return height * pixelRatio;
  },
  changeSize: function (width, height) {
    var pixelRatio = this.get('pixelRatio');
    var widthCanvas = width * pixelRatio;
    var heightCanvas = height * pixelRatio;

    this.set('widthCanvas', widthCanvas);
    this.set('heightCanvas', heightCanvas);
    this.set('widthStyle', width + 'px');
    this.set('heightStyle', height + 'px');
    this.set('width', width);
    this.set('height', height);
    this._reSize();
  },

  /**
   * 将窗口坐标转变成 canvas 坐标
   * @param  {Number} clientX 窗口x坐标
   * @param  {Number} clientY 窗口y坐标
   * @return {Object} canvas坐标
   */
  getPointByClient: function (clientX, clientY) {
    var el = this.get('el');
    var bbox = el.getBoundingClientRect();
    var width = bbox.right - bbox.left;
    var height = bbox.bottom - bbox.top;
    return {
      x: (clientX - bbox.left) * (el.width / width),
      y: (clientY - bbox.top) * (el.height / height)
    };
  },
  getClientByPoint: function (x, y) {
    var el = this.get('el');
    var bbox = el.getBoundingClientRect();
    var width = bbox.right - bbox.left;
    var height = bbox.bottom - bbox.top;
    return {
      clientX: x / (el.width / width) + bbox.left,
      clientY: y / (el.height / height) + bbox.top
    };
  },
  beforeDraw: function () {
    var context = this.get('context');
    var el = this.get('el');
    context && context.clearRect(0, 0, el.width, el.height);
  },
  _beginDraw: function () {
    this.setSilent('toDraw', true);
  },
  _endDraw: function () {
    this.setSilent('toDraw', false);
  },
  draw: function () {
    var self = this;
    function drawInner() {
      self.set('animateHandler', index$8.requestAnimationFrame(function () {
        self.set('animateHandler', undefined);
        if (self.get('toDraw')) {
          drawInner();
        }
      }));
      self.beforeDraw();
      try {
        var context = self.get('context');
        Canvas.superclass.draw.call(self, context);
        // self._drawCanvas();
      } catch (ev) {
        // 绘制时异常，中断重绘
        console.warn('error in draw canvas, detail as:');
        console.warn(ev);
        self._endDraw();
      }
      self._endDraw();
    }

    if (self.get('destroyed')) {
      return;
    }
    if (self.get('animateHandler')) {
      this._beginDraw();
    } else {
      drawInner();
    }
  },
  destroy: function () {
    var containerDOM = this.get('containerDOM');
    var canvasDOM = this.get('canvasDOM');
    if (canvasDOM && containerDOM) {
      containerDOM.removeChild(canvasDOM);
    }
    Canvas.superclass.destroy.call(this);
  }
});

var canvas = Canvas;

var matrix$2 = {
  /**
   * 同 G transform
   * @param  {Object} m 矩阵
   * @param  {Array} ts 变换数组同
   * @return  {Object} this 回调函数
   */
  transform: function (m, ts) {
    m = m.clone();
    for (var i = 0, len = ts.length; i < len; i++) {
      var t = ts[i];
      switch (t[0]) {
        case 't':
          m.translate(t[1], t[2]);
          break;
        case 's':
          m.scale(t[1], t[2]);
          break;
        case 'r':
          m.rotate(t[1]);
          break;
        case 'm':
          m.multiply(t[1]);
          break;
        default:
          continue;
      }
    }
    return m;
  },

  /**
   * 基于某点缩放
   * @param  {Object} m 矩阵
   * @param  {Number} sx x缩放
   * @param  {Number} sy y缩放
   * @param  {Number} x 坐标点
   * @param  {Number} y 坐标点
   * @return {Matrix} 返回变换后的矩阵
   */
  scale: function (m, sx, sy, x, y) {
    m = m.clone();
    m.translate(-1 * x, -1 * y);
    m.scale(sx, sy);
    m.translate(x, y);
    return m;
  },

  /**
   * 基于某点旋转
   * @param  {Object} m 矩阵
   * @param  {Number} r 旋转角度，用弧度表示
   * @param  {Number} x 坐标点
   * @param  {Number} y 坐标点
   * @return {Matrix} 返回变换后的矩阵
   */
  rotate: function (m, r, x, y) {
    m = m.clone();
    m.translate(-1 * x, -1 * y);
    m.rotate(r);
    m.translate(x, y);
    return m;
  },

  /**
   * 判断是否是3阶矩阵
   * @param  {Object} m 矩阵
   * @return {Boolean} 返回是否是三阶矩阵
   */
  isMatrix3: function (m) {
    return m.type === 'matrix3';
  }
};

canvas.G = index$12;
canvas.Group = index$12.Group;
canvas.Shape = {};
canvas.Shape.Marker = index$12.Marker;
canvas.PathUtil = {
  parsePathString: index$2.toArray,
  parsePathArray: index$2.toString, // Util.path2string
  path2curve: index$2.toCurve,
  pathToAbsolute: index$2.toAbsolute, // Util.path2Absolute
  catmullRom2bezier: index$2.catmullRomToBezier
};
canvas.MatrixUtil = matrix$2;
canvas.DomUtil = dom;
canvas.Matrix = index$14;

var index = canvas;

return index;

})));
