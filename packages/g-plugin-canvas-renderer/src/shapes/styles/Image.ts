import type {
  DisplayObject,
  ParsedImageStyleProps,
  GlobalRuntime,
} from '@antv/g-lite';
import { ImagePool, type ImageCache } from '@antv/g-plugin-image-loader';
import { isNil } from '@antv/util';
import { mat4 } from 'gl-matrix';
import { transformRect, calculateOverlapRect } from '../../utils/math';
import { DefaultRenderer, setShadowAndFilter } from './Default';
import {
  CanvasRendererPlugin,
  type RenderState,
} from '../../CanvasRendererPlugin';

export class ImageRenderer extends DefaultRenderer {
  static renderFull(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedImageStyleProps,
    object: DisplayObject,
    data: {
      image: HTMLImageElement;
      drawRect: [number, number, number, number];
    },
  ) {
    context.drawImage(
      data.image,
      Math.floor(data.drawRect[0]),
      Math.floor(data.drawRect[1]),
      Math.ceil(data.drawRect[2]),
      Math.ceil(data.drawRect[3]),
    );
  }

  private renderDownSampled(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedImageStyleProps,
    object: DisplayObject,
    data: {
      src: string | HTMLImageElement;
      imageCache: ImageCache;
      drawRect: [number, number, number, number];
    },
  ) {
    const { src, imageCache } = data;

    if (!imageCache.downSampled) {
      this.imagePool
        .createDownSampledImage(src, object)
        .then((res) => {
          // rerender
          // object.dirty();
          object.renderable.dirty = true;
          object.ownerDocument.defaultView.context.renderingService.dirtify();
        })
        .catch(() => {
          //
        });

      return;
    }

    context.drawImage(
      imageCache.downSampled,
      Math.floor(data.drawRect[0]),
      Math.floor(data.drawRect[1]),
      Math.ceil(data.drawRect[2]),
      Math.ceil(data.drawRect[3]),
    );
  }

  renderTile(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedImageStyleProps,
    object: DisplayObject,
    data: {
      src: string | HTMLImageElement;
      imageCache: ImageCache;
      imageRect: [number, number, number, number];
      drawRect: [number, number, number, number];
    },
  ) {
    const { src, imageCache, imageRect, drawRect } = data;
    const { size: originalSize } = imageCache;
    const { a, b, c, d, e, f } = context.getTransform();

    context.resetTransform();

    if (!imageCache?.gridSize) {
      this.imagePool
        .createImageTiles(
          src,
          [],
          () => {
            // rerender
            // object.dirty();
            object.renderable.dirty = true;
            object.ownerDocument.defaultView.context.renderingService.dirtify();
          },
          object,
        )
        .catch(() => {
          //
        });

      return;
    }

    const scaleToOrigin = [
      originalSize[0] / imageRect[2],
      originalSize[1] / imageRect[3],
    ];
    const scaledTileSize = [
      imageCache.tileSize[0] / scaleToOrigin[0],
      imageCache.tileSize[1] / scaleToOrigin[1],
    ];
    const [startTileX, endTileX] = [
      Math.floor((drawRect[0] - imageRect[0]) / scaledTileSize[0]),
      Math.ceil((drawRect[0] + drawRect[2] - imageRect[0]) / scaledTileSize[0]),
    ];
    const [startTileY, endTileY] = [
      Math.floor((drawRect[1] - imageRect[1]) / scaledTileSize[1]),
      Math.ceil((drawRect[1] + drawRect[3] - imageRect[1]) / scaledTileSize[1]),
    ];

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const item = imageCache.tiles[tileY][tileX];

        if (item) {
          const tileRect = [
            Math.floor(imageRect[0] + item.tileX * scaledTileSize[0]),
            Math.floor(imageRect[1] + item.tileY * scaledTileSize[1]),
            Math.ceil(scaledTileSize[0]),
            Math.ceil(scaledTileSize[1]),
          ];

          context.drawImage(
            item.data,
            tileRect[0],
            tileRect[1],
            tileRect[2],
            tileRect[3],
          );
        }
      }
    }

    context.setTransform(a, b, c, d, e, f);
  }

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

    const imageCache = this.imagePool.getImageSync(src, object);
    const image = imageCache?.img;
    let iw = width;
    let ih = height;

    if (!image) {
      return;
    }

    iw ||= image.width;
    ih ||= image.height;

    const hasShadow = !isNil(shadowColor) && shadowBlur > 0;
    setShadowAndFilter(object, context, hasShadow);

    // node-canvas will throw the following err:
    // Error: Image given has not completed loading
    try {
      const { width: viewWidth, height: viewHeight } =
        object.ownerDocument.defaultView.getContextService().getDomElement();

      const currentTransform = context.getTransform();
      const { a, b, c, d, e, f } = currentTransform;
      // 构建 mat4 矩阵
      // prettier-ignore
      const transformMatrix = mat4.fromValues(
          a, c, 0, 0,
          b, d, 0, 0,
          0, 0, 1, 0,
          e, f, 0, 1,
        );
      const imageRect = transformRect([x, y, iw, ih], transformMatrix);
      const drawRect = calculateOverlapRect(
        [0, 0, viewWidth, viewHeight],
        imageRect,
      );

      if (!drawRect) {
        return;
      }

      if (
        !object.ownerDocument.defaultView.getConfig()
          .enableLargeImageOptimization
      ) {
        ImageRenderer.renderFull(context, parsedStyle, object, {
          image,
          drawRect: [x, y, iw, ih],
        });

        return;
      }

      const sizeOfOrigin = imageRect[2] / imageCache.size[0];

      if (sizeOfOrigin < (imageCache.downSamplingRate || 0.5)) {
        this.renderDownSampled(context, parsedStyle, object, {
          src,
          imageCache,
          drawRect: [x, y, iw, ih],
        });

        return;
      }

      if (!ImagePool.isSupportTile) {
        ImageRenderer.renderFull(context, parsedStyle, object, {
          image,
          drawRect: [x, y, iw, ih],
        });

        return;
      }

      this.renderTile(context, parsedStyle, object, {
        src,
        imageCache,
        imageRect,
        drawRect,
      });
    } catch {}
  }

  // ---

  drawToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    renderState: RenderState,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    this.render(context, object.parsedStyle as ParsedImageStyleProps, object);
  }
}
