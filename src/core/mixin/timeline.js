const Util = require('../../util/index');
const PathUtil = require('../../util/path');
const d3Timer = require('d3-timer');
const d3Ease = require('d3-ease');
const { interpolate, interpolateArray } = require('d3-interpolate'); // 目前整体动画只需要数值和数组的差值计算

const Timeline = function(canvas) {
  // 待执行动画的队列
  this._animators = [];
  // 当前时间
  this._current = 0;
  // 计时器实例
  this._timer = null;
  // 画布
  this.canvas = canvas;
};

function getSegmentPoints(segment) {
  const points = [];
  switch (segment[0]) {
    case 'M':
      points.push([ segment[1], segment[2] ]);
      break;
    case 'L':
      points.push([ segment[1], segment[2] ]);
      break;
    case 'A':
      points.push([ segment[6], segment[7] ]);
      break;
    case 'Q':
      points.push([ segment[3], segment[4] ]);
      points.push([ segment[1], segment[2] ]);
      break;
    case 'T':
      points.push([ segment[1], segment[2] ]);
      break;
    case 'C':
      points.push([ segment[5], segment[6] ]);
      points.push([ segment[1], segment[2] ]);
      points.push([ segment[3], segment[4] ]);
      break;
    case 'S':
      points.push([ segment[3], segment[4] ]);
      points.push([ segment[1], segment[2] ]);
      break;
    default:

  }
  return points;
}

function splitPoints(points, former, count) {
  const result = [].concat(points);
  let index;
  let t = 1 / (count + 1);
  const formerEnd = getSegmentPoints(former)[0];
  for (let i = 1; i <= count; i++) {
    t *= i;
    index = Math.floor(points.length * t);
    if (index === 0) {
      result.unshift([ formerEnd[0] * t + points[index][0] * (1 - t), formerEnd[1] * t + points[index][1] * (1 - t) ]);
    } else {
      result.splice(index, 0, [ formerEnd[0] * t + points[index][0] * (1 - t), formerEnd[1] * t + points[index][1] * (1 - t) ]);
    }
  }
  return result;
}

function _formatPath(fromPath, toPath) {
  if (fromPath.length <= 1) {
    return fromPath;
  }
  let points;
  for (let i = 0; i < toPath.length; i++) {
    if (fromPath[i][0] !== toPath[i][0]) {
      points = getSegmentPoints(fromPath[i]);
      switch (toPath[i][0]) {
        case 'M':
          fromPath[i] = [ 'M' ].concat(points[0]);
          break;
        case 'L':
          fromPath[i] = [ 'L' ].concat(points[0]);
          break;
        case 'A':
          fromPath[i] = [].concat(toPath[i]);
          fromPath[i][6] = points[0][0];
          fromPath[i][7] = points[0][1];
          break;
        case 'Q':
          if (points.length < 2) {
            if (i > 0) {
              points = splitPoints(points, fromPath[i - 1], 1);
            } else {
              fromPath[i] = toPath[i];
              break;
            }
          }
          fromPath[i] = [ 'Q' ].concat(points.reduce((arr, i) => { return arr.concat(i); }, []));
          break;
        case 'T':
          fromPath[i] = [ 'T' ].concat(points[0]);
          break;
        case 'C':
          if (points.length < 3) {
            if (i > 0) {
              points = splitPoints(points, fromPath[i - 1], 2);
            } else {
              fromPath[i] = toPath[i];
              break;
            }
          }
          fromPath[i] = [ 'C' ].concat(points.reduce((arr, i) => { return arr.concat(i); }, []));
          break;
        case 'S':
          if (points.length < 2) {
            if (i > 0) {
              points = splitPoints(points, fromPath[i - 1], 1);
            } else {
              fromPath[i] = toPath[i];
              break;
            }
          }
          fromPath[i] = [ 'S' ].concat(points.reduce((arr, i) => { return arr.concat(i); }, []));
          break;
        default:
          fromPath[i] = toPath[i];
      }
    }
  }
  return fromPath;
}

function _update(self, animator, ratio) {
  const cProps = {}; // 此刻属性
  const toAttrs = animator.toAttrs;
  const fromAttrs = animator.fromAttrs;
  const toMatrix = animator.toMatrix;
  if (self.get('destroyed')) {
    return;
  }
  let interf; //  差值函数
  for (const k in toAttrs) {
    if (!Util.isEqual(fromAttrs[k], toAttrs[k])) {
      if (k === 'path') {
        let toPath = toAttrs[k];
        let fromPath = fromAttrs[k];
        if (toPath.length !== fromPath.length) {
          toPath = PathUtil.parsePathString(toAttrs[k]); // 终点状态
          fromPath = PathUtil.parsePathString(fromAttrs[k]); // 起始状态
          if (toPath.length > fromPath.length) {
            // TODO 为了保证动画完成时路径与用户指定路径一致，暂时只考虑from比to点少的情况
            fromPath = PathUtil.fillPath(fromPath, toPath);
          }
          fromPath = _formatPath(fromPath, toPath);
          animator.fromAttrs.path = fromPath;
          animator.toAttrs.path = toPath;
        }
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
  if (toMatrix) {
    const mf = interpolateArray(animator.fromMatrix, toMatrix);
    const cM = mf(ratio);
    self.setMatrix(cM);
  }
  self.attr(cProps);
}

function update(shape, animator, elapsed) {
  const startTime = animator.startTime;
  // 如果还没有开始执行或暂停，先不更新
  if (elapsed < (startTime + animator.delay) || animator.isPaused) {
    return false;
  }
  let ratio;
  let isFinished = false;
  const duration = animator.duration;
  const easing = animator.easing;
  // 已执行时间
  elapsed = elapsed - startTime - animator.delay;
  if (animator.toAttrs.repeat) {
    ratio = (elapsed % duration) / duration;
    ratio = d3Ease[easing](ratio);
  } else {
    ratio = elapsed / duration;
    if (ratio < 1) {
      ratio = d3Ease[easing](ratio);
    } else {
      ratio = 1;
      if (animator.callback) {
        animator.callback();
      }
      isFinished = true;
    }
  }
  _update(shape, animator, ratio);
  return isFinished;
}

Util.augment(Timeline, {
  initTimer() {
    const self = this;
    let isFinished = false;
    let shape,
      animators,
      animator;
    self._timer = d3Timer.timer(elapsed => {
      self._current = elapsed;
      if (this._animators.length > 0) {
        for (let i = this._animators.length - 1; i >= 0; i--) {
          shape = this._animators[i];
          if (shape.get('destroyed')) {
            // 如果已经被销毁，直接移出队列
            self.removeAnimator(i);
            continue;
          }
          if (!shape.get('pause').isPaused) {
            animators = shape.get('animators');
            for (let j = animators.length - 1; j >= 0; j--) {
              animator = animators[j];
              isFinished = update(shape, animator, elapsed);
              if (isFinished) {
                animators.splice(j, 1);
                isFinished = false;
              }
            }
          }
          if (animators.length === 0) {
            self.removeAnimator(i);
          }
        }
        this.canvas.draw();
      }
    });
  },
  addAnimator(shape) {
    this._animators.push(shape);
  },
  removeAnimator(index) {
    this._animators.splice(index, 1);
  },
  clear() {
    this._animators = [];
  },
  isAnimating() {
    return !!this._animators.length;
  },
  stop() {
    if (this._timer) {
      this._timer.stop();
    }
  },
  getTime() {
    return this._current;
  }
});

module.exports = Timeline;
