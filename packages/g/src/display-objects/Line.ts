import { Line as LineUtil } from '@antv/g-math';
import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import type { DisplayObjectConfig } from '../DisplayObject';
import { Point } from '../shapes';

export interface LineStyleProps extends BaseStyleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface ParsedLineStyleProps extends ParsedBaseStyleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  defX: number;
  defY: number;
}
export class Line extends DisplayObject<LineStyleProps, ParsedLineStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<LineStyleProps>) {
    super({
      type: SHAPE.Line,
      style: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 1,
        anchor: [0, 0],
        ...style,
      },
      ...rest,
    });
  }

  getPoint(ratio: number): Point {
    const { x1, y1, x2, y2 } = this.parsedStyle;
    const point = LineUtil.pointAt(x1, y1, x2, y2, ratio);
    return new Point(point.x, point.y);
  }

  getTotalLength() {
    const { x1, y1, x2, y2 } = this.parsedStyle;
    return LineUtil.length(x1, y1, x2, y2);
  }
}
