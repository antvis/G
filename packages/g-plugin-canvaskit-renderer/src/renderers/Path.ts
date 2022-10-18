import type { CanvasContext, ParsedPathStyleProps, Path, ContextService } from '@antv/g-lite';
import { DisplayObject } from '@antv/g-lite';
import { mat3 } from 'gl-matrix';
import type {
  CanvasKitContext,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawPath
 */
export class PathRenderer implements RendererContribution {
  constructor(private context: CanvasContext) {}

  render(object: DisplayObject, context: RendererContributionContext) {
    const { CanvasKit } = (
      this.context.contextService as ContextService<CanvasKitContext>
    ).getContext();
    const { canvas, fillPaint, strokePaint, shadowFillPaint, shadowStrokePaint } = context;

    const {
      shadowOffsetX,
      shadowOffsetY,
      defX,
      defY,
      path,
      markerStart,
      markerEnd,
      markerStartOffset,
      markerEndOffset,
    } = object.parsedStyle as ParsedPathStyleProps;

    let startOffsetX = 0;
    let startOffsetY = 0;
    let endOffsetX = 0;
    let endOffsetY = 0;

    let rad = 0;
    let x: number;
    let y: number;

    if (markerStart && markerStart instanceof DisplayObject && markerStartOffset) {
      const [p1, p2] = (markerStart.parentNode as Path).getStartTangent();
      x = p1[0] - p2[0];
      y = p1[1] - p2[1];

      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
      const [p1, p2] = (markerEnd.parentNode as Path).getEndTangent();
      x = p1[0] - p2[0];
      y = p1[1] - p2[1];
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    const skPath = new CanvasKit.Path();

    const { curve, zCommandIndexes } = path;
    const pathCommand = [...curve];
    zCommandIndexes.forEach((zIndex, index) => {
      // @ts-ignore
      pathCommand.splice(zIndex + index + 1, 0, ['Z']);
    });

    // @ts-ignore
    const isClosed = pathCommand.length && pathCommand[pathCommand.length - 1][0] === 'Z';

    for (let i = 0; i < pathCommand.length; i++) {
      const params = pathCommand[i]; // eg. M 100 200
      const command = params[0];
      // V,H,S,T 都在前面被转换成标准形式
      switch (command) {
        case 'M':
          skPath.moveTo(params[1] - defX + startOffsetX, params[2] - defY + startOffsetY);
          break;
        case 'C':
          // the last C command
          const offsetX = i === pathCommand.length - (isClosed ? 2 : 1) ? endOffsetX : 0;
          const offsetY = i === pathCommand.length - (isClosed ? 2 : 1) ? endOffsetY : 0;

          skPath.cubicTo(
            params[1] - defX,
            params[2] - defY,
            params[3] - defX,
            params[4] - defY,
            params[5] - defX + offsetX,
            params[6] - defY + offsetY,
          );
          break;
        // @ts-ignore
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
        mat3.fromTranslation(mat3.create(), [(shadowOffsetX || 0) / 2, (shadowOffsetY || 0) / 2]),
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
