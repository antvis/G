import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.CircleRendererContribution,
})
export class CircleRenderer implements CanvasRenderer.StyleRenderer {
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
