import type { DisplayObject, ParsedBaseStyleProps, ParsedRectStyleProps } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { RectRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { singleton } from 'mana-syringe';
import { generateRoughOptions } from '../util';

@singleton({
  token: RectRendererContribution,
})
export class RectRenderer implements StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedRectStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { width, height } = parsedStyle as ParsedRectStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#rectangle-x-y-width-height--options
    // @ts-ignore
    context.roughCanvas.rectangle(0, 0, width.value, height.value, generateRoughOptions(object));
  }
}
