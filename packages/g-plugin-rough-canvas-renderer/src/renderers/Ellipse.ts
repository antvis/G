import type { DisplayObject, ParsedBaseStyleProps, ParsedEllipseStyleProps } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { EllipseRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { singleton } from 'mana-syringe';
import { generateRoughOptions } from '../util';

@singleton({
  token: EllipseRendererContribution,
})
export class EllipseRenderer implements StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedEllipseStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { rx, ry } = parsedStyle as ParsedEllipseStyleProps;
    // @ts-ignore
    context.roughCanvas.ellipse(
      rx.value,
      ry.value,
      rx.value * 2,
      ry.value * 2,
      generateRoughOptions(object),
    );
  }
}
