const Util = require('../index');
const MatrixUtil = require('../matrix');

const ReservedProps = { delay: 'delay' };

function getFromAttrs(toAttrs, shape) {
  const rst = {};
  for (const k in toAttrs) {
    rst[k] = shape.attr(k);
  }
  return rst;
}

function getFormatProps(props, shape) {
  const rst = {
    M: null,
    attrs: {}
  };
  for (const k in props) {
    if (k === 'transform') {
      rst.M = MatrixUtil.transform(shape.getMatrix(), props[k]);
    } else if (k === 'matrix') {
      rst.M = props[k];
    } else if (!ReservedProps[k]) {
      rst.attrs[k] = props[k];
    }
  }
  return rst;
}

module.exports = {
  /**
   * 执行动画
   * @param  {Object}   toProps  动画最终状态
   * @param  {Number}   duration 动画执行时间
   * @param  {String}   easing   动画缓动效果
   * @param  {Function} callback 动画执行后的回调
   * @param  {Number}   delay    动画延迟时间
   */
  animate(toProps, duration, easing, callback, delay = 0) {
    const self = this;
    self.set('animating', true);
    let timeline = self.get('timeline');
    if (!timeline) {
      timeline = self.get('canvas').get('timeline');
      self.setSilent('timeline', timeline);
    }
    const animators = self.get('animators') || [];
    if (!timeline._timer) {
      timeline.initTimer();
    }
    if (Util.isNumber(callback)) {
      delay = callback;
      callback = null;
    }
    if (Util.isFunction(easing)) {
      callback = easing;
      easing = 'easeLinear';
    } else {
      easing = easing ? easing : 'easeLinear';
    }
    const formatProps = getFormatProps(toProps);
    const animator = {
      fromAttrs: getFromAttrs(toProps, self),
      toAttrs: formatProps.attrs,
      fromM: Util.clone(self.getMatrix()),
      toM: formatProps.toM,
      duration,
      easing,
      callback,
      delay,
      startTime: timeline.getTime(),
      id: Util.uniqueId()
    };
    if (animators.length > 0) {
      // todo 合并属性
      // 先检查是否需要合并属性。若有相同的动画，将该属性从前一个动画中删除,直接用后一个动画中

    } else {
      timeline.addAnimator(self);
    }
    animators.push(animator);
    self.setSilent('animators', animators);
    self.setSilent('pause', { isPaused: false });
  },
  stopAnimate() {
    const animators = this.get('animators');
    Util.each(animators, animator => {
      this.attr(animator.toAttrs);
      if (animator.callback) {
        animator.callback();
      }
    });
    this.set('animating', false);
    this.set('animators', []);
    this.setSilent('animator', null);
  },
  pauseAnimate() {
    const self = this;
    self.set('animating', false);
    const timeline = self.get('timeline');
    self.setSilent('pause', {
      isPaused: true,
      pauseTime: timeline.getTime()
    });
    return self;
  },
  resumeAnimate() {
    const self = this;
    self.set('animating', true);
    const timeline = self.get('timeline');
    const current = timeline.getTime();
    const animators = self.get('animators');
    Util.each(animators, animator => {
      animator.startTime = animator.startTime + (current - animator._pauseTime);
      animator._paused = false;
      animator._pauseTime = null;
    });
    self.setSilent('pause', {
      isPaused: false
    });
    self.setSilent('animators', animators);
    return self;
  }
};
