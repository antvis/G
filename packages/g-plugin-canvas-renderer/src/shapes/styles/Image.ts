import type { DisplayObject, ParsedImageStyleProps } from '@antv/g';
import { inject, isNil, isString, singleton } from '@antv/g';
import { ImagePool } from '@antv/g-plugin-image-loader';
import { setShadowAndFilter } from './Default';
import type { StyleRenderer } from './interfaces';
import { ImageRendererContribution } from './interfaces';

@singleton({
  token: ImageRendererContribution,
})
export class ImageRenderer implements StyleRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedImageStyleProps,
    object: DisplayObject,
  ) {
    const { width, height, img, shadowColor, shadowBlur } = parsedStyle;

    let image: HTMLImageElement;
    let iw = width;
    let ih = height;

    if (isString(img)) {
      // image has been loaded in `mounted` hook
      image = this.imagePool.getImageSync(img);
    } else {
      iw ||= img.width;
      ih ||= img.height;
      image = img;
    }

    if (image) {
      const hasShadow = !isNil(shadowColor) && shadowBlur > 0;
      setShadowAndFilter(object, context, hasShadow);

      // node-canvas will throw the following err:
      // Error: Image given has not completed loading
      try {
        context.drawImage(image, 0, 0, iw, ih);
      } catch (e) {}
    }
  }
}
