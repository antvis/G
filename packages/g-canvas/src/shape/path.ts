/**
 * @fileoverview path
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';
import path2Absolute from '@antv/path-util/lib/path-2-absolute';
import EllipseMath from '../util/math/ellipse';

class Path extends ShapeBase {
  initAttrs(attrs) {
    this._setPathArr(attrs.path);
  }

  // 将 path 转换成绝对路径
  _setPathArr(path) {
    this.set('pathArray', path2Absolute(path));
    // 为了加速 path 的绘制、拾取和计算，这个地方可以缓存很多东西
    // 这些缓存都是第一次需要时计算和存储，虽然增加了复杂度，但是频繁调用的方法，性能有很大提升
    this.set('paramsCache', {}); // 清理缓存
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
    let currentPoint = [ 0, 0 ]; // 当前图形
    const paramsCache = this.get('paramsCache'); // 由于计算圆弧的参数成本很大，所以要缓存
    context.beginPath();
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
          let arcParams = paramsCache[i];
          if (!arcParams) {
            arcParams = EllipseMath.getArcParams(currentPoint, params);
            paramsCache[i] = arcParams;
          }
          const {cx, cy, rx, ry, startAngle, endAngle, xRotation, sweepFlag} = arcParams;
          // 直接使用椭圆的 api
          if (context.ellipse) {
            context.ellipse(cx, cy, rx, ry, xRotation, startAngle, endAngle, 1 - sweepFlag);
          } else {
            const r = (rx > ry) ? rx : ry;
            const scaleX = (rx > ry) ? 1 : rx / ry;
            const scaleY = (rx > ry) ? ry / rx : 1;
            context.translate(cx, cy);
            context.rotate(xRotation);
            context.scale(scaleX, scaleY);
            context.arc(0, 0, r, startAngle, endAngle, 1 - sweepFlag);
            context.scale(1 / scaleX, 1 / scaleY);
            context.rotate(-xRotation);
            context.translate(-cx, -cy);
          }
          break;
        }
        case 'Z':
          context.closePath();
          break;
        default:
          break;
      }

      if (command !== 'Z') {
        const len = params.length;
        currentPoint = [ params[len - 2], params[len - 1] ];
      }
      
    }
  }
}

export default Path;
