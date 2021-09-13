import { injectable } from 'inversify';
import { isString } from '@antv/util';
import type { GeometryAABBUpdater } from './interfaces';
import type { ParsedImageStyleProps } from '../../display-objects/Image';

@injectable()
export class RectUpdater implements GeometryAABBUpdater<ParsedImageStyleProps> {
  update(attributes: ParsedImageStyleProps) {
    const { img, x = 0, y = 0, width = 0, height = 0 } = attributes;

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
