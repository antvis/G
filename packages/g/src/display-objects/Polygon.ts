import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';
import type { ParsedPolylineStyleProps } from './Polyline';

export interface PolygonStyleProps extends BaseStyleProps {
  points: [number, number][];
}

export class Polygon extends DisplayObject<
  PolygonStyleProps,
  {
    points: ParsedPolylineStyleProps;
  }
> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolygonStyleProps>) {
    super({
      type: SHAPE.Polygon,
      style: {
        points: [],
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
