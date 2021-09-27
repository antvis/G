import { DisplayObjectConfig, BaseStyleProps, ParsedBaseStyleProps } from '..';
import { SHAPE } from '..';
import { DisplayObject } from './DisplayObject';

export interface EllipseStyleProps extends BaseStyleProps {
  rx: number;
  ry: number;
}
export interface ParsedEllipseStyleProps extends ParsedBaseStyleProps {
  rx: number;
  ry: number;
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
