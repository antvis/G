import type { CSSUnitValue } from '../css';
import type { DisplayObjectConfig } from '../dom';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface GroupStyleProps extends BaseStyleProps {
  width?: number | string;
  height?: number | string;
}

export interface ParsedGroupStyleProps extends ParsedBaseStyleProps {
  width?: CSSUnitValue;
  height?: CSSUnitValue;
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
  constructor(options: DisplayObjectConfig<GroupStyleProps> = {}) {
    super({
      type: Shape.GROUP,
      ...options,
    });
  }

  // constructor({ style, ...rest }: DisplayObjectConfig<GroupStyleProps> = {}) {
  //   super({
  //     type: Shape.GROUP,
  //     style: runtime.enableCSSParsing
  //       ? {
  //           width: '',
  //           height: '',
  //           ...style,
  //         }
  //       : {
  //           ...style,
  //         },
  //     ...rest,
  //   });
  // }
}
