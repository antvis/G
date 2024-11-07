import type { DisplayObjectConfig } from '../dom/interfaces';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface EllipseStyleProps extends BaseStyleProps {
  cx?: number | string;
  cy?: number | string;
  cz?: number | string;
  rx: number | string;
  ry: number | string;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
}
export interface ParsedEllipseStyleProps extends ParsedBaseStyleProps {
  cx: number;
  cy: number;
  cz?: number;
  rx: number;
  ry: number;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
}
export class Ellipse extends DisplayObject<
  EllipseStyleProps,
  ParsedEllipseStyleProps
> {
  static PARSED_STYLE_LIST: Set<string> = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'cx',
    'cy',
    'cz',
    'rx',
    'ry',
    'isBillboard',
    'isSizeAttenuation',
  ]);

  constructor(options: DisplayObjectConfig<EllipseStyleProps> = {}) {
    super({
      type: Shape.ELLIPSE,
      ...options,
    });
  }
}
