import type { DisplayObject, ParsedImageStyleProps } from '@antv/g-lite';
import type { ImagePool } from '@antv/g-plugin-image-loader';
import { isNil, isString } from '@antv/util';
import { setShadowAndFilter } from './Default';
import type { StyleRenderer } from './interfaces';

export class ImageRenderer implements StyleRenderer {
  constructor(private imagePool: ImagePool) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedImageStyleProps,
    object: DisplayObject,
  ) {
    const {
      x = 0,
      y = 0,
      width,
      height,
      src,
      shadowColor,
      shadowBlur,
    } = parsedStyle;

    let image: HTMLImageElement;
    let iw = width;
    let ih = height;

    if (isString(src)) {
      // image has been loaded in `mounted` hook
      image = this.imagePool.getImageSync(src);
    } else {
      iw ||= src.width;
      ih ||= src.height;
      image = src;
    }

    if (image) {
      const hasShadow = !isNil(shadowColor) && shadowBlur > 0;
      setShadowAndFilter(object, context, hasShadow);

      // node-canvas will throw the following err:
      // Error: Image given has not completed loading
      try {
        context.drawImage(image, x, y, iw, ih);
      } catch (e) {}
    }
  }
}
