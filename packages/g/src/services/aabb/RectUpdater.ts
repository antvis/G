import { singleton } from 'mana-syringe';
import { isString } from '@antv/util';
import { GeometryAABBUpdater } from './interfaces';
import type { Image, Rect, Group, ParsedImageStyleProps } from '../../display-objects';
import { Shape } from '../../types';
import { CSSUnitValue, UnitType } from '../../css';

@singleton({
  token: [
    { token: GeometryAABBUpdater, named: Shape.RECT },
    { token: GeometryAABBUpdater, named: Shape.IMAGE },
    { token: GeometryAABBUpdater, named: Shape.GROUP },
  ],
})
export class RectUpdater implements GeometryAABBUpdater<ParsedImageStyleProps> {
  update(parsedStyle: ParsedImageStyleProps, object: Image | Rect | Group) {
    const { img, x, y, width, height } = parsedStyle;

    let contentWidth = 0;
    let contentHeight = 0;
    if (width instanceof CSSUnitValue) {
      if (width.unit === UnitType.kPixels) {
        contentWidth = width.value;
      }
    }
    if (height instanceof CSSUnitValue) {
      if (height.unit === UnitType.kPixels) {
        contentHeight = height.value;
      }
    }

    // resize with HTMLImageElement's size
    if (img && !isString(img)) {
      if (!contentWidth) {
        contentWidth = img.width;
      }
      if (!contentHeight) {
        contentHeight = img.height;
      }
    }

    if (width instanceof CSSUnitValue) {
      width.value = contentWidth;
    }
    if (height instanceof CSSUnitValue) {
      height.value = contentHeight;
    }

    return {
      width: contentWidth,
      height: contentHeight,
      x: x.value || 0,
      y: y.value || 0,
    };
  }
}
