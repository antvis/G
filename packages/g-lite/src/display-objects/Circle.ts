import { PECENTAGE_50 } from '../css';
import type { DisplayObjectConfig } from '../dom/interfaces';
import { runtime } from '../global-runtime';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface CircleStyleProps extends BaseStyleProps {
  cx?: number | string | null;
  cy?: number | string | null;
  cz?: number | string | null;
  r: number | string | null;
  isBillboard?: boolean;
}
export interface ParsedCircleStyleProps extends ParsedBaseStyleProps {
  cx: number;
  cy: number;
  cz?: number;
  r: number;
  isBillboard?: boolean;
}
export class Circle extends DisplayObject<
  CircleStyleProps,
  ParsedCircleStyleProps
> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps> = {}) {
    super({
      type: Shape.CIRCLE,
      style: runtime.enableCSSParsing
        ? {
            cx: '',
            cy: '',
            r: '',
            ...style,
          }
        : {
            ...style,
          },
      initialParsedStyle: {
        anchor: [0.5, 0.5],
        transformOrigin: runtime.enableCSSParsing
          ? null
          : [PECENTAGE_50, PECENTAGE_50],
      },
      ...rest,
    });
  }
}
