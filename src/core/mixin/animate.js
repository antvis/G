const MatrixUtil = require('../../util/matrix');
const PathUtil = require('../../util/path');
const Util = require('../../util/index');
const d3Ease = require('d3-ease');
const d3Timer = require('d3-timer');
const { interpolate, interpolateArray } = require('d3-interpolate'); // 目前整体动画只需要数值和数组的差值计算
const ReservedProps = {
  delay: 'delay'
};
module.exports = {
  stopAnimate() {
    const self = this;
    const canvas = self.get('canvas');
    if (self.get('destroyed')) {
      return;
    }
    if (self.get('animating')) {
      const clip = self.attr('clip');
      // 如果 clip 在执行动画
      if (clip && clip.get('animating')) {
        clip.stopAnimate();
      }
      const timer = self.get('animateTimer');
      if (timer) {
        timer.stop();
        self.setSilent('animateTimer', null);
      }
      const animateCfg = self.get('animateCfg');
      if (animateCfg) {
        self.attr(animateCfg.toAttrs);
        if (animateCfg.toM) {
          self.setMatrix(animateCfg.toM);
        }
        if (animateCfg.callback) {
          animateCfg.callback();
        }
        self.setSilent('animateCfg', null);
      }
      self.setSilent('animating', false); // 动画停止
      canvas.draw();
    }
  },
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
    const canvas = self.get('canvas');
    const formatProps = getFormatProps(toProps);
    const toAttrs = formatProps.attrs;
    const toM = formatProps.M;
    const fromAttrs = getfromAttrs(toAttrs);
    const fromM = Util.clone(self.getMatrix());
    const repeat = toProps.repeat;
    let timer = self.get('animateTimer');
    timer && timer.stop();
    // 可能不设置 easing
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

    self.setSilent('animating', true); // 处于动画状态
    self.setSilent('animateCfg', {
      toAttrs,
      toM,
      callback
    });

    // 执行动画
    timer = d3Timer.timer(elapsed => {
      if (repeat) {
        excuteRepeat(elapsed);
      } else {
        excuteOnce(elapsed);
      }
    }, delay);

    self.setSilent('animateTimer', timer);

    function excuteRepeat(elapsed) {
      let ratio = (elapsed % duration) / duration;
      ratio = d3Ease[easing](ratio);
      update(ratio);
    }

    function excuteOnce(elapsed) {
      let ratio = elapsed / duration;
      if (ratio < 1) {
        ratio = d3Ease[easing](ratio);
        update(ratio);
      } else {
        update(1); // 保证最后一帧的绘制
        callback && callback();
        self.setSilent('animating', false); // 动画停止
        self.setSilent('animateCfg', null);
        self.setSilent('animateTimer', null);
        timer.stop();
      }
    }

    function update(ratio) {
      const cProps = {}; // 此刻属性
      if (self.get('destroyed')) {
        return;
      }
      let interf; //  差值函数

      for (const k in toAttrs) {
        if (!Util.isEqual(fromAttrs[k], toAttrs[k])) {
          if (k === 'path') {
            const toPath = PathUtil.parsePathString(toAttrs[k]); // 终点状态
            const fromPath = PathUtil.parsePathString(fromAttrs[k]); // 起始状态
            cProps[k] = [];
            for (let i = 0; i < toPath.length; i++) {
              const toPathPoint = toPath[i];
              const fromPathPoint = fromPath[i];
              const cPathPoint = [];
              for (let j = 0; j < toPathPoint.length; j++) {
                if (Util.isNumber(toPathPoint[j]) && fromPathPoint) {
                  interf = interpolate(fromPathPoint[j], toPathPoint[j]);
                  cPathPoint.push(interf(ratio));
                } else {
                  cPathPoint.push(toPathPoint[j]);
                }
              }
              cProps[k].push(cPathPoint);
            }
          } else {
            interf = interpolate(fromAttrs[k], toAttrs[k]);
            cProps[k] = interf(ratio);
          }
        }
      }
      if (toM) {
        const mf = interpolateArray(fromM, toM);
        const cM = mf(ratio);
        self.setMatrix(cM);
      }
      self.attr(cProps);
      canvas.draw();
    }

    function getFormatProps(props) {
      const rst = {
        M: null,
        attrs: {}
      };
      for (const k in props) {
        if (k === 'transform') {
          rst.M = MatrixUtil.transform(self.getMatrix(), props[k]);
        } else if (k === 'matrix') {
          rst.M = props[k];
        } else if (!ReservedProps[k]) {
          rst.attrs[k] = props[k];
        }
      }
      return rst;
    }

    function getfromAttrs(toAttrs) {
      const rst = {};
      for (const k in toAttrs) {
        rst[k] = self.attr(k);
      }
      return rst;
    }
  }
};
