import { injectable } from 'inversify';
import { isString } from '@antv/util';
import type { GeometryAABBUpdater } from '.';
import type { RectStyleProps } from '../../display-objects/Rect';
import type { ImageStyleProps } from '../../display-objects/Image';

@injectable()
export class RectUpdater implements GeometryAABBUpdater<RectStyleProps | ImageStyleProps> {
  update(attributes: RectStyleProps | ImageStyleProps) {
    const { img, x = 0, y = 0, width, height } = attributes;

    let contentWidth;
    let contentHeight;
    // resize with HTMLImageElement's size
    if (img && !isString(img)) {
      if (!attributes.width) {
        contentWidth = img.width;
      }
      if (!attributes.height) {
        contentHeight = img.height;
      }
    }

    return {
      width: contentWidth || width,
      height: contentHeight || height,
      x,
      y,
    };
  }
}
