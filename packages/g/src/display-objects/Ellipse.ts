import type { DisplayObjectConfig } from '../dom/interfaces';
import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { CSSUnitValue } from '../css';

export interface EllipseStyleProps extends BaseStyleProps {
  rx: number | string;
  ry: number | string;
}
export interface ParsedEllipseStyleProps extends ParsedBaseStyleProps {
  rx: CSSUnitValue;
  ry: CSSUnitValue;
}
export class Ellipse extends DisplayObject<EllipseStyleProps, ParsedEllipseStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<EllipseStyleProps> = {}) {
    super({
      type: Shape.ELLIPSE,
      style: {
        rx: '',
        ry: '',
        anchor: [0.5, 0.5],
        transformOrigin: 'center',
        lineWidth: '0',
        ...style,
      },
      ...rest,
    });
  }
}
