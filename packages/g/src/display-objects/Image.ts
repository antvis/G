import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { ParsedElement } from '../property-handlers';

export interface ImageStyleProps extends BaseStyleProps {
  img: string | HTMLImageElement;
  width?: number;
  height?: number;
}
export interface ParsedImageStyleProps extends ParsedBaseStyleProps {
  img: string | HTMLImageElement;
  width?: ParsedElement;
  height?: ParsedElement;
  widthInPixels?: number;
  heightInPixels?: number;
}
export class Image extends DisplayObject<ImageStyleProps, ParsedImageStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<ImageStyleProps>) {
    super({
      type: SHAPE.Image,
      style: {
        img: '',
        ...style,
      },
      ...rest,
    });
  }
}
