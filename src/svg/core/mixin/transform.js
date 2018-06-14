const Util = require('../../../util/index');
const mat3 = require('../../../util/matrix').mat3;
const vec3 = require('../../../util/matrix').vec3;

// 是否未改变
function isUnchanged(m) {
  return m[0] === 1 && m[1] === 0 && m[3] === 0 && m[4] === 1 && m[6] === 0 && m[7] === 0;
}

// 是否仅仅是scale
function isScale(m) {
  return m[1] === 0 && m[3] === 0 && m[6] === 0 && m[7] === 0;
}

/* function multiple(m1, m2) {
  if (!isUnchanged(m2)) {
    if (isScale(m2)) {
      m1[0] *= m2[0];
      m1[4] *= m2[4];
    } else {
      mat3.multiply(m1, m1, m2);
      mat3.multiply(m1, m1, m2);
    }
  }
}*/

module.exports = {
  initTransform() {
    this.attr('matrix', [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
  },
  translate(tx, ty, perform) {
    const matrix = this.attr('matrix');
    mat3.translate(matrix, matrix, [ tx, ty ]);
    this.attr('matrix', matrix);
    if (arguments.length === 2 || perform) {
      this._performTransform();
    }
    return this;
  },
  rotate(radian, perform) {
    const matrix = this.attr('matrix');
    if (Math.abs(radian) > Math.PI * 2) {
      radian = radian / 180 * Math.PI;
    }
    mat3.rotate(matrix, matrix, radian);
    this.attr('matrix', matrix);
    if (arguments.length === 1 || perform) {
      this._performTransform();
    }
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
  scale(s1, s2, perform) {
    const matrix = this.attr('matrix');
    mat3.scale(matrix, matrix, [ s1, s2 ]);
    this.attr('matrix', matrix);
    if (arguments.length === 2 || perform) {
      this._performTransform();
    }
    return this;
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
  _performTransform() {
    const matrix = this.__attrs.matrix;
    const transform = [];
    for (let i = 0; i < 9; i += 3) {
      transform.push(matrix[i] + ',' + matrix[i + 1]);
    }
    const el = this.get('el');
    if (el) {
      el.setAttribute('transform', `matrix(${transform.join(',')})`);
    }
  },
  transform(ts) {
    const self = this;
    const matrix = self.attr('matrix');
    Util.each(ts, t => {
      switch (t[0]) {
        case 't':
          self.translate(t[1], t[2], false);
          break;
        case 's':
          self.scale(t[1], t[2], false);
          break;
        case 'r':
          self.rotate(t[1], false);
          break;
        case 'm':
          self.attr('matrix', mat3.multiply([], matrix, t[1]));
          break;
        default:
          break;
      }
    });
    this._performTransform();
    return self;
  },
  setTransform(ts) {
    this.attr('matrix', [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
    return this.transform(ts);
  },
  getMatrix() {
    return this.attr('matrix');
  },
  setMatrix(m) {
    this.attr('matrix', m);
    this._performTransform();
    this.clearTotalMatrix();
    return this;
  },
  apply(v, root) {
    let m;
    if (root) {
      m = this._getMatrixByRoot(root);
    } else {
      m = this.attr('matrix');
    }
    vec3.transformMat3(v, v, m);
    return this;
  },
  invert(v) {
    const m = this.attr('matrix');
    // 单精屏幕下大多数矩阵没变化
    if (isScale(m)) {
      v[0] /= m[0];
      v[1] /= m[4];
    } else {
      const inm = mat3.invert([], m);
      if (inm) {
        vec3.transformMat3(v, v, inm);
      }
    }
    return this;
  },
  resetTransform(context) {
    const mo = this.attr('matrix');
    // 不改变时
    if (!isUnchanged(mo)) {
      context.transform(mo[0], mo[1], mo[3], mo[4], mo[6], mo[7]);
    }
  }
};
