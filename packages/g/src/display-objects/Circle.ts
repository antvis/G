import type { DisplayObjectConfig } from '../dom/interfaces';
import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { CSSUnitValue } from '../css';

export interface CircleStyleProps extends BaseStyleProps {
  cx?: number | string;
  cy?: number | string;
  r: number | string;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  cx: CSSUnitValue;
  cy: CSSUnitValue;
  r: CSSUnitValue;
}
export class Circle extends DisplayObject<CircleStyleProps, ParsedCircleStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps> = {}) {
    super({
      type: Shape.CIRCLE,
      style: {
        cx: '',
        cy: '',
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
