import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';

export type PolygonStyleProps = BaseStyleProps;
export class Polygon extends DisplayObject<PolygonStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolygonStyleProps>) {
    super({
      type: SHAPE.Polygon,
      style: {
        opacity: 1,
        strokeOpacity: 1,
        ...style,
      },
      ...rest,
    });
  }
}