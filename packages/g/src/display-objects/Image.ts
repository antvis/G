import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { CSSUnitValue } from '../css';

export interface ImageStyleProps extends BaseStyleProps {
  img?: string | HTMLImageElement;
  src?: string | HTMLImageElement;
  width?: number | string;
  height?: number | string;
}
export interface ParsedImageStyleProps extends ParsedBaseStyleProps {
  img?: string | HTMLImageElement;
  src?: string | HTMLImageElement;
  width?: CSSUnitValue;
  height?: CSSUnitValue;
}
export class Image extends DisplayObject<ImageStyleProps, ParsedImageStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<ImageStyleProps> = {}) {
    super({
      type: Shape.IMAGE,
      style: {
        img: '',
        width: 'auto',
        height: 'auto',
        lineWidth: 0,
        ...style,
      },
      ...rest,
    });
  }
}
