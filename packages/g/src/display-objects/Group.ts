import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import { DisplayObjectConfig } from '../dom';

export class Group extends DisplayObject {
  constructor(config?: DisplayObjectConfig<BaseStyleProps>) {
    const { style, ...rest } = config || {};
    super({
      type: SHAPE.Group,
      style: {
        ...style,
      },
      ...rest,
    });
  }
}
