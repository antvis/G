import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';

export interface RectStyleProps extends BaseStyleProps {
  width: number;
  height: number;
  radius?: number;
}
export class Rect extends DisplayObject<RectStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<RectStyleProps>) {
    super({
      type: SHAPE.Rect,
      style: {
        width: 0,
        height: 0,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        anchor: [0, 0],
        ...style,
      },
      ...rest,
    });
  }
}
