import type { PolygonStyleProps } from '@antv/g-lite';
import { Polygon } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class PoligonShape extends BaseShape {
  getElementInstance() {
    const shape = new Polygon({
      style: this.getAttrsData() as PolygonStyleProps,
    });
    return shape;
  }
}
