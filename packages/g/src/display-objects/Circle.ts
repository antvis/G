import type { DisplayObjectConfig } from '../dom/interfaces';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface CircleStyleProps extends BaseStyleProps {
  cx?: number | string | null;
  cy?: number | string | null;
  r: number | string | null;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  cx: number;
  cy: number;
  r: number;
}
export class Circle extends DisplayObject<CircleStyleProps, ParsedCircleStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps> = {}) {
    super({
      type: Shape.CIRCLE,
      style: {
        cx: '',
        cy: '',
        r: '',
        ...style,
      },
      ...rest,
    });
  }
}
