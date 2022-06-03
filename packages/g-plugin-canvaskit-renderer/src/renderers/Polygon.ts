import { ContextService, DisplayObject, isNil, ParsedPolygonStyleProps } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import {
  CanvasKitContext,
  PolygonRendererContribution,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Path_addPoly
 */
@singleton({
  token: PolygonRendererContribution,
})
export class PolygonRenderer implements RendererContribution {
  @inject(ContextService)
  private contextService: ContextService<CanvasKitContext>;

  render(object: DisplayObject, context: RendererContributionContext) {
    const { CanvasKit } = this.contextService.getContext();
    const { canvas, fillPaint, strokePaint, shadowPaint } = context;

    const { shadowColor, shadowOffsetX, shadowOffsetY, defX, defY, points } =
      object.parsedStyle as ParsedPolygonStyleProps;

    const formattedPoints = points.points
      .map(([x, y]) => [x - defX, y - defY])
      .reduce<number[]>((prev, cur) => prev.concat(cur), []);

    if (!isNil(shadowColor)) {
      const path = new CanvasKit.Path();
      path.addPoly(
        formattedPoints.map((x, i) =>
          x + (i % 2) === 0 ? shadowOffsetX?.value || 0 : shadowOffsetY?.value || 0,
        ),
        true,
      );
      canvas.drawPath(path, shadowPaint);
    }

    const path = new CanvasKit.Path();
    path.addPoly(formattedPoints, true);

    canvas.drawPath(path, fillPaint);
    canvas.drawPath(path, strokePaint);
  }
}
