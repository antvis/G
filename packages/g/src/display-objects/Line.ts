import { Line as LineUtil } from '@antv/g-math';
import { SHAPE, LINE_CAP, LINE_JOIN } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';

export interface LineStyleProps extends BaseStyleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z1?: number;
  z2?: number;
  isBillboard?: boolean;
}
export interface ParsedLineStyleProps extends ParsedBaseStyleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z1?: number;
  z2?: number;
  defX: number;
  defY: number;
  isBillboard?: boolean;
}
export class Line extends DisplayObject<LineStyleProps, ParsedLineStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<LineStyleProps> = {}) {
    super({
      type: SHAPE.Line,
      style: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        z1: 0,
        z2: 0,
        lineJoin: LINE_JOIN.Miter,
        lineCap: LINE_CAP.Butt,
        lineWidth: 1,
        isBillboard: false,
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
