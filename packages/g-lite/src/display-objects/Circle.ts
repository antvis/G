import type { DisplayObjectConfig } from '../dom/interfaces';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface CircleStyleProps extends BaseStyleProps {
  /**
   * X coordinate of the center of the circle.
   */
  cx?: number | string | null;
  /**
   * Y coordinate of the center of the circle.
   */
  cy?: number | string | null;
  /**
   * Z coordinate of the center of the circle.
   */
  cz?: number | string | null;
  /**
   * Radius of the circle.
   */
  r: number | string | null;
  /**
   * Whether the circle is billboard.
   */
  isBillboard?: boolean;
  /**
   * Whether the circle is size attenuation.
   */
  isSizeAttenuation?: boolean;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  cx: number;
  cy: number;
  cz?: number;
  r: number;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
}
export class Circle extends DisplayObject<
  CircleStyleProps,
  ParsedCircleStyleProps
> {
  static PARSED_STYLE_LIST: Set<string> = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'cx',
    'cy',
    'cz',
    'r',
    'isBillboard',
    'isSizeAttenuation',
  ]);

  constructor(options: DisplayObjectConfig<CircleStyleProps> = {}) {
    super({
      type: Shape.CIRCLE,
      ...options,
    });
  }
}
