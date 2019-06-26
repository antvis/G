/**
 * @fileoverview 多边形
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';
import path2Absolute from '@antv/path-util/lib/path-2-absolute';

class Path extends ShapeBase {

  initAttrs(attrs) {
    this._setPathArr(attrs.path);
  }

  // 将 path 转换成绝对路径
  _setPathArr(path) {
    this.set('pathArray', path2Absolute(path));
  }
  // 更新属性时，检测是否更改了 path
  setAttr(name: string, value: any) {
    this.attrs[name] = value;
    if (name === 'path') {
      this._setPathArr(value);
    }
  }

  createPath(context) {
    const attrs = this.attr();
    const path = this.get('pathArray');
    for (let i = 0; i < path; i++) {
      const params = path[i];
      const command = params[0];
      // V,H,S,T 都在前面被转换成标准形式
      switch (command) {
        case 'M':
          context.moveTo(params[1], params[2]);
          break;
        case 'L':
          context.lineTo(params[1], params[2]);
          break;
        case 'Q':
          context.quadraticCurveTo(params[1], params[2], params[3], params[4]);
          break;
        case 'C':
          context.bezierCurveTo(params[1], params[2], params[3], params[4], params[5], params[6]);
          break;
        case 'A': {
          const p = params;
          const cx = p[1];
          const cy = p[2];
          const rx = p[3];
          const ry = p[4];
          const theta = p[5];
          const dTheta = p[6];
          const psi = p[7];
          const fs = p[8];

          const r = (rx > ry) ? rx : ry;
          const scaleX = (rx > ry) ? 1 : rx / ry;
          const scaleY = (rx > ry) ? ry / rx : 1;

          context.translate(cx, cy);
          context.rotate(psi);
          context.scale(scaleX, scaleY);
          context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
          context.scale(1 / scaleX, 1 / scaleY);
          context.rotate(-psi);
          context.translate(-cx, -cy);
          break;
        }
        case 'Z':
          context.closePath();
          break;
        default: break;
      }
    }
  }
}

export default Path;
