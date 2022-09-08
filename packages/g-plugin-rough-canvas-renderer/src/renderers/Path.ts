import type { DisplayObject, ParsedPathStyleProps } from '@antv/g';
import { singleton, translatePathToString } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.PathRendererContribution,
})
export class PathRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPathStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { path, defX = 0, defY = 0 } = parsedStyle as ParsedPathStyleProps;
    // @ts-ignore
    context.roughCanvas.path(
      translatePathToString(path.absolutePath, defX, defY),
      generateRoughOptions(object),
    );
  }
}
