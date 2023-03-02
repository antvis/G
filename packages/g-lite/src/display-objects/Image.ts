import type { DisplayObjectConfig } from '../dom';
import { runtime } from '../global-runtime';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface ImageStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  img?: string | HTMLImageElement;
  src?: string | HTMLImageElement;
  width?: number | string;
  height?: number | string;
}
export interface ParsedImageStyleProps extends ParsedBaseStyleProps {
  x: number;
  y: number;
  img?: string | HTMLImageElement;
  src?: string | HTMLImageElement;
  width?: number;
  height?: number;
}
export class Image extends DisplayObject<
  ImageStyleProps,
  ParsedImageStyleProps
> {
  constructor({ style, ...rest }: DisplayObjectConfig<ImageStyleProps> = {}) {
    super({
      type: Shape.IMAGE,
      style: runtime.enableCSSParsing
        ? {
            x: '',
            y: '',
            img: '',
            width: '',
            height: '',
            ...style,
          }
        : {
            ...style,
          },
      ...rest,
    });
  }
}
