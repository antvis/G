import { singleton } from 'mana-syringe';
import { isString } from '@antv/util';
import { GeometryAABBUpdater } from './interfaces';
import type { Image, ParsedImageStyleProps } from '../../display-objects/Image';
import { SHAPE } from '../../types';

@singleton({
  token: [
    { token: GeometryAABBUpdater, named: SHAPE.Rect },
    { token: GeometryAABBUpdater, named: SHAPE.Image },
    { token: GeometryAABBUpdater, named: SHAPE.Group },
  ],
})
export class RectUpdater implements GeometryAABBUpdater<ParsedImageStyleProps> {
  update(attributes: ParsedImageStyleProps, object: Image) {
    const { img, x = 0, y = 0, width, height } = attributes;

    let contentWidth = 0;
    let contentHeight = 0;
    // resize with HTMLImageElement's size
    if (img && !isString(img)) {
      if (!attributes.width) {
        contentWidth = img.width;
      }
      if (!attributes.height) {
        contentHeight = img.height;
      }
    }

    const { unit: widthUnit, value: widthValue } = width;
    const { unit: heightUnit, value: heightValue } = height;
    if (widthUnit === '' || widthUnit === 'px') {
      contentWidth = widthValue;
    }
    if (heightUnit === '' || heightUnit === 'px') {
      contentHeight = heightValue;
    }

    object.parsedStyle.widthInPixels = contentWidth;
    object.parsedStyle.heightInPixels = contentHeight;

    return {
      width: contentWidth,
      height: contentHeight,
      x,
      y,
    };
  }
}
