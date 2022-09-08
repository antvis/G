import type { RectStyleProps } from '@antv/g-lite';
import { Rect } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class RectShape extends BaseShape {
  getElementInstance() {
    const rect = new Rect({
      style: this.getAttrsData() as RectStyleProps,
    });
    return rect;
  }
}
