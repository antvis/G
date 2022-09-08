import type { PolylineStyleProps } from '@antv/g-lite';
import { Polyline } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class PolylineShape extends BaseShape {
  getElementInstance() {
    const shape = new Polyline({
      style: this.getAttrsData() as PolylineStyleProps,
    });
    return shape;
  }
}
