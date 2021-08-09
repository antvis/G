import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';

export interface EllipseStyleProps extends BaseStyleProps {
  rx: number;
  ry: number;
}
export class Ellipse extends DisplayObject<EllipseStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<EllipseStyleProps>) {
    super({
      type: SHAPE.Ellipse,
      style: {
        rx: 0,
        ry: 0,
        opacity: 1,
        anchor: [0.5, 0.5],
        ...style,
      },
      ...rest,
    });
  }
}