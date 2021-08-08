import { SHAPE } from '../types';
import type { BaseStyleProps, PathCommand } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';
import { Point } from '../shapes';
import { Cubic as CubicUtil } from '@antv/g-math';
import { pathToCurve } from '../utils/path';
import { isNil } from '@antv/util';

export interface PathStyleProps extends BaseStyleProps {
  path: string | PathCommand[];
}
export class Path extends DisplayObject<PathStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PathStyleProps>) {
    super({
      type: SHAPE.Path,
      style: {
        path: '',
        opacity: 1,
        strokeOpacity: 1,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 1,
        ...style,
      },
      ...rest,
    });
  }

  private totalLength: number;
  private cache: number[][] = [];
  private curve: number[][];

  getTotalLength() {
    if (!this.totalLength) {
      this.totalLength = 0;
      this.curve = pathToCurve(this.attributes.path);
      this.createCache();
    }
    return this.totalLength;
  }

  /**
   * Get point according to ratio
   * @param {number} ratio
   * @return {Point} point
   */
  getPoint(ratio: number): Point | null {
    if (!this.cache.length) {
      this.curve = pathToCurve(this.attributes.path);
      this.createCache();
    }

    let subt = 0;
    let index = 0;

    const curve = this.curve;
    if (!this.cache.length) {
      if (curve) {
        return new Point(curve[0][1], curve[0][2]);
      }
      return null;
    }
    this.cache.forEach((v, i) => {
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
    const { x, y } = CubicUtil.pointAt(
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
    return new Point(x, y);
  }

  private createCache() {
    let totalLength = 0;
    let tempLength = 0;
    // 每段 curve 对应起止点的长度比例列表，形如: [[0, 0.25], [0.25, 0.6]. [0.6, 0.9], [0.9, 1]]
    this.cache = [];
    let segmentT;
    let segmentL;
    let segmentN;
    let l;
    const curve = this.curve;

    if (!curve) {
      return;
    }

    curve.forEach((segment, i) => {
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
    this.totalLength = totalLength;

    if (totalLength === 0) {
      this.cache = [];
      return;
    }

    curve.forEach((segment, i) => {
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
        this.cache.push(segmentT);
      }
    });
  }
}
