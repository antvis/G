import type { ImageStyleProps } from '@antv/g-lite';
import { Image } from '@antv/g-lite';
import { BaseShape } from './BaseShape';

export class ImageShape extends BaseShape {
  getElementInstance() {
    const shape = new Image({
      style: this.getAttrsData() as ImageStyleProps,
    });
    return shape;
  }
}
