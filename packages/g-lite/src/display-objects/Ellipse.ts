import { PECENTAGE_50 } from '../css';
import type { DisplayObjectConfig } from '../dom/interfaces';
import { runtime } from '../global-runtime';
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
}
export interface ParsedEllipseStyleProps extends ParsedBaseStyleProps {
  cx: number;
  cy: number;
  cz?: number;
  rx: number;
  ry: number;
  isBillboard?: boolean;
}
export class Ellipse extends DisplayObject<
  EllipseStyleProps,
  ParsedEllipseStyleProps
> {
  constructor({ style, ...rest }: DisplayObjectConfig<EllipseStyleProps> = {}) {
    super({
      type: Shape.ELLIPSE,
      style: runtime.enableCSSParsing
        ? {
            cx: '',
            cy: '',
            rx: '',
            ry: '',
            ...style,
          }
        : style,
      initialParsedStyle: {
        transformOrigin: runtime.enableCSSParsing
          ? null
          : [PECENTAGE_50, PECENTAGE_50],
      },
      ...rest,
    });
  }
}
