import { getOrCreateUnitValue } from '../css';
import type { DisplayObjectConfig } from '../dom/interfaces';
import { runtime } from '../global-runtime';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface EllipseStyleProps extends BaseStyleProps {
  cx?: number | string;
  cy?: number | string;
  rx: number | string;
  ry: number | string;
}
export interface ParsedEllipseStyleProps extends ParsedBaseStyleProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}
export class Ellipse extends DisplayObject<
  EllipseStyleProps,
  ParsedEllipseStyleProps
> {
  constructor({ style, ...rest }: DisplayObjectConfig<EllipseStyleProps> = {}) {
    super({
      type: Shape.ELLIPSE,
      style: {
        cx: '',
        cy: '',
        rx: '',
        ry: '',
        ...style,
      },
      initialParsedStyle: {
        anchor: [0.5, 0.5],
        transformOrigin: runtime.enableCSSParsing
          ? null
          : [getOrCreateUnitValue(50, '%'), getOrCreateUnitValue(50, '%')],
      },
      ...rest,
    });
  }
}
