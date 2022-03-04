import { singleton } from 'mana-syringe';
import { isString } from '@antv/util';
import { GeometryAABBUpdater } from './interfaces';
import type { ParsedImageStyleProps } from '../../display-objects/Image';
import { SHAPE } from '../../types';

@singleton({
  token: [
    { token: GeometryAABBUpdater, named: SHAPE.Rect },
    { token: GeometryAABBUpdater, named: SHAPE.Image },
    { token: GeometryAABBUpdater, named: SHAPE.Group },
  ],
})
export class RectUpdater implements GeometryAABBUpdater<ParsedImageStyleProps> {
  update(attributes: ParsedImageStyleProps) {
    const { img, x = 0, y = 0, width = 0, height = 0 } = attributes;

    let contentWidth: number;
    let contentHeight: number;
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
