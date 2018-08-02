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
  /**
  * @param  {Function} fn 实际要执行的函数
  * @param  {Number} threshhold 执行间隔，单位是毫秒（ms）
  * @return {Function}     返回一个“节流”函数
  */
  throttle(fn, threshhold) {
    // 记录上次执行的时间
    let last;
    // 定时器
    let timer;
    // 默认间隔为 250ms
    threshhold || (threshhold = 250);
    // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
    return function() {
      // 保存函数调用时的上下文和参数，传递给 fn
      const context = this;
      const args = arguments;
      const now = +new Date();
      // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
      // 执行 fn，并重新计时
      if (last && now < last + threshhold) {
        clearTimeout(timer);
        // 保证在当前时间区间结束后，再执行一次 fn
        timer = setTimeout(function() {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  },
  /**
   * @param  {Function} fn 实际要执行的函数
   * @param  {Number} threshhold 延迟时间，单位是毫秒（ms）
   * @return {Function}     返回一个“防反跳”了的函数
   */
  debounce(fn, threshhold) {
    // 定时器，用来 setTimeout
    let timer;
    // 返回一个函数，这个函数会在一个时间区间结束后的 threshhold 毫秒时执行 fn 函数
    return function() {
      // 保存函数调用时的上下文和参数，传递给 fn
      const context = this;
      const args = arguments;
      // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
      clearTimeout(timer);
      // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
      // 再过 threshhold 毫秒就执行 fn
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, threshhold);
    };
  }
};
