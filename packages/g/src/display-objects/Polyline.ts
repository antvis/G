import { Line as LineUtil } from '@antv/g-math';
import { SHAPE, LINE_CAP, LINE_JOIN } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';

export interface PolylineStyleProps extends BaseStyleProps {
  points: [number, number][];
}
export interface ParsedPolylineStyleProps {
  points: [number, number][];
  segments: [number, number][];
  totalLength: number;
}
export class Polyline extends DisplayObject<PolylineStyleProps, ParsedBaseStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolylineStyleProps>) {
    super({
      type: SHAPE.Polyline,
      style: {
        points: [],
        lineJoin: LINE_JOIN.Miter,
        lineCap: LINE_CAP.Butt,
        lineWidth: 1,
        ...style,
      },
      ...rest,
    });
  }

  getTotalLength() {
    return this.parsedStyle.points.totalLength;
  }

  getPoint(ratio: number): Point {
    const { points, segments } = this.parsedStyle.points;

    let subt = 0;
    let index = 0;
    segments.forEach((v, i) => {
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

  getStartTangent(): number[][] {
    const { points } = this.parsedStyle.points;
    const result = [];
    result.push([points[1][0], points[1][1]]);
    result.push([points[0][0], points[0][1]]);
    return result;
  }

  getEndTangent(): number[][] {
    const { points } = this.parsedStyle.points;
    const l = points.length - 1;
    const result = [];
    result.push([points[l - 1][0], points[l - 1][1]]);
    result.push([points[l][0], points[l][1]]);
    return result;
  }
}
