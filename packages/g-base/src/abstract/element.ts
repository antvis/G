import Base from './base';
import { IElement, IShape, IGroup, ICanvas } from '../interfaces';
import { GroupCfg, ShapeCfg, BBox, ClipCfg } from '../types';
import { isObject, each, isArray, mix, upperFirst } from '@antv/util';
import { removeFromArray } from '../util/util';

const MATRIX = 'matrix';
const ARRAY_ATTRS = {
  matrix: 'matrix',
  path: 'path',
  points: 'points',
  lineDash: 'lineDash',
};

abstract class Element extends Base implements IElement {
  /**
   * @private
   * 图形属性
   * @type {object}
   */
  attrs: object = {};

  // override
  getDefaultCfg() {
    return {
      visible: true,
      capture: true,
    };
  }

  constructor(cfg) {
    super(cfg);
    mix(this.attrs, cfg.attrs);
    if (!this.attrs[MATRIX]) {
      this.attrs[MATRIX] = this.getDefaultMatrix();
    }
  }
  /**
   * @protected
   * 获取默认的矩阵
   * @returns {number[]} 默认的矩阵
   */
  getDefaultMatrix() {
    return [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
  }

  isGroup() {
    return false;
  }

  getParent(): IGroup {
    return this.get('parent');
  }

  getCanvas() : ICanvas {
    return this.get('canvas');
  }

  attr(...args) {
    const [ name, value ] = args;
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
  getBBox(): BBox {
    let bbox = this.get('bbox');
    if (!bbox) {
      bbox = this.calculateBBox();
      this.set('bbox', bbox);
    }
    return bbox;
  }

  abstract calculateBBox() : BBox;

  // 在子类上各自实现
  abstract clone(): IElement;

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
    // 这个地方应该使用 this.set('hasUpdate', true);
    // 但是由于 attr 方法调用的频率过高， set 方法的开销比较大
    this.cfg['hasUpdate'] = true;
    this.clearCacheBBox();
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
    this.attr(MATRIX, [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
  }

  getMatrix(): number[] {
    return this.attr(MATRIX);
  }

  setMatrix(m: number[]) {
    this.attr(MATRIX, m);
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

  /**
   * @protected
   * 清理缓存的 bbox
   */
  clearCacheBBox() {
    this.set('bbox', null);
  }

  animate(toProps, duration?: number, easing?: string, callback?: Function, delay?: number) {

  }

  stopAnimate() {

  }

  pauseAnimate() {

  }

  resumeAnimate() {

  }
}

export default Element;
