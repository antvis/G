/**
 * @fileoverview path
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';
import path2Absolute from '@antv/path-util/lib/path-2-absolute';
import { drawPath } from '../util/draw';

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
    const path = this.get('pathArray');
    const paramsCache = this.get('paramsCache'); // 由于计算圆弧的参数成本很大，所以要缓存
    drawPath(context, path, paramsCache);
  }
}

export default Path;
