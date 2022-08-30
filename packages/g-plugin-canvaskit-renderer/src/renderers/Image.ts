import type { DisplayObject, ParsedImageStyleProps } from '@antv/g-lite';
import { ContextService, inject, singleton } from '@antv/g-lite';
import { ImagePool } from '@antv/g-plugin-image-loader';
import { isString } from '@antv/util';
import type {
  CanvasKitContext,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://docs.flutter.dev/development/platform-integration/web-images#flutter-renderers-on-the-web
 * @see https://stackoverflow.com/questions/71418851/load-images-for-canvaskit-wasm-on-node-js-environment
 * @see https://fiddle.skia.org/c/@Canvas_drawImage
 * @see https://github.com/google/skia/blob/4ff73144c35b993907a6e3738a7be81c0681e504/modules/canvaskit/tests/bazel/core_test.js#L104
 */
@singleton()
export class ImageRenderer implements RendererContribution {
  constructor(
    @inject(ContextService)
    private contextService: ContextService<CanvasKitContext>,

    @inject(ImagePool)
    private imagePool: ImagePool,
  ) {}

  render(object: DisplayObject, context: RendererContributionContext) {
    const { surface, CanvasKit } = this.contextService.getContext();
    const { canvas } = context;
    const { width, height, img, fillOpacity, opacity } =
      object.parsedStyle as ParsedImageStyleProps;

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
      const decoded = surface.makeImageFromTextureSource(
        image,
        // {
        //   alphaType: CanvasKit.AlphaType.Unpremul,
        //   colorType: CanvasKit.ColorType.RGBA_8888,
        //   colorSpace: CanvasKit.ColorSpace.SRGB,
        //   width: iw,
        //   height: ih,
        // }
      );

      const srcRect = CanvasKit.XYWHRect(0, 0, image.width, image.height);
      const destRect = CanvasKit.XYWHRect(0, 0, iw, ih);

      const fillPaint = new CanvasKit.Paint();
      fillPaint.setAntiAlias(true);
      fillPaint.setStyle(CanvasKit.PaintStyle.Fill);
      fillPaint.setAlphaf(fillOpacity * opacity);

      // @see https://github.com/google/skia/blob/4ff73144c35b993907a6e3738a7be81c0681e504/modules/canvaskit/tests/core.spec.js#L864
      canvas.drawImageRectOptions(
        decoded,
        srcRect,
        destRect,
        CanvasKit.FilterMode.Linear,
        CanvasKit.MipmapMode.None,
        fillPaint,
      );

      fillPaint.delete();
    }
  }
}
