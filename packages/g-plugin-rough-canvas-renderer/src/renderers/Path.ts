import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPathStyleProps } from '@antv/g-lite';
import { translatePathToString } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

export class PathRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPathStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { path } = parsedStyle as ParsedPathStyleProps;
    // @ts-ignore
    context.roughCanvas.path(
      translatePathToString(path.absolutePath),
      generateRoughOptions(object),
    );
  }
}
