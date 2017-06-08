const Util = require('../../../util/index');
const Matrix3 = require('@ali/g-matrix').Matrix3;

// 是否未改变
function isUnchanged(m) {
  const elements = m.elements;
  return elements[0] === 1 && elements[1] === 0 && elements[3] === 0 && elements[4] === 1 && elements[6] === 0 && elements[7] === 0;
}

// 是否仅仅是scale
function isScale(m) {
  const elements = m.elements;
  return elements[1] === 0 && elements[3] === 0 && elements[6] === 0 && elements[7] === 0;
}

function multiple(m1, m2) {
  if (!isUnchanged(m2)) {
    if (isScale(m2)) {
      m1.elements[0] *= m2.elements[0];
      m1.elements[4] *= m2.elements[4];
    } else {
      m1.multiply(m2);
    }
  }
}

module.exports = {
  initTransform() {
    this.__m = new Matrix3();
  },
  translate(tx, ty) {
    this.__m.translate(tx, ty);
    this.clearTotalMatrix();
    return this;
  },
  rotate(angle) {
    this.__m.rotate(angle); // 仅支持弧度，不再支持角度
    this.clearTotalMatrix();
    return this;
  },
  scale(s1, s2) {
    this.__m.scale(s1, s2);
    this.clearTotalMatrix();
    return this;
  },
  /**
   * 绕起始点旋转
   * @param  {Number} rotate 0～360
   */
  rotateAtStart(rotate) {
    const x = this.attr('x');
    const y = this.attr('y');
    if (Math.abs(rotate) > Math.PI * 2) {
      rotate = rotate / 180 * Math.PI;
    }
    this.transform([
      [ 't', -x, -y ],
      [ 'r', rotate ],
      [ 't', x, y ]
    ]);
  },
  /**
   * 移动的到位置
   * @param  {Number} x 移动到x
   * @param  {Number} y 移动到y
   */
  move(x, y) {
    const cx = this.get('x') || 0; // 当前的x
    const cy = this.get('y') || 0; // 当前的y
    this.translate(x - cx, y - cy);
    this.set('x', x);
    this.set('y', y);
  },
  transform(ts) {
    const self = this;
    Util.each(ts, function(t) {
      switch (t[0]) {
        case 't':
          self.translate(t[1], t[2]);
          break;
        case 's':
          self.scale(t[1], t[2]);
          break;
        case 'r':
          self.rotate(t[1]);
          break;
        case 'm':
          self.__m = Matrix3.multiply(t[1], self.__m);
          self.clearTotalMatrix();
          break;
        default:
          break;
      }
    });
    return self;
  },
  setTransform(ts) {
    this.__m.identity();
    return this.transform(ts);
  },
  getMatrix() {
    return this.__m;
  },
  setMatrix(m) {
    this.__m = m;
    this.clearTotalMatrix();
    return this;
  },
  apply(v, root) {
    let m;
    if (root) {
      m = this._getMatrixByRoot(root);
    } else {
      m = this.__m;
    }
    v.applyMatrix(m);
    return this;
  },
  // 获取到达指定根节点的矩阵
  _getMatrixByRoot(root) {
    const self = this;
    root = root || self;
    let parent = self;
    const parents = [];

    while (parent !== root) {
      parents.unshift(parent);
      parent = parent.get('parent');
    }
    parents.unshift(parent);

    const m = new Matrix3();
    Util.each(parents, function(child) {
      m.multiply(child.__m);
    });
    return m;
  },
  /**
   * 应用到当前元素上的总的矩阵
   * @return {Matrix} 矩阵
   */
  getTotalMatrix() {
    let m = this.__cfg.totalMatrix;
    if (!m) {
      m = new Matrix3();
      const parent = this.__cfg.parent;
      if (parent) {
        const pm = parent.getTotalMatrix();
        /* if (!isUnchanged(pm)) {
          m.multiply(pm);
        } */
        multiple(m, pm);
      }
      /* if (!isUnchanged(this.__m)) {
        m.multiply(this.__m);
      } */
      multiple(m, this.__m);
      this.__cfg.totalMatrix = m;
    }
    return m;
  },
  // 清除当前的矩阵
  clearTotalMatrix() {
    // this.__cfg.totalMatrix = null;
  },
  invert(v) {
    const m = this.getTotalMatrix();
    // 单精屏幕下大多数矩阵没变化
    if (isScale(m)) {
      v.x /= m.elements[0];
      v.y /= m.elements[4];
    } else {
      const inm = m.getInverse();
      v.applyMatrix(inm);
    }
    return this;
  },
  resetTransform(context) {
    const mo = this.__m.to2DObject();
    // 不改变时
    if (!isUnchanged(this.__m)) {
      context.transform(mo.a, mo.b, mo.c, mo.d, mo.e, mo.f);
    }
  }
};
