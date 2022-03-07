import type { DisplayObjectConfig } from '../dom/interfaces';
import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { ParsedElement } from '../property-handlers';

export interface EllipseStyleProps extends BaseStyleProps {
  rx: number;
  ry: number;
}
export interface ParsedEllipseStyleProps extends ParsedBaseStyleProps {
  rx: ParsedElement;
  ry: ParsedElement;
  rxInPixels: number;
  ryInPixels: number;
}
export class Ellipse extends DisplayObject<EllipseStyleProps, ParsedEllipseStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<EllipseStyleProps>) {
    super({
      type: SHAPE.Ellipse,
      style: {
        rx: 0,
        ry: 0,
        anchor: [0.5, 0.5],
        ...style,
      },
      ...rest,
    });
  }
}
