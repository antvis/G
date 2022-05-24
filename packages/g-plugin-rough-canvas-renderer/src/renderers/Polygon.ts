import type { DisplayObject, ParsedBaseStyleProps, ParsedPolygonStyleProps } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { PolygonRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { singleton } from 'mana-syringe';
import { generateRoughOptions } from '../util';

@singleton({
  token: PolygonRendererContribution,
})
export class PolygonRenderer implements StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolygonStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points, defX = 0, defY = 0 } = parsedStyle as ParsedPolygonStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
    // @ts-ignore
    context.roughCanvas.polygon(
      points.points.map(([x, y]) => [x - defX, y - defY]),
      generateRoughOptions(object),
    );
  }
}
