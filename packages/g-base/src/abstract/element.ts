import Base from './base';
import { IElement, IShape, IGroup, ICanvas } from '../interfaces';
import { GroupCfg, ShapeCfg, BBox, ClipCfg, ShapeAttrs } from '../types';
import { removeFromArray, isObject, each, isArray, mix, upperFirst } from '../util/util';
import { multiplyMatrix, multiplyVec2, invert } from '../util/matrix';
const MATRIX = 'matrix';
const ARRAY_ATTRS = {
  matrix: 'matrix',
  path: 'path',
  points: 'points',
  lineDash: 'lineDash',
};

const CLONE_CFGS = ['zIndex', 'capture', 'visible'];

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

abstract class Element extends Base implements IElement {
  /**
   * @protected
   * 图形属性
   * @type {ShapeAttrs}
   */
  attrs: ShapeAttrs = {};

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

  constructor(cfg) {
    super(cfg);
    const attrs = this.getDefaultAttrs();
    mix(attrs, cfg.attrs);
    this.attrs = attrs;
    this.initAttrs(attrs);
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

  animate(toProps, duration?: number, easing?: string, callback?: Function, delay?: number) {}

  stopAnimate() {}

  pauseAnimate() {}

  resumeAnimate() {}

  destroy() {
    const destroyed = this.destroyed;
    if (destroyed) {
      return;
    }
    this.attrs = {};
    super.destroy();
    // this.onCanvasChange('destroy');
  }
}

export default Element;
