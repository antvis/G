const Util = require('../../util/index');
const mat3 = require('../../util/matrix').mat3;
const vec3 = require('../../util/matrix').vec3;

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
      mat3.multiply(m1, m1, m2);
    }
  }
}

module.exports = {
  initTransform() {
    this.__m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
  },
  translate(tx, ty) {
    mat3.translate(this.__m, this.__m, [ tx, ty ]);
    this.clearTotalMatrix();
    return this;
  },
  rotate(radian) {
    mat3.rotate(this.__m, this.__m, radian);
    this.clearTotalMatrix();
    return this;
  },
  scale(s1, s2) {
    mat3.scale(this.__m, this.__m, [ s1, s2 ]);
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
          self.__m = mat3.multiply([], self.__m, t[1]);
          self.clearTotalMatrix();
          break;
        default:
          break;
      }
    });
    return self;
  },
  setTransform(ts) {
    this.__m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
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
    vec3.transformMat3(v, v, m);
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

    const m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    Util.each(parents, function(child) {
      mat3.multiply(m, child.__m, m);
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
      m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
      const parent = this.__cfg.parent;
      if (parent) {
        const pm = parent.getTotalMatrix();
        multiple(m, pm);
      }

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
      v[0] /= m[0];
      v[1] /= m[4];
    } else {
      const inm = mat3.invert([], m);
      vec3.transformMat3(v, v, inm);
    }
    return this;
  },
  resetTransform(context) {
    const mo = this.__m;
    // 不改变时
    if (!isUnchanged(mo)) {
      context.transform(mo[0], mo[1], mo[3], mo[4], mo[6], mo[7]);
    }
  }
};
