/**
 * @fileoverview path
 * @author dxq613@gmail.com
 */
import ShapeBase from './base';
import path2Absolute from '@antv/path-util/lib/path-2-absolute';
import { drawPath } from '../util/draw';
import isPointInPath from '../util/in-path/point-in-path';
import isInPolygon from '../util/in-path/polygon';
import pathUtil from '../util/path';

// 是否在多个多边形内部
function isInPolygons(polygons, x, y) {
  let isHit = false;
  for (let i = 0; i < polygons.length; i++) {
    const points = polygons[i];
    isHit = isInPolygon(points, x, y);
    if (isHit) {
      break;
    }
  }
  return isHit;
}

class Path extends ShapeBase {
  initAttrs(attrs) {
    this._setPathArr(attrs.path);
  }

  // 将 path 转换成绝对路径
  _setPathArr(path) {
    // 转换 path 的格式
    this.attrs.path = path2Absolute(path);
    const hasArc = pathUtil.hasArc(path);
    // 为了加速 path 的绘制、拾取和计算，这个地方可以缓存很多东西
    // 这些缓存都是第一次需要时计算和存储，虽然增加了复杂度，但是频繁调用的方法，性能有很大提升
    this.set('hasArc', hasArc);
    this.set('paramsCache', {}); // 清理缓存
    this.set('segments', null); // 延迟生成 path，在动画场景下可能不会有拾取
  }

  getInnerBox(attrs) {
    const segments = this.getSegments();
    return pathUtil.getPathBox(segments);
  }

  getSegments() {
    let segments = this.get('segements');
    if (!segments) {
      segments = pathUtil.getSegments(this.attr('path'));
      this.set('segments', segments);
    }
    return segments;
  }

  isInStrokeOrPath(x, y, isStroke, isFill, lineWidth) {
    const segments = this.getSegments();
    const hasArc = this.get('hasArc');
    let isHit = false;
    if (isStroke) {
      isHit = pathUtil.isPointInStroke(segments, lineWidth, x, y);
    }
    if (!isHit && isFill) {
      if (hasArc) {
        // 存在曲线时，暂时使用 canvas 的 api 计算，后续可以进行多边形切割
        isHit = isPointInPath(this, x, y);
      } else {
        const path = this.attr('path');
        const extractResutl = pathUtil.extractPolygons(path);
        // 提取出来的多边形包含闭合的和非闭合的，在这里统一按照多边形处理
        isHit = isInPolygons(extractResutl.polygons, x, y) || isInPolygons(extractResutl.polylines, x, y);
      }
    }
    return isHit;
  }

  // 更新属性时，检测是否更改了 path
  setAttr(name: string, value: any) {
    this.attrs[name] = value;
    if (name === 'path') {
      this._setPathArr(value);
    }
  }

  createPath(context) {
    const path = this.attr('path');
    const paramsCache = this.get('paramsCache'); // 由于计算圆弧的参数成本很大，所以要缓存
    drawPath(context, path, paramsCache);
  }
}

export default Path;
