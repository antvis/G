import type { EllipseStyleProps } from '@antv/g-lite';
import { Ellipse } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class EllipseShape extends BaseShape {
  getElementInstance() {
    const shape = new Ellipse({
      style: this.getAttrsData() as EllipseStyleProps,
    });
    return shape;
  }
}
