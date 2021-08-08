import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject, DisplayObjectConfig } from '../DisplayObject';

export class Group extends DisplayObject {
  constructor(config?: DisplayObjectConfig<BaseStyleProps>) {
    super({
      type: SHAPE.Group,
      ...config,
    });
  }
}