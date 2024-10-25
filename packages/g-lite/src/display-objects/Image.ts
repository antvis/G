import type { DisplayObjectConfig } from '../dom';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface ImageStyleProps extends BaseStyleProps {
  x?: number;
  y?: number;
  z?: number;
  src?: string | HTMLImageElement;
  width?: number;
  height?: number;
  /**
   * Whether the circle is billboard.
   */
  isBillboard?: boolean;
  /**
   * When isBillboard enabled, whether the circle is size attenuation.
   */
  isSizeAttenuation?: boolean;
  /**
   * When isBillboard enabled, the rotation.
   */
  billboardRotation?: number;
  /**
   * Whether to keep the aspect ratio of the image, under such circumstances, either the width or height can be omitted.
   */
  keepAspectRatio?: boolean;
}
export interface ParsedImageStyleProps extends ParsedBaseStyleProps {
  x: number;
  y: number;
  z?: number;
  src?: string | HTMLImageElement;
  width?: number;
  height?: number;
  isBillboard?: boolean;
  billboardRotation?: number;
  isSizeAttenuation?: boolean;
  keepAspectRatio?: boolean;
}
export class Image extends DisplayObject<
  ImageStyleProps,
  ParsedImageStyleProps
> {
  constructor(options: DisplayObjectConfig<ImageStyleProps> = {}) {
    super({
      type: Shape.IMAGE,
      ...options,
    });
  }
}
