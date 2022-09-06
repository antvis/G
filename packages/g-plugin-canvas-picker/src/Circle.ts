import type { CircleStyleProps, DisplayObject, ParsedCircleStyleProps, Point } from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';
import { distance } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<CircleStyleProps>,
  position: Point,
): boolean {
  const {
    r,
    fill,
    stroke,
    lineWidth,
    increasedLineWidthForHitTesting,
    clipPathTargets,
    pointerEvents,
  } = displayObject.parsedStyle as ParsedCircleStyleProps;
  const halfLineWidth = ((lineWidth || 0) + (increasedLineWidthForHitTesting || 0)) / 2;
  const absDistance = distance(r, r, position.x, position.y);
  const isClipPath = !!clipPathTargets?.length;

  const [hasFill, hasStroke] = isFillOrStrokeAffected(pointerEvents, fill, stroke);

  if ((hasFill && hasStroke) || isClipPath) {
    return absDistance <= r + halfLineWidth;
  }
  if (hasFill) {
    return absDistance <= r;
  }
  if (hasStroke) {
    return absDistance >= r - halfLineWidth && absDistance <= r + halfLineWidth;
  }
  return false;
}
