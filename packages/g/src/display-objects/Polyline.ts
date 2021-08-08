import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';
import { Line as LineUtil, Polyline as PolylineUtil } from '@antv/g-math';
import { Point } from '../shapes';

export interface PolylineStyleProps extends BaseStyleProps {
  points: [number, number][];
}
export class Polyline extends DisplayObject<PolylineStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolylineStyleProps>) {
    super({
      type: SHAPE.Polyline,
      style: {
        points: [],
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
  private cache: [number, number][] = [];

  getTotalLength() {
    const { points } = this.attributes;
    if (!this.totalLength) {
      this.totalLength = PolylineUtil.length(points);
    }
    return this.totalLength;
  }

  getPoint(ratio: number): Point {
    const { points } = this.attributes;
    if (!this.cache.length) {
      this.createCache();
    }

    let subt = 0;
    let index = 0;
    this.cache.forEach((v, i) => {
      if (ratio >= v[0] && ratio <= v[1]) {
        subt = (ratio - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });

    const { x, y } = LineUtil.pointAt(
      points[index][0],
      points[index][1],
      points[index + 1][0],
      points[index + 1][1],
      subt,
    );
    return new Point(x, y);
  }

  private createCache() {
    const { points } = this.attributes;
    if (!points || points.length === 0) {
      return;
    }

    const totalLength = this.getTotalLength();
    if (totalLength <= 0) {
      return;
    }

    let tempLength = 0;
    let segmentT: [number, number];
    let segmentL;

    (points as [number, number][]).forEach((p, i) => {
      if (points[i + 1]) {
        segmentT = [0, 0];
        segmentT[0] = tempLength / totalLength;
        segmentL = LineUtil.length(p[0], p[1], points[i + 1][0], points[i + 1][1]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        this.cache.push(segmentT);
      }
    });
  }
}