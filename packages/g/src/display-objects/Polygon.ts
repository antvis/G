import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';

export interface PolygonStyleProps extends BaseStyleProps {
  points: [number, number][];
}

export class Polygon extends DisplayObject<PolygonStyleProps, ParsedBaseStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolygonStyleProps> = {}) {
    super({
      type: SHAPE.Polygon,
      style: {
        points: [],
        miterLimit: 4,
        ...style,
      },
      ...rest,
    });
  }
}
