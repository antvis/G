import { Line as LineUtil } from '@antv/g-math';
import type { CSSUnitValue } from '../css';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

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
  x1: CSSUnitValue;
  y1: CSSUnitValue;
  x2: CSSUnitValue;
  y2: CSSUnitValue;
  z1?: CSSUnitValue;
  z2?: CSSUnitValue;
  defX: number;
  defY: number;
  isBillboard?: boolean;
}
export class Line extends DisplayObject<LineStyleProps, ParsedLineStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<LineStyleProps> = {}) {
    super({
      type: Shape.LINE,
      style: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        z1: 0,
        z2: 0,
        isBillboard: false,
        ...style,
      },
      ...rest,
    });
  }

  getPoint(ratio: number): Point {
    // TODO: account for z1/z2 in 3D line
    const { x1, y1, x2, y2 } = this.parsedStyle;
    const point = LineUtil.pointAt(x1.value, y1.value, x2.value, y2.value, ratio);
    return new Point(point.x, point.y);
  }

  getTotalLength() {
    // TODO: account for z1/z2 in 3D line
    const { x1, y1, x2, y2 } = this.parsedStyle;
    return LineUtil.length(x1.value, y1.value, x2.value, y2.value);
  }
}
