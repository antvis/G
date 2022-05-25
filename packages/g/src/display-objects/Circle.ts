import type { CSSUnitValue } from '../css';
import type { DisplayObjectConfig } from '../dom/interfaces';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

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
        ...style,
      },
      ...rest,
    });
  }
}
