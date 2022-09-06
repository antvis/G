import type { PathStyleProps } from '@antv/g-lite';
import { Path } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class PathShape extends BaseShape {
  getElementInstance() {
    const shape = new Path({
      style: this.getAttrsData() as PathStyleProps,
    });
    return shape;
  }
}
