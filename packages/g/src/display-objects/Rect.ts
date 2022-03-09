import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { ParsedElement } from '../property-handlers';

export interface RectStyleProps extends BaseStyleProps {
  width: number | string;
  height: number | string;
  radius?: number;
}

export interface ParsedRectStyleProps extends ParsedBaseStyleProps {
  width: ParsedElement;
  height: ParsedElement;
  widthInPixels: number;
  heightInPixels: number;
  radius?: number;
}

export class Rect extends DisplayObject<RectStyleProps, ParsedRectStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<RectStyleProps> = {}) {
    super({
      type: SHAPE.Rect,
      style: {
        width: 'auto',
        height: 'auto',
        ...style,
      },
      ...rest,
    });
  }
}
