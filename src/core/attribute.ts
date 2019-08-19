
import * as Util from '@antv/util';
import Base from './base';
import {
  ElementAttrs,
  ElementCFG
} from '../interface';

// 是否未改变
function isUnchanged(m) {
  return m[0] === 1 && m[1] === 0 && m[3] === 0 && m[4] === 1 && m[6] === 0 && m[7] === 0;
}

// 是否仅仅是scale
function isScale(m) {
  return m[1] === 0 && m[3] === 0 && m[6] === 0 && m[7] === 0;
}

function multiple(m1, m2) {
  if (!isUnchanged(m2)) {
    if (isScale(m2)) {
      m1[0] *= m2[0];
      m1[4] *= m2[4];
    } else {
      Util.mat3.multiply(m1, m1, m2);
    }
  }
}

abstract class Attribute extends Base {
  canFill: boolean = false;
  canStroke: boolean = false;
  attrs: ElementAttrs = {};
  // defaultAttrs: ElementAttrs = {};

  constructor(cfg: ElementCFG = {}) {
    super(cfg);
    this.attrs = {
      opacity: 1,
      fillOpacity: 1,
      strokeOpacity: 1,
      matrix: [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ],
    };
    this.attr({
      ...this.getDefaultAttrs(),
      ...this.cfg.attrs,
    });
    this.cfg.attrs = {};
  }

  getDefaultAttrs() {
    return {};
  }

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
  attr(...args) {
    const [name, value] = args;
    if (!name) return this.attrs;
    if (Util.isObject(name)) {
      for (const k in name) {
        this._setAttr(k, name[k]);
      }
      this.clearBBox();
      this.cfg.hasUpdate = true;
      return this;
    }
    if (args.length === 2) {
      this._setAttr(name, value);
      this.clearBBox();
      this.cfg.hasUpdate = true;
      return this;
    }
    return this.attrs[name];
  }

  _afterSetAttrPath(value: any) {
  }

  _setAttr(name: string, value: any) {
    const attrs = this.attrs;
    attrs[name] = value;
    if (name === 'fill' || name === 'stroke') {
      attrs[name + 'Style'] = value;
      return;
    }
    if (name === 'opacity') {
      attrs.globalAlpha = value;
      return;
    }
    if (name === 'clip' && value) {
      this._setClip(value);
      return;
    }
    if (name === 'path') {
      this._afterSetAttrPath(value);
      return;
    }
    if (name === 'transform') {
      this.transform(value);
      return;
    }
    if (name === 'rotate') {
      this.rotateAtStart(value);
    }
  }

  clearBBox() {
    this.setSilent('box', null);
  }

  hasFill() {
    return this.canFill && this.attrs.fillStyle;
  }

  hasStroke() {
    return this.canStroke && this.attrs.strokeStyle;
  }

  _setClip(item) {
    item.cfg.renderer = this.cfg.renderer;
    item.cfg.canvas = this.cfg.canvas;
    item.cfg.parent = this.cfg.parent;
    item.hasFill = function() { return true; };
  }

  // transform
  initTransform() {}

  resetMatrix() {
    this.attr('matrix', [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
  }

  translate(tx: number, ty: number) {
    const matrix = this.attrs.matrix;
    Util.mat3.translate(matrix, matrix, [ tx, ty ]);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  rotate(radian: number) {
    const matrix = this.attrs.matrix;
    Util.mat3.rotate(matrix, matrix, radian);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  scale(s1: number, s2: number) {
    const matrix = this.attrs.matrix;
    Util.mat3.scale(matrix, matrix, [ s1, s2 ]);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  rotateAtStart(rotate: number) {
    const x = this.attrs.x || 0;
    const y = this.attrs.y || 0;
    if (Math.abs(rotate) > Math.PI * 2) {
      rotate = rotate / 180 * Math.PI;
    }
    return this.transform([
      [ 't', -x, -y ],
      [ 'r', rotate ],
      [ 't', x, y ]
    ]);
  }

  move(x: number, y: number) {
    const cx = this.get('x') || 0; // 当前的x
    const cy = this.get('y') || 0; // 当前的y
    this.translate(x - cx, y - cy);
    this.set('x', x);
    this.set('y', y);
    return this;
  }

  transform(ts) {
    const matrix = this.attrs.matrix;

    Util.each(ts, (t) => {
      switch (t[0]) {
        case 't':
          this.translate(t[1], t[2]);
          break;
        case 's':
          this.scale(t[1], t[2]);
          break;
        case 'r':
          this.rotate(t[1]);
          break;
        case 'm':
          this.attr('matrix', Util.mat3.multiply([], matrix, t[1]));
          this.clearTotalMatrix();
          break;
        default:
          break;
      }
    });
    return this;
  }

  setTransform(ts) {
    this.attr('matrix', [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
    return this.transform(ts);
  }

  getMatrix() {
    return this.attr('matrix');
  }

  setMatrix(m) {
    this.attr('matrix', m);
    this.clearTotalMatrix();
    return this;
  }

  apply(v, root) {
    let m;
    if (root) {
      m = this._getMatrixByRoot(root);
    } else {
      m = this.attr('matrix');
    }
    Util.vec3.transformMat3(v, v, m);
    return this;
  }

  // 获取到达指定根节点的矩阵
  _getMatrixByRoot(root) {
    root = root || this;
    let parent = this;
    const parents = [];

    while (parent !== root) {
      parents.unshift(parent);
      parent = parent.get('parent');
    }
    parents.unshift(parent);

    const m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    Util.each(parents, function(child) {
      Util.mat3.multiply(m, child.attr('matrix'), m);
    });
    return m;
  }

  /**
   * 应用到当前元素上的总的矩阵
   * @return {Matrix} 矩阵
   */
  getTotalMatrix() {
    let m = this.cfg.totalMatrix;
    if (!m) {
      m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
      const parent = this.cfg.parent;
      if (parent) {
        const pm = parent.getTotalMatrix();
        multiple(m, pm);
      }

      multiple(m, this.attr('matrix'));
      this.cfg.totalMatrix = m;
    }
    return m;
  }

  // 清除当前的矩阵
  clearTotalMatrix() {
    // this.cfg.totalMatrix = null;
  }

  invert(v) {
    const m = this.getTotalMatrix();
    // 单精屏幕下大多数矩阵没变化
    if (isScale(m)) {
      v[0] /= m[0];
      v[1] /= m[4];
    } else {
      const inm = Util.mat3.invert([], m);
      if (inm) {
        Util.vec3.transformMat3(v, v, inm);
      }
    }
    return this;
  }

  resetTransform(context) {
    const mo = this.attr('matrix');
    // 不改变时
    if (!isUnchanged(mo)) {
      context.transform(mo[0], mo[1], mo[3], mo[4], mo[6], mo[7]);
    }
  }
}

export default Attribute;
