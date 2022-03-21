import type { DisplayObjectConfig } from '../dom/interfaces';
import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { ParsedElement } from '../property-handlers';

export interface CircleStyleProps extends BaseStyleProps {
  r: number;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  r: ParsedElement;
  rInPixels: number;
}
export class Circle extends DisplayObject<CircleStyleProps, ParsedCircleStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps> = {}) {
    super({
      type: Shape.CIRCLE,
      style: {
        r: 0,
        anchor: [0.5, 0.5],
        lineWidth: 0,
        ...style,
      },
      ...rest,
    });
  }
}
