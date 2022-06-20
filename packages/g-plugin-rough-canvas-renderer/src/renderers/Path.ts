import type { DisplayObject, ParsedBaseStyleProps, ParsedPathStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { path2String } from '@antv/util';
import { generateRoughOptions } from '../util';

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
    const { path } = parsedStyle as ParsedPathStyleProps;
    // @ts-ignore
    context.roughCanvas.path(path2String(path.absolutePath, 3), generateRoughOptions(object));
  }
}
