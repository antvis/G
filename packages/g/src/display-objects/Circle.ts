import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';

export interface CircleStyleProps extends BaseStyleProps {
  r: number;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  r: number;
}
export class Circle extends DisplayObject<CircleStyleProps, ParsedCircleStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps>) {
    super({
      type: SHAPE.Circle,
      style: {
        r: 0,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        anchor: [0.5, 0.5],
        ...style,
      },
      ...rest,
    });
  }
}
