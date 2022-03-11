import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { ParsedElement } from '../property-handlers';

export interface GroupStyleProps extends BaseStyleProps {
  width?: number | string;
  height?: number | string;
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right' | 'inherit';
  fontSize?: number | string;
  fontFamily?: string;
}

export interface ParsedGroupStyleProps extends ParsedBaseStyleProps {
  width?: ParsedElement;
  height?: ParsedElement;
  widthInPixels?: number;
  heightInPixels?: number;
  textAlign?: string;
  fontSize?: ParsedElement;
}

export class Group extends DisplayObject {
  constructor({ style, ...rest }: DisplayObjectConfig<GroupStyleProps> = {}) {
    super({
      type: SHAPE.Group,
      style: {
        width: 'auto',
        height: 'auto',
        ...style,
      },
      ...rest,
    });
  }
}
