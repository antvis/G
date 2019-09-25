import { clone, each, isFunction, isNumber, isObject, isArray, noop, mix, upperFirst, uniqueId } from '@antv/util';
import { transform } from '@antv/matrix-util';
import Base from './base';
import BBox from '../bbox';
import { IElement, IShape, IGroup, ICanvas } from '../interfaces';
import { ClipCfg, OnFrame, ShapeAttrs, AnimateCfg, Animator } from '../types';
import { removeFromArray } from '../util/util';
import { multiplyMatrix, multiplyVec2, invert } from '../util/matrix';

const MATRIX = 'matrix';
const ARRAY_ATTRS = {
  matrix: 'matrix',
  path: 'path',
  points: 'points',
  lineDash: 'lineDash',
};

const CLONE_CFGS = ['zIndex', 'capture', 'visible'];

const RESERVED_PORPS = ['delay', 'rotate'];

const COLOR_RELATED_PROPS = ['fill', 'fillStyle', 'stroke', 'strokeStyle'];

// 需要考虑数组嵌套数组的场景
// 数组嵌套对象的场景不考虑
function _cloneArrayAttr(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (isArray(arr[i])) {
      result.push([].concat(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

function getFromAttrs(toAttrs, shape) {
  const rst = {};
  const attrs = shape.attrs;
  for (const k in toAttrs.attrs) {
    rst[k] = attrs[k];
  }
  return rst;
}

function getFormatProps(props, shape) {
  const rst = {
    matrix: null,
    attrs: {},
  };
  const attrs = shape.attr();
  each(props, (v, k) => {
    if (k === 'transform') {
      rst.matrix = transform(shape.getMatrix(), v);
    } else if (k === 'rotate') {
      rst.matrix = transform(shape.getMatrix(), [['r', v]]);
    } else if (k === 'matrix') {
      rst.matrix = v;
    } else if (COLOR_RELATED_PROPS.indexOf(k) !== -1 && /^[r,R,L,l]{1}[\s]*\(/.test(v)) {
      // Do nothing, 渐变色不支持动画
    } else if (RESERVED_PORPS.indexOf(k) === -1 && attrs[k] !== v) {
      rst.attrs[k] = v;
    }
  });
  return rst;
}

function checkExistedAttrs(animators: Animator[], animator: Animator) {
  if (animator.onFrame) {
    return animators;
  }
  const delay = animator.delay;
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  each(animator.toAttrs, (v, k) => {
    each(animators, (animator) => {
      if (delay < animator.startTime + animator.duration) {
        if (hasOwnProperty.call(animator.toAttrs, k)) {
          delete animator.toAttrs[k];
          delete animator.fromAttrs[k];
        }
      }
    });
  });
  if (animator.toMatrix) {
    each(animators, (item) => {
      if (delay < item.startTime + item.duration && item.toMatrix) {
        delete item.toMatrix;
      }
    });
  }
  return animators;
}

abstract class Element extends Base implements IElement {
  /**
   * @protected
   * 图形属性
   * @type {ShapeAttrs}
   */
  attrs: ShapeAttrs = {};

  constructor(cfg) {
    super(cfg);
    const attrs = this.getDefaultAttrs();
    mix(attrs, cfg.attrs);
    this.attrs = attrs;
    this.initAttrs(attrs);
    this.initAnimate(); // 初始化动画
  }

  // override
  getDefaultCfg() {
    return {
      visible: true,
      capture: true,
    };
  }

  /**
   * @protected
   * 获取默认的属相
   */
  getDefaultAttrs() {
    return {
      matrix: this.getDefaultMatrix(),
    };
  }

  /**
   * @protected
   * 一些方法调用会引起画布变化
   * @param {string} changeType 改变的类型
   */
  onCanvasChange(changeType: string) {}

  /**
   * @protected
   * 初始化属性，有些属性需要加工
   * @param {object} attrs 属性值
   */
  initAttrs(attrs: ShapeAttrs) {}

  /**
   * @protected
   * 初始化动画
   */
  initAnimate() {
    this.set('animable', true);
    this.set('animating', false);
  }

  isGroup() {
    return false;
  }

  getParent(): IGroup {
    return this.get('parent');
  }

  getCanvas(): ICanvas {
    return this.get('canvas');
  }

  attr(...args) {
    const [name, value] = args;
    if (!name) return this.attrs;
    if (isObject(name)) {
      for (const k in name) {
        this.setAttr(k, name[k]);
      }
      this.afterAttrsChange();
      return this;
    }
    if (args.length === 2) {
      this.setAttr(name, value);
      this.afterAttrsChange();
      return this;
    }
    return this.attrs[name];
  }

  // 在子类上单独实现
  abstract getBBox(): BBox;
  // 子类上单独实现
  abstract getCanvasBBox(): BBox;

  // 是否被裁剪，被裁剪则不显示，不参与拾取
  isClipped(refX, refY): boolean {
    const clip = this.getClip();
    return clip && !clip.isHit(refX, refY);
  }

  /**
   * 内部设置属性值的接口
   * @param {string} name 属性名
   * @param {any} value 属性值
   */
  setAttr(name: string, value: any) {
    const originValue = this.attrs[name];
    if (originValue !== value) {
      this.attrs[name] = value;
      this.onAttrChange(name, value, originValue);
    }
  }

  /**
   * @protected
   * 属性值发生改变
   * @param {string} name 属性名
   * @param {any} value 属性值
   * @param {any} originValue 属性值
   */
  onAttrChange(name: string, value: any, originValue: any) {
    if (name === 'matrix') {
      this.set('totalMatrix', null);
    }
  }

  /**
   * 属性更改后需要做的事情
   * @protected
   */
  afterAttrsChange() {
    this.onCanvasChange('attr');
  }

  show() {
    // 不是高频操作直接使用 set
    this.set('visible', true);
    this.onCanvasChange('show');
    return this;
  }

  hide() {
    // 不是高频操作直接使用 set
    this.set('visible', false);
    this.onCanvasChange('hide');
    return this;
  }

  toFront() {
    const parent = this.getParent();
    if (!parent) {
      return;
    }
    const children = parent.getChildren();
    const el = this.get('el');
    const index = children.indexOf(this);
    children.splice(index, 1);
    children.push(this);
    this.onCanvasChange('zIndex');
  }

  toBack() {
    const parent = this.getParent();
    if (!parent) {
      return;
    }
    const children = parent.getChildren();
    const el = this.get('el');
    const index = children.indexOf(this);
    children.splice(index, 1);
    children.unshift(this);
    this.onCanvasChange('zIndex');
  }

  remove(destroy = true) {
    const parent = this.getParent();
    if (parent) {
      removeFromArray(parent.getChildren(), this);
      if (!parent.get('clearing')) {
        // 如果父元素正在清理，当前元素不触发 remove
        this.onCanvasChange('remove');
      }
    } else {
      this.onCanvasChange('remove');
    }
    if (destroy) {
      this.destroy();
    }
  }

  resetMatrix() {
    this.attr(MATRIX, this.getDefaultMatrix());
    this.onCanvasChange('matrix');
  }

  getMatrix(): number[] {
    return this.attr(MATRIX);
  }

  setMatrix(m: number[]) {
    this.attr(MATRIX, m);
    this.onCanvasChange('matrix');
  }

  // 获取总的 matrix
  getTotalMatrix() {
    let totalMatrix = this.get('totalMatrix');
    if (!totalMatrix) {
      const currentMatrix = this.attr('matrix');
      const parentMatrix = this.get('parentMatrix');
      if (parentMatrix && currentMatrix) {
        totalMatrix = multiplyMatrix(parentMatrix, currentMatrix);
      } else {
        totalMatrix = currentMatrix || parentMatrix;
      }
      this.set('totalMatrix', totalMatrix);
    }
    return totalMatrix;
  }

  // 上层分组设置 matrix
  applyMatrix(matrix: number[]) {
    const currentMatrix = this.attr('matrix');
    let totalMatrix = null;
    if (matrix && currentMatrix) {
      totalMatrix = multiplyMatrix(matrix, currentMatrix);
    } else {
      totalMatrix = currentMatrix || matrix;
    }
    this.set('totalMatrix', totalMatrix);
    this.set('parentMatrix', matrix);
  }

  /**
   * @protected
   * 获取默认的矩阵
   * @returns {number[]|null} 默认的矩阵
   */
  getDefaultMatrix() {
    return null;
  }

  // 将向量应用设置的矩阵
  applyToMatrix(v: number[]): number[] {
    const matrix = this.attr('matrix');
    if (matrix) {
      return multiplyVec2(matrix, v);
    }
    return v;
  }

  // 根据设置的矩阵，将向量转换相对于图形/分组的位置
  invertFromMatrix(v: number[]): number[] {
    const matrix = this.attr('matrix');
    if (matrix) {
      const invertMatrix = invert(matrix);
      return multiplyVec2(invertMatrix, v);
    }
    return v;
  }

  // 设置 clip
  setClip(clipCfg: ClipCfg) {
    const preShape = this.get('clipShape');
    if (preShape) {
      preShape.destroy();
    }
    let clipShape = null;
    // 如果配置项为 null ,则不移除 clipShape
    if (clipCfg) {
      const canvas = this.getCanvas();
      // clip 的类型同当前 Canvas 密切相关
      const ShapeBase = canvas.getShapeBase();
      const shapeType = upperFirst(clipCfg.type);
      const Cons = ShapeBase[shapeType];

      if (Cons) {
        clipShape = new Cons({
          type: clipCfg.type,
          isClipShape: true, // 增加一个标记
          attrs: clipCfg.attrs,
        });
      }
    }
    this.set('clipShape', clipShape);
    this.onCanvasChange('clip');
  }

  getClip(): IShape {
    const clipShape = this.get('clipShape');
    // 未设置时返回 Null，保证一致性
    if (!clipShape) {
      return null;
    }
    return clipShape;
  }

  clone() {
    const originAttrs = this.attrs;
    const attrs = {};
    each(originAttrs, (i, k) => {
      if (isArray(originAttrs[k])) {
        attrs[k] = _cloneArrayAttr(originAttrs[k]);
      } else {
        attrs[k] = originAttrs[k];
      }
    });
    const cons = this.constructor;
    // @ts-ignore
    const clone = new cons({ attrs });
    each(CLONE_CFGS, (cfgName) => {
      clone.set(cfgName, this.get(cfgName));
    });
    return clone;
  }

  destroy() {
    const destroyed = this.destroyed;
    if (destroyed) {
      return;
    }
    this.attrs = {};
    super.destroy();
    // this.onCanvasChange('destroy');
  }

  /**
   * 执行动画，支持多种函数签名
   * 1. animate(toAttrs: ElementAttrs, duration: number, easing?: string, callback?: () => void, delay?: number)
   * 2. animate(onFrame: OnFrame, duration: number, easing?: string, callback?: () => void, delay?: number)
   * 3. animate(toAttrs: ElementAttrs, cfg: AnimateCfg)
   * 4. animate(onFrame: OnFrame, cfg: AnimateCfg)
   * 各个参数的含义为:
   *   toAttrs  动画最终状态
   *   duration 动画执行时间
   *   easing   动画缓动效果
   *   callback 动画执行后的回调
   *   delay    动画延迟时间
   */
  animate(...args) {
    this.set('animating', true);
    let timeline = this.get('timeline');
    if (!timeline) {
      timeline = this.get('canvas').get('timeline');
      this.set('timeline', timeline);
    }
    let animators = this.get('animators') || [];
    // 初始化 tick
    if (!timeline.timer) {
      timeline.initTimer();
    }
    let [toAttrs, duration, easing = 'easeLinear', callback = noop, delay = 0] = args;
    let onFrame: OnFrame;
    let repeat: boolean;
    let pauseCallback;
    let resumeCallback;
    let animateCfg: AnimateCfg;
    // 第二个参数，既可以是动画最终状态 toAttrs，也可以是自定义帧动画函数 onFrame
    if (isFunction(toAttrs)) {
      onFrame = toAttrs as OnFrame;
      toAttrs = {};
    }
    // 第二个参数，既可以是执行时间 duration，也可以是动画参数 animateCfg
    if (isObject(duration)) {
      animateCfg = duration as AnimateCfg;
      duration = animateCfg.duration;
      easing = animateCfg.easing || 'easeLinear';
      delay = animateCfg.delay || 0;
      repeat = animateCfg.repeat || false;
      callback = animateCfg.callback || noop;
      pauseCallback = animateCfg.pauseCallback || noop;
      resumeCallback = animateCfg.resumeCallback || noop;
    } else {
      // 第四个参数，既可以是回调函数 callback，也可以是延迟时间 delay
      if (isNumber(callback)) {
        delay = callback;
        callback = null;
      }
      // 第三个参数，既可以是缓动参数 easing，也可以是回调函数 callback
      if (isFunction(easing)) {
        callback = easing;
        easing = 'easeLinear';
      } else {
        easing = easing || 'easeLinear';
      }
    }
    const formatProps = getFormatProps(toAttrs, this);
    const animator: Animator = {
      fromAttrs: getFromAttrs(formatProps, this),
      toAttrs: formatProps.attrs,
      fromMatrix: clone(this.getMatrix()),
      toMatrix: formatProps.matrix,
      duration,
      easing,
      repeat,
      callback,
      pauseCallback,
      resumeCallback,
      delay,
      startTime: timeline.getTime(),
      id: uniqueId(),
      onFrame,
      pathFormatted: false,
    };
    // 如果动画元素队列中已经有这个图形了
    if (animators.length > 0) {
      // 先检查是否需要合并属性。若有相同的动画，将该属性从前一个动画中删除,直接用后一个动画中
      animators = checkExistedAttrs(animators, animator);
    } else {
      // 否则将图形添加到动画元素队列
      timeline.addAnimator(this);
    }
    animators.push(animator);
    this.set('animators', animators);
    this.set('pause', { isPaused: false });
  }

  /**
   * 停止动画
   * @param {boolean} toEnd 是否到动画的最终状态
   */
  stopAnimate(toEnd = true) {
    const animators = this.get('animators');
    each(animators, (animator: Animator) => {
      if (toEnd) {
        // 将动画执行到最后一帧
        if (animator.onFrame) {
          this.attr(animator.onFrame(1));
        } else {
          this.attr(animator.toAttrs);
        }
        if (animator.toMatrix) {
          this.attr('matrix', animator.toMatrix);
        }
      }
      if (animator.callback) {
        // 动画停止时的回调
        animator.callback();
      }
    });
    this.set('animating', false);
    this.set('animators', []);
  }

  /**
   * 暂停动画
   */
  pauseAnimate() {
    const timeline = this.get('timeline');
    const animators = this.get('animators');
    each(animators, (animator: Animator) => {
      if (animator.pauseCallback) {
        // 动画暂停时的回调
        animator.pauseCallback();
      }
    });
    // 记录下是在什么时候暂停的
    this.set('pause', {
      isPaused: true,
      pauseTime: timeline.getTime(),
    });
    return this;
  }

  /**
   * 恢复动画
   */
  resumeAnimate() {
    const timeline = this.get('timeline');
    const current = timeline.getTime();
    const animators = this.get('animators');
    const pauseTime = this.get('pause').pauseTime;
    // 之后更新属性需要计算动画已经执行的时长，如果暂停了，就把初始时间调后
    each(animators, (animator: Animator) => {
      animator.startTime = animator.startTime + (current - pauseTime);
      animator._paused = false;
      animator._pauseTime = null;
      if (animator.resumeCallback) {
        animator.resumeCallback();
      }
    });
    this.set('pause', {
      isPaused: false,
    });
    this.set('animators', animators);
    return this;
  }
}

export default Element;
