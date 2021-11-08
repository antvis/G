import { ParsedImageStyleProps, SHAPE } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { isNil, isString } from '@antv/util';
import { ImagePool } from '../ImagePool';
import { StyleRenderer } from './interfaces';

@singleton({
  token: { token: StyleRenderer, named: SHAPE.Image },
})
export class ImageRenderer implements StyleRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  render(context: CanvasRenderingContext2D, parsedStyle: ParsedImageStyleProps) {
    const { width = 0, height = 0, img } = parsedStyle;

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

    // if (!isNil(sx) && !isNil(sy) && !isNil(swidth) && !isNil(sheight)) {
    //   // context.drawImage(image, sx, sy, swidth, sheight, -anchor[0] * iw, -anchor[1] * ih, iw, ih);
    //   context.drawImage(image, sx, sy, swidth, sheight, 0, 0, iw, ih);
    // } else {
    context.drawImage(image, 0, 0, iw, ih);
    // }
  }
}
