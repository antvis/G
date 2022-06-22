import type { DisplayObject, ParsedPolylineStyleProps } from '@antv/g';
import { ContextService, inject, singleton } from '@antv/g';
import type {
  CanvasKitContext,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';
import { PolylineRendererContribution } from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Path_addPoly
 */
@singleton({
  token: PolylineRendererContribution,
})
export class PolylineRenderer implements RendererContribution {
  @inject(ContextService)
  private contextService: ContextService<CanvasKitContext>;

  render(object: DisplayObject, context: RendererContributionContext) {
    const { CanvasKit } = this.contextService.getContext();
    const { canvas, strokePaint, shadowStrokePaint } = context;

    const { shadowOffsetX, shadowOffsetY, points, defX, defY } =
      object.parsedStyle as ParsedPolylineStyleProps;

    const formattedPoints = points.points
      .map(([x, y]) => [x - defX, y - defY])
      .reduce<number[]>((prev, cur) => prev.concat(cur), []);

    if (shadowStrokePaint) {
      const path = new CanvasKit.Path();
      path.addPoly(
        formattedPoints.map(
          (x, i) =>
            x + (i % 2 === 0 ? (shadowOffsetX?.value || 0) / 2 : (shadowOffsetY?.value || 0) / 2),
        ),
        false,
      );
      canvas.drawPath(path, shadowStrokePaint);
    }

    const path = new CanvasKit.Path();
    path.addPoly(formattedPoints, false);

    if (strokePaint) {
      canvas.drawPath(path, strokePaint);
    }
  }
}
