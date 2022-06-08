import type { DisplayObject, ParsedBaseStyleProps, ParsedPathStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { formatPath, generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.PathRendererContribution,
})
export class PathRenderer implements CanvasRenderer.StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPathStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { path, defX = 0, defY = 0 } = parsedStyle as ParsedPathStyleProps;
    const formatted = formatPath(path.absolutePath, defX, defY);
    // @ts-ignore
    context.roughCanvas.path(formatted, generateRoughOptions(object));
  }
}
