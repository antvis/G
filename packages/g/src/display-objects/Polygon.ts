import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';

export interface PolygonStyleProps extends BaseStyleProps {
  points: [number, number][];
}
export interface ParsedPolygonStyleProps extends ParsedBaseStyleProps {
  points: {
    points: [number, number][];
    segments: [number, number][];
    totalLength: number;
  };
}

export class Polygon extends DisplayObject<PolygonStyleProps, ParsedPolygonStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolygonStyleProps> = {}) {
    super({
      type: Shape.POLYGON,
      style: {
        points: [],
        miterLimit: 4,
        lineWidth: 1,
        ...style,
      },
      ...rest,
    });
  }
}
