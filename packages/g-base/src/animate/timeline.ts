import { isEqual, isNumber } from '@antv/util';
import * as d3Timer from 'd3-timer';
import * as d3Ease from 'd3-ease';
import { interpolate, interpolateArray } from 'd3-interpolate'; // 目前整体动画只需要数值和数组的差值计算
import * as PathUtil from '../util/path';
import { ICanvas, IElement } from '../interfaces';
import { Animator } from '../types';

/**
 * 使用 ratio 进行插值计算来更新属性
 * @param {IElement} shape    元素
 * @param {Animator} animator 动画
 * @param {Animator} animator 动画执行时间(毫秒)
 * @return {boolean} 动画是否执行完成
 */
function _update(shape: IElement, animator: Animator, ratio: number) {
  const cProps = {}; // 此刻属性
  const toAttrs = animator.toAttrs;
  const fromAttrs = animator.fromAttrs;
  const toMatrix = animator.toMatrix;
  if (shape.destroyed) {
    return;
  }
  let interf; //  差值函数
  for (const k in toAttrs) {
    if (!isEqual(fromAttrs[k], toAttrs[k])) {
      if (k === 'path') {
        let toPath = toAttrs[k];
        let fromPath = fromAttrs[k];
        if (toPath.length > fromPath.length) {
          toPath = PathUtil.parsePathString(toAttrs[k]); // 终点状态
          fromPath = PathUtil.parsePathString(fromAttrs[k]); // 起始状态
          fromPath = PathUtil.fillPathByDiff(fromPath, toPath);
          fromPath = PathUtil.formatPath(fromPath, toPath);
          animator.fromAttrs.path = fromPath;
          animator.toAttrs.path = toPath;
        } else if (!animator.pathFormatted) {
          toPath = PathUtil.parsePathString(toAttrs[k]);
          fromPath = PathUtil.parsePathString(fromAttrs[k]);
          fromPath = PathUtil.formatPath(fromPath, toPath);
          animator.fromAttrs.path = fromPath;
          animator.toAttrs.path = toPath;
          animator.pathFormatted = true;
        }
        cProps[k] = [];
        for (let i = 0; i < toPath.length; i++) {
          const toPathPoint = toPath[i];
          const fromPathPoint = fromPath[i];
          const cPathPoint = [];
          for (let j = 0; j < toPathPoint.length; j++) {
            if (isNumber(toPathPoint[j]) && fromPathPoint && isNumber(fromPathPoint[j])) {
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
    shape.setMatrix(cM);
  }
  shape.attr(cProps);
}

/**
 * 根据自定义帧动画函数 onFrame 来更新属性
 * @param {IElement} shape    元素
 * @param {Animator} animator 动画
 * @param {number}   elapsed  动画执行时间(毫秒)
 * @return {boolean} 动画是否执行完成
 */
function update(shape, animator, elapsed) {
  const startTime = animator.startTime;
  // 如果还没有开始执行或暂停，先不更新
  if (elapsed < startTime + animator.delay || animator.isPaused) {
    return false;
  }
  let ratio;
  const duration = animator.duration;
  const easing = animator.easing;
  // 已执行时间
  elapsed = elapsed - startTime - animator.delay;
  if (animator.repeat) {
    // 如果动画重复执行，则 elapsed > duration，计算 ratio 时需取模
    ratio = (elapsed % duration) / duration;
    ratio = d3Ease[easing](ratio);
  } else {
    ratio = elapsed / duration;
    if (ratio < 1) {
      // 动画未执行完
      ratio = d3Ease[easing](ratio);
    } else {
      // 动画已执行完
      if (animator.onFrame) {
        shape.attr(animator.onFrame(1));
      } else {
        shape.attr(animator.toAttrs);
      }
      if (animator.toMatrix) {
        shape.setMatrix(animator.toMatrix);
      }
      return true;
    }
  }
  if (animator.onFrame) {
    const attrs = animator.onFrame(ratio);
    shape.attr(attrs);
  } else {
    _update(shape, animator, ratio);
  }
  return false;
}

class Timeline {
  /**
   * 画布
   * @type {ICanvas}
   */
  canvas: ICanvas;
  /**
   * 执行动画的元素列表
   * 注意: timeline 中的 animators 表示动画元素队列，而 element 中的 animators 则表示单个元素上的动画队列，两者命名相同，但含义不同
   * @type {IElement[]}
   */
  animators: IElement[] = [];
  /**
   * 当前时间
   * @type {number}
   */
  current: number = 0;
  /**
   * 定时器
   * @type {d3Timer.Timer}
   */
  timer: d3Timer.Timer = null;

  /**
   * 时间轴构造函数，依赖于画布
   * @param {}
   */
  constructor(canvas: ICanvas) {
    this.canvas = canvas;
  }

  /**
   * 初始化定时器
   */
  initTimer() {
    const self = this;
    let isFinished = false;
    let shape: IElement;
    let animators: Animator[];
    let animator: Animator;
    self.timer = d3Timer.timer((elapsed) => {
      self.current = elapsed;
      if (this.animators.length > 0) {
        for (let i = this.animators.length - 1; i >= 0; i--) {
          shape = this.animators[i];
          if (shape.destroyed) {
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
                if (animator.callback) {
                  animator.callback();
                }
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
  }

  /**
   * 增加动画元素
   */
  addAnimator(shape) {
    this.animators.push(shape);
  }

  /**
   * 移除动画元素
   */
  removeAnimator(index) {
    this.animators.splice(index, 1);
  }

  /**
   * 是否有动画在执行
   */
  isAnimating() {
    return !!this.animators.length;
  }

  /**
   * 停止定时器
   */
  stop() {
    if (this.timer) {
      this.timer.stop();
    }
  }

  /**
   * 停止时间轴上所有元素的动画，并置空动画元素列表
   * @param {boolean} toEnd 是否到动画的最终状态，用来透传给动画元素的 stopAnimate 方法
   */
  stopAllAnimations(toEnd = true) {
    this.animators.forEach((animator) => {
      animator.stopAnimate(toEnd);
    });
    this.animators = [];
    this.canvas.draw();
  }

  /**
   * 获取当前时间
   */
  getTime() {
    return this.current;
  }
}

export default Timeline;
