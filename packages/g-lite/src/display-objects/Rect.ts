import type { DisplayObjectConfig } from '../dom';
import { runtime } from '../global-runtime';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface RectStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  z?: number;
  width: number | string;
  height: number | string;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
  /**
   * top-left, top-right, bottom-right, bottom-left
   */
  radius?: number | string | number[];
}

export interface ParsedRectStyleProps extends ParsedBaseStyleProps {
  x?: number;
  y?: number;
  z?: number;
  width: number;
  height: number;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
  radius?: [number, number, number, number];
}

export class Rect extends DisplayObject<RectStyleProps, ParsedRectStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<RectStyleProps> = {}) {
    super({
      type: Shape.RECT,
      style: runtime.enableCSSParsing
        ? {
            x: '',
            y: '',
            width: '',
            height: '',
            radius: '',
            ...style,
          }
        : {
            ...style,
          },
      ...rest,
    });
  }
}
