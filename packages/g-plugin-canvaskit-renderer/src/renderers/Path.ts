import type { DisplayObject, ParsedPathStyleProps } from '@antv/g';
import { ContextService } from '@antv/g';
import { mat3 } from 'gl-matrix';
import { inject, singleton } from 'mana-syringe';
import type {
  CanvasKitContext,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';
import { PathRendererContribution } from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawPath
 */
@singleton({
  token: PathRendererContribution,
})
export class PathRenderer implements RendererContribution {
  @inject(ContextService)
  private contextService: ContextService<CanvasKitContext>;

  render(object: DisplayObject, context: RendererContributionContext) {
    const { CanvasKit } = this.contextService.getContext();
    const { canvas, fillPaint, strokePaint, shadowFillPaint, shadowStrokePaint } = context;

    const {
      shadowOffsetX,
      shadowOffsetY,
      defX: x,
      defY: y,
      path,
    } = object.parsedStyle as ParsedPathStyleProps;

    const skPath = new CanvasKit.Path();

    const { curve, zCommandIndexes } = path;
    const pathCommand = [...curve];
    zCommandIndexes.forEach((zIndex, index) => {
      pathCommand.splice(zIndex + index, 1, ['Z']);
    });

    for (let i = 0; i < pathCommand.length; i++) {
      const params = pathCommand[i]; // eg. M 100 200
      const command = params[0];
      // V,H,S,T 都在前面被转换成标准形式
      switch (command) {
        case 'M':
          skPath.moveTo(params[1] - x, params[2] - y);
          break;
        case 'C':
          skPath.cubicTo(
            params[1] - x,
            params[2] - y,
            params[3] - x,
            params[4] - y,
            params[5] - x,
            params[6] - y,
          );
          break;
        case 'Z':
          skPath.close();
          break;
        default:
          break;
      }
    }

    if (shadowFillPaint || shadowStrokePaint) {
      const shadowPath = skPath.copy();
      shadowPath.transform(
        mat3.fromTranslation(mat3.create(), [
          (shadowOffsetX?.value || 0) / 2,
          (shadowOffsetY?.value || 0) / 2,
        ]),
      );
      canvas.drawPath(shadowPath, fillPaint ? shadowFillPaint : shadowStrokePaint);
    }

    if (fillPaint) {
      canvas.drawPath(skPath, fillPaint);
    }

    if (strokePaint) {
      canvas.drawPath(skPath, strokePaint);
    }
  }
}
