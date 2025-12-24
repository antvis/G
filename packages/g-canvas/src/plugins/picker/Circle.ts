import type {
  CircleStyleProps,
  DisplayObject,
  ParsedCircleStyleProps,
  Point,
} from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';
import { distance } from '@antv/g-math';

export function isPointInPath(
  displayObject: DisplayObject<CircleStyleProps>,
  position: Point,
  isClipPath: boolean,
): boolean {
  const {
    cx = 0,
    cy = 0,
    r,
    fill,
    stroke,
    lineWidth = 1,
    increasedLineWidthForHitTesting = 0,
    pointerEvents = 'auto',
  } = displayObject.parsedStyle as ParsedCircleStyleProps;
  const halfLineWidth = (lineWidth + increasedLineWidthForHitTesting) / 2;
  const absDistance = distance(cx, cy, position.x, position.y);

  const [hasFill, hasStroke] = isFillOrStrokeAffected(
    pointerEvents,
    fill,
    stroke,
  );

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
