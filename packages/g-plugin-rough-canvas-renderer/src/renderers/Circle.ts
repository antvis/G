import type { DisplayObject, ParsedBaseStyleProps, ParsedCircleStyleProps } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { CircleRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { singleton } from 'mana-syringe';
import { generateRoughOptions } from '../util';

@singleton({
  token: CircleRendererContribution,
})
export class CircleRenderer implements StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedCircleStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { r } = parsedStyle as ParsedCircleStyleProps;
    // rough.js use diameter instead of radius
    // @see https://github.com/rough-stuff/rough/wiki#circle-x-y-diameter--options
    // @ts-ignore
    context.roughCanvas.circle(r.value, r.value, r.value * 2, generateRoughOptions(object));
  }
}
