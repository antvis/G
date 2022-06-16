import { singleton } from 'mana-syringe';
import { CSSUnitValue, UnitType } from '../../css';
import type { Group, Image, ParsedImageStyleProps, Rect } from '../../display-objects';
import { Shape } from '../../types';
import { isString } from '../../utils';
import { GeometryAABBUpdater } from './interfaces';

@singleton({
  token: [
    { token: GeometryAABBUpdater, named: Shape.RECT },
    { token: GeometryAABBUpdater, named: Shape.IMAGE },
    { token: GeometryAABBUpdater, named: Shape.GROUP },
  ],
})
export class RectUpdater implements GeometryAABBUpdater<ParsedImageStyleProps> {
  update(parsedStyle: ParsedImageStyleProps, object: Image | Rect | Group) {
    const { img, width, height } = parsedStyle;

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
    };
  }
}
