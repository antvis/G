import type {
  CanvasContext,
  ParsedPathStyleProps,
  Path,
  ContextService,
} from '@antv/g-lite';
import { isDisplayObject } from '@antv/g-lite';
import { mat3 } from 'gl-matrix';
import type { CanvasKit } from 'canvaskit-wasm';
import type {
  CanvasKitContext,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * Generate SkPath from G's Path.
 * @see https://api.skia.org/classSkPath.html
 */
export function generateSkPath(CanvasKit: CanvasKit, object: Path) {
  const skPath = new CanvasKit.Path();

  const {
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

  if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
    const [p1, p2] = (markerStart.parentNode as Path).getStartTangent();
    x = p1[0] - p2[0];
    y = p1[1] - p2[1];

    rad = Math.atan2(y, x);
    startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
    startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
  }

  if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
    const [p1, p2] = (markerEnd.parentNode as Path).getEndTangent();
    x = p1[0] - p2[0];
    y = p1[1] - p2[1];
    rad = Math.atan2(y, x);
    endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
    endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
  }

  const { absolutePath, segments } = path;

  for (let i = 0; i < absolutePath.length; i++) {
    const params = absolutePath[i]; // eg. M 100 200
    const command = params[0];
    const nextSegment = absolutePath[i + 1];
    const useStartOffset =
      i === 0 && (startOffsetX !== 0 || startOffsetY !== 0);
    const useEndOffset =
      (i === absolutePath.length - 1 ||
        (nextSegment && (nextSegment[0] === 'M' || nextSegment[0] === 'Z'))) &&
      endOffsetX !== 0 &&
      endOffsetY !== 0;

    switch (command) {
      case 'M':
        // Use start marker offset
        if (useStartOffset) {
          skPath.moveTo(
            params[1] - defX + startOffsetX,
            params[2] - defY + startOffsetY,
          );
          skPath.lineTo(params[1] - defX, params[2] - defY);
        } else {
          skPath.moveTo(params[1] - defX, params[2] - defY);
        }
        break;
      case 'L':
        if (useEndOffset) {
          skPath.lineTo(
            params[1] - defX + endOffsetX,
            params[2] - defY + endOffsetY,
          );
        } else {
          skPath.lineTo(params[1] - defX, params[2] - defY);
        }
        break;
      case 'Q':
        skPath.quadTo(
          params[1] - defX,
          params[2] - defY,
          params[3] - defX,
          params[4] - defY,
        );
        if (useEndOffset) {
          skPath.lineTo(
            params[3] - defX + endOffsetX,
            params[4] - defY + endOffsetY,
          );
        }
        break;
      case 'C':
        skPath.cubicTo(
          params[1] - defX,
          params[2] - defY,
          params[3] - defX,
          params[4] - defY,
          params[5] - defX,
          params[6] - defY,
        );

        if (useEndOffset) {
          skPath.lineTo(
            params[5] - defX + endOffsetX,
            params[6] - defY + endOffsetY,
          );
        }
        break;
      case 'A': {
        const arcParams = segments[i].arcParams;
        const { rx, ry, sweepFlag } = arcParams;
        const largeArcFlag = params[4];
        skPath.arcToRotated(
          rx,
          ry,
          params[3],
          !largeArcFlag, // useSmallArc
          !!(1 - sweepFlag),
          params[6] - defX,
          params[7] - defY,
        );

        if (useEndOffset) {
          skPath.lineTo(
            params[6] - defX + endOffsetX,
            params[7] - defY + endOffsetY,
          );
        }
        break;
      }
      case 'Z':
        skPath.close();
        break;
      default:
        break;
    }
  }

  return skPath;
}

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawPath
 */
export class PathRenderer implements RendererContribution {
  constructor(private context: CanvasContext) {}

  render(object: Path, context: RendererContributionContext) {
    const { CanvasKit } = (
      this.context.contextService as ContextService<CanvasKitContext>
    ).getContext();
    const {
      canvas,
      fillPaint,
      strokePaint,
      shadowFillPaint,
      shadowStrokePaint,
    } = context;

    const { shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedPathStyleProps;

    const skPath = generateSkPath(CanvasKit, object);

    if (shadowFillPaint || shadowStrokePaint) {
      const shadowPath = skPath.copy();
      shadowPath.transform(
        mat3.fromTranslation(mat3.create(), [
          (shadowOffsetX || 0) / 2,
          (shadowOffsetY || 0) / 2,
        ]),
      );
      canvas.drawPath(
        shadowPath,
        fillPaint ? shadowFillPaint : shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawPath(skPath, fillPaint);
    }

    if (strokePaint) {
      canvas.drawPath(skPath, strokePaint);
    }
  }
}
