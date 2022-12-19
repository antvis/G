import type { DisplayObjectConfig } from '../dom';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

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
  x?: number;
  y?: number;
  width: number;
  height: number;
  radius?: [number, number, number, number];
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
        ...style,
      },
      ...rest,
    });
  }
}
