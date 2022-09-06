import type { LineStyleProps } from '@antv/g-lite';
import { Line } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class LineShape extends BaseShape {
  getElementInstance() {
    const shape = new Line({
      style: this.getAttrsData() as LineStyleProps,
    });
    return shape;
  }
}
