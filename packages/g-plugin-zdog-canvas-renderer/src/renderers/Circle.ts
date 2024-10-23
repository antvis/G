import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g-lite';
import { Anchor, Ellipse } from 'zdog';

export class CircleRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D & { scene: Anchor },
    parsedStyle: ParsedCircleStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { r, lineWidth, fill } = parsedStyle;

    new Ellipse({
      addTo: context.scene,
      diameter: 2 * r,
      stroke: lineWidth,
      color: fill.toString(),
      translate: {
        x: 0,
        y: 0,
        z: 40,
      },
    });

    // @see https://zzz.dog/api#illustration-updaterendergraph
    context.scene.updateGraph();
  }
}
