import type { DisplayObjectConfig } from '../dom/interfaces';
import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';

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
        anchor: [0.5, 0.5],
        ...style,
      },
      ...rest,
    });
  }
}
