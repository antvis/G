/**
 * @fileoverview 多边形
 * @author dxq613@gmail.com
 */
import { Point } from '@antv/g-base/lib/types';
import LineUtil from '@antv/g-math/lib/line';
import PolylineUtil from '@antv/g-math/lib/polyline';
import { each, isNil } from '@antv/util';
import ShapeBase from './base';
import inPolyline from '../util/in-stroke/polyline';

class PolyLine extends ShapeBase {
  // 更新属性时，检测是否更改了 points
  onAttrChange(name: string, value: any, originValue: any) {
    super.onAttrChange(name, value, originValue);
    if (['points'].indexOf(name) !== -1) {
      this._resetCache();
    }
  }

  _resetCache() {
    this.set('totalLength', null);
    this.set('tCache', null);
  }

  // 不允许 fill
  isFill() {
    return false;
  }

  getInnerBox(attrs) {
    const { points } = attrs;
    return PolylineUtil.box(points);
  }

  isInStrokeOrPath(x, y, isStroke, isFill, lineWidth) {
    // 没有设置 stroke 不能被拾取, 没有线宽不能被拾取
    if (!isStroke || !lineWidth) {
      return false;
    }
    const { points } = this.attr();
    return inPolyline(points, lineWidth, x, y, false);
  }

  // 始终填充
  isStroke() {
    return true;
  }

  createPath(context) {
    const attrs = this.attr();
    const points = attrs.points;
    if (points.length < 2) {
      return;
    }
    context.beginPath();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    }
  }

  /**
   * Get length of polyline
   * @return {number} length
   */
  getTotalLength() {
    const { points } = this.attr();
    // get totalLength from cache
    const totalLength = this.get('totalLength');
    if (!isNil(totalLength)) {
      return totalLength;
    }
    this.set('totalLength', PolylineUtil.length(points));
    return this.get('totalLength');
  }

  /**
   * Get point according to ratio
   * @param {number} ratio
   * @return {Point} point
   */
  getPoint(ratio: number): Point {
    const { points } = this.attr();
    // get tCache from cache
    let tCache = this.get('tCache');
    if (!tCache) {
      this._setTcache();
      tCache = this.get('tCache');
    }

    let subt;
    let index;
    each(tCache, (v, i) => {
      if (ratio >= v[0] && ratio <= v[1]) {
        subt = (ratio - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });
    return LineUtil.pointAt(points[index][0], points[index][1], points[index + 1][0], points[index + 1][1], subt);
  }

  _setTcache() {
    const { points } = this.attr();
    if (!points || points.length === 0) {
      return;
    }

    const totalLength = this.getTotalLength();
    if (totalLength <= 0) {
      return;
    }

    let tempLength = 0;
    const tCache = [];
    let segmentT;
    let segmentL;

    each(points, (p, i) => {
      if (points[i + 1]) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = LineUtil.length(p[0], p[1], points[i + 1][0], points[i + 1][1]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });
    this.set('tCache', tCache);
  }
}

export default PolyLine;
