import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { ParsedElement } from '../property-handlers';
import { TextAlign } from '../types';

export interface GroupStyleProps extends BaseStyleProps {
  width?: number | string;
  height?: number | string;
  textAlign?: TextAlign | 'inherit';
  fontSize?: number | string;
  fontFamily?: string;
}

export interface ParsedGroupStyleProps extends ParsedBaseStyleProps {
  width?: ParsedElement;
  height?: ParsedElement;
  widthInPixels?: number;
  heightInPixels?: number;
  textAlign?: TextAlign;
  fontSize?: ParsedElement;
}

export class Group extends DisplayObject {
  constructor({ style, ...rest }: DisplayObjectConfig<GroupStyleProps> = {}) {
    super({
      type: SHAPE.Group,
      style: {
        width: 'auto',
        height: 'auto',
        textAlign: 'inherit',
        ...style,
      },
      ...rest,
    });
  }
}
