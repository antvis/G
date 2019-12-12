/**
 * @fileoverview path
 * @author dxq613@gmail.com
 */
import { Point } from '@antv/g-base/lib/types';
import CubicUtil from '@antv/g-math/lib/cubic';
import { each, isNil } from '@antv/util';
import ShapeBase from './base';
import path2Absolute from '@antv/path-util/lib/path-2-absolute';
import { drawPath } from '../util/draw';
import isPointInPath from '../util/in-path/point-in-path';
import isInPolygon from '../util/in-path/polygon';
import PathUtil from '../util/path';

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
    const hasArc = PathUtil.hasArc(path);
    // 为了加速 path 的绘制、拾取和计算，这个地方可以缓存很多东西
    // 这些缓存都是第一次需要时计算和存储，虽然增加了复杂度，但是频繁调用的方法，性能有很大提升
    this.set('hasArc', hasArc);
    this.set('paramsCache', {}); // 清理缓存
    this.set('segments', null); // 延迟生成 path，在动画场景下可能不会有拾取
    this.set('curve', null);
    this.set('tCache', null);
    this.set('totalLength', null);
  }

  getInnerBox(attrs) {
    const segments = this.getSegments();
    const lineWidth = this.getHitLineWidth();
    return PathUtil.getPathBox(segments, lineWidth);
  }

  getSegments() {
    let segments = this.get('segements');
    if (!segments) {
      segments = PathUtil.getSegments(this.attr('path'));
      this.set('segments', segments);
    }
    return segments;
  }

  isInStrokeOrPath(x, y, isStroke, isFill, lineWidth) {
    const segments = this.getSegments();
    const hasArc = this.get('hasArc');
    let isHit = false;
    if (isStroke) {
      isHit = PathUtil.isPointInStroke(segments, lineWidth, x, y);
    }
    if (!isHit && isFill) {
      if (hasArc) {
        // 存在曲线时，暂时使用 canvas 的 api 计算，后续可以进行多边形切割
        isHit = isPointInPath(this, x, y);
      } else {
        const path = this.attr('path');
        const extractResutl = PathUtil.extractPolygons(path);
        // 提取出来的多边形包含闭合的和非闭合的，在这里统一按照多边形处理
        isHit = isInPolygons(extractResutl.polygons, x, y) || isInPolygons(extractResutl.polylines, x, y);
      }
    }
    return isHit;
  }

  // 更新属性时，检测是否更改了 path
  onAttrChange(name: string, value: any, originValue: any) {
    super.onAttrChange(name, value, originValue);
    if (name === 'path') {
      this._setPathArr(value);
    }
  }

  createPath(context) {
    const path = this.attr('path');
    const paramsCache = this.get('paramsCache'); // 由于计算圆弧的参数成本很大，所以要缓存
    drawPath(context, path, paramsCache);
  }

  /**
   * Get total length of path
   * @return {number} length
   */
  getTotalLength() {
    const totalLength = this.get('totalLength');
    if (!isNil(totalLength)) {
      return totalLength;
    }
    this._calculateCurve();
    this._setTcache();
    return this.get('totalLength');
  }

  /**
   * Get point according to ratio
   * @param {number} ratio
   * @return {Point} point
   */
  getPoint(ratio: number): Point {
    let tCache = this.get('tCache');
    if (!tCache) {
      this._calculateCurve();
      this._setTcache();
      tCache = this.get('tCache');
    }

    let subt;
    let index;

    const curve = this.get('curve');
    if (!tCache || tCache.length === 0) {
      if (curve) {
        return {
          x: curve[0][1],
          y: curve[0][2],
        };
      }
      return null;
    }
    each(tCache, (v, i) => {
      if (ratio >= v[0] && ratio <= v[1]) {
        subt = (ratio - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });

    const seg = curve[index];
    if (isNil(seg) || isNil(index)) {
      return null;
    }
    const l = seg.length;
    const nextSeg = curve[index + 1];
    return CubicUtil.pointAt(
      seg[l - 2],
      seg[l - 1],
      nextSeg[1],
      nextSeg[2],
      nextSeg[3],
      nextSeg[4],
      nextSeg[5],
      nextSeg[6],
      subt
    );
  }

  _calculateCurve() {
    const { path } = this.attr();
    this.set('curve', PathUtil.pathToCurve(path));
  }

  _setTcache() {
    let totalLength = 0;
    let tempLength = 0;
    // 每段 curve 对应起止点的长度比例列表，形如: [[0, 0.25], [0.25, 0.6]. [0.6, 0.9], [0.9, 1]]
    const tCache = [];
    let segmentT;
    let segmentL;
    let segmentN;
    let l;
    const curve = this.get('curve');

    if (!curve) {
      return;
    }

    each(curve, (segment, i) => {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        totalLength +=
          CubicUtil.length(
            segment[l - 2],
            segment[l - 1],
            segmentN[1],
            segmentN[2],
            segmentN[3],
            segmentN[4],
            segmentN[5],
            segmentN[6]
          ) || 0;
      }
    });
    this.set('totalLength', totalLength);

    if (totalLength === 0) {
      this.set('tCache', []);
      return;
    }

    each(curve, (segment, i) => {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = CubicUtil.length(
          segment[l - 2],
          segment[l - 1],
          segmentN[1],
          segmentN[2],
          segmentN[3],
          segmentN[4],
          segmentN[5],
          segmentN[6]
        );
        // 当 path 不连续时，segmentL 可能为空，为空时需要作为 0 处理
        tempLength += segmentL || 0;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });
    this.set('tCache', tCache);
  }
}

export default Path;
