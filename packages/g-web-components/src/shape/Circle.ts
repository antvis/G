import type { CircleStyleProps } from '@antv/g-lite';
import { Circle } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class CircleShape extends BaseShape {
  getElementInstance() {
    const circle = new Circle({
      style: this.getAttrsData() as CircleStyleProps,
    });
    return circle;
  }
}
