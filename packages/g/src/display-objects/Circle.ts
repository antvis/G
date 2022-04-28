import type { DisplayObjectConfig } from '../dom/interfaces';
import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { CSSUnitValue } from '../css';

export interface CircleStyleProps extends BaseStyleProps {
  r: number | string;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  r: CSSUnitValue;
}
export class Circle extends DisplayObject<CircleStyleProps, ParsedCircleStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps> = {}) {
    super({
      type: Shape.CIRCLE,
      style: {
        r: '',
        anchor: [0.5, 0.5],
        transformOrigin: 'center',
        lineWidth: '0',
        ...style,
      },
      ...rest,
    });
  }
}
