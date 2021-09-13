import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';

export interface ImageStyleProps extends BaseStyleProps {
  img: string | HTMLImageElement;
  width?: number;
  height?: number;
}
export interface ParsedImageStyleProps extends ParsedBaseStyleProps {
  img: string | HTMLImageElement;
  width?: number;
  height?: number;
}
export class Image extends DisplayObject<ImageStyleProps, ParsedImageStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<ImageStyleProps>) {
    super({
      type: SHAPE.Image,
      style: {
        img: '',
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        anchor: [0, 0],
        ...style,
      },
      ...rest,
    });
  }
}
