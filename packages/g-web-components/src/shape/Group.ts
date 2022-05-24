import type { GroupStyleProps } from '@antv/g';
import { Group } from '@antv/g';
import { BaseShape } from './BaseShape';

export class GroupShape extends BaseShape {
  getElementInstance() {
    const shape = new Group({
      style: this.getAttrsData() as GroupStyleProps,
    });
    return shape;
  }
}
