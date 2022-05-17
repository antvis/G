import type { ParsedImageStyleProps } from '@antv/g';
import { isString } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { ImagePool } from '../ImagePool';
import type { StyleRenderer } from './interfaces';
import { ImageRendererContribution } from './interfaces';

@singleton({
  token: ImageRendererContribution,
})
export class ImageRenderer implements StyleRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  hash(parsedStyle: ParsedImageStyleProps): string {
    return '';
  }

  render(context: CanvasRenderingContext2D, parsedStyle: ParsedImageStyleProps) {
    const { width, height, img } = parsedStyle;

    let image: HTMLImageElement;
    let iw = width.value;
    let ih = height.value;

    if (isString(img)) {
      // image has been loaded in `mounted` hook
      image = this.imagePool.getImageSync(img);
    } else {
      iw ||= img.width;
      ih ||= img.height;
      image = img;
    }

    if (image) {
      // node-canvas will throw the following err:
      // Error: Image given has not completed loading
      try {
        context.drawImage(image, 0, 0, iw, ih);
      } catch (e) {}
    }
  }
}
