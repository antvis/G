import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPathStyleProps } from '@antv/g-lite';
import { translatePathToString } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class PathRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPathStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { d } = parsedStyle;
      // @ts-ignore
      context.roughCanvas.path(
        translatePathToString(d.absolutePath),
        generateRoughOptions(object),
      );
    } else {
      this.options.defaultStyleRendererFactory.render(
        context,
        parsedStyle,
        object,
      );
    }
  }
}
