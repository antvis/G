import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';

export class Group extends DisplayObject {
  constructor({ style, ...rest }: DisplayObjectConfig<BaseStyleProps> = {}) {
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
