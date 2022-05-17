import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedBaseStyleProps, ParsedPathStyleProps } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { PathRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { formatPath, generateRoughOptions } from '../util';

@singleton({
  token: PathRendererContribution,
})
export class PathRenderer implements StyleRenderer {
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
