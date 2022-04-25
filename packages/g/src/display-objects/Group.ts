import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps, TextAlign } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import type { CSSUnitValue } from '../css';

export interface GroupStyleProps extends BaseStyleProps {
  width?: number | string;
  height?: number | string;
  textAlign?: TextAlign | 'inherit';
  fontSize?: number | string | 'inherit';
  fontFamily?: string;
}

export interface ParsedGroupStyleProps extends ParsedBaseStyleProps {
  width?: CSSUnitValue;
  height?: CSSUnitValue;
  textAlign?: TextAlign;
  fontSize?: CSSUnitValue;
}

/**
 * its attributes are inherited by its children.
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/g
 * 
 * @example
 * <g fill="white" stroke="green" stroke-width="5">
    <circle cx="40" cy="40" r="25" />
    <circle cx="60" cy="60" r="25" />
  </g>
 */
export class Group extends DisplayObject {
  constructor({ style, ...rest }: DisplayObjectConfig<GroupStyleProps> = {}) {
    super({
      type: Shape.GROUP,
      style: {
        fontSize: '',
        textAlign: '',
        width: '',
        height: '',
        ...style,
      },
      ...rest,
    });
  }
}
