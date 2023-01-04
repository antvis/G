import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g-lite';
import { Ellipse } from 'zdog';

export class CircleRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedCircleStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { r, lineWidth, fill } = parsedStyle as ParsedCircleStyleProps;

    const c = new Ellipse({
      // @ts-ignore
      addTo: context.scene,
      diameter: 2 * r,
      stroke: lineWidth,
      color: '#f00',
      translate: {
        x: 200,
        y: 200,
        z: 40,
      },
    });

    // @ts-ignore
    console.log(context.scene);
  }
}
