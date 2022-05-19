import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { CSSUnitValue } from '../css';

export interface RectStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  width: number | string;
  height: number | string;
  /**
   * top-left, top-right, bottom-right, bottom-left
   */
  radius?: number | string | number[];
}

export interface ParsedRectStyleProps extends ParsedBaseStyleProps {
  x: CSSUnitValue;
  y: CSSUnitValue;
  width: CSSUnitValue;
  height: CSSUnitValue;
  radius?: [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue];
}

export class Rect extends DisplayObject<RectStyleProps, ParsedRectStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<RectStyleProps> = {}) {
    super({
      type: Shape.RECT,
      style: {
        x: '',
        y: '',
        width: '',
        height: '',
        radius: '',
        lineWidth: '0',
        ...style,
      },
      ...rest,
    });
  }
}
