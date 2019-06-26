import Base from './base';
import { IElement, IShape, IGroup, ICanvas } from '../interfaces';
import { GroupCfg, ShapeCfg, BBox, ClipCfg, ShapeAttrs } from '../types';
import { isObject, each, isArray, mix, upperFirst } from '@antv/util';
import { removeFromArray } from '../util/util';

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
   * 初始化属性，有些属性需要加工
   * @param {object} attrs 属性值
   */
  initAttrs(attrs: ShapeAttrs) {

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
      this.afterAttrChange();
      return this;
    }
    if (args.length === 2) {
      this.setAttr(name, value);
      this.afterAttrChange();
      return this;
    }
    return this.attrs[name];
  }

  // 在子类上单独实现
<<<<<<< HEAD
  getBBox(): BBox {
    let bbox = this.get('bbox');
    if (!bbox) {
      bbox = this.calculateBBox();
      this.set('bbox', bbox);
    }
    return bbox;
  }

  abstract calculateBBox(): BBox;
=======
  abstract getBBox(): BBox;
>>>>>>> feat(bbox): group not cache box

  // 是否被裁剪，被裁剪则不显示，不参与拾取
  isClipped(refX, refY): boolean {
    const clip = this.getClip();
    return clip && !clip.isHit(refX, refY);
  }

  /**
   * @protected
   * 内部设置属性值的接口
   * @param {string} name 属性名
   * @param {any} value 属性值
   */
  setAttr(name: string, value: any) {
    this.attrs[name] = value;
  }

  /**
   * 属性更改后需要做的事情
   * @protected
   */
  afterAttrChange() {

  }

  show() {
    // 不是高频操作直接使用 set
    this.set('visible', true);
    return this;
  }

  hide() {
    // 不是高频操作直接使用 set
    this.set('visible', false);
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
  }

  remove(destroy = true) {
    const parent = this.getParent();
    if (parent) {
      removeFromArray(parent.getChildren(), this);
    }
    if (destroy) {
      this.destroy();
    }
  }

  destroy() {
    const destroyed = this.destroyed;
    if (destroyed) {
      return;
    }
    this.attrs = {};
    super.destroy();
  }

  resetMatrix() {
    this.attr(MATRIX, this.getDefaultMatrix());
  }

  getMatrix(): number[] {
    return this.attr(MATRIX);
  }

  setMatrix(m: number[]) {
    this.attr(MATRIX, m);
  }

  /**
   * @protected
   * 获取默认的矩阵
   * @returns {number[]|null} 默认的矩阵
   */
  getDefaultMatrix() {
    return null;
  }

  // 基类什么也不做
  applyToMatrix(v: number[]) {}

  // 基类上什么也不做
  invertFromMatrix(v: number[]) {}

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
}

export default Element;
