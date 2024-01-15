import type {
  DisplayObject,
  ParsedPolylineStyleProps,
  Point,
  PolylineStyleProps,
} from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';
import { inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
  isClipPath: boolean,
): boolean {
  const {
    lineWidth,
    increasedLineWidthForHitTesting,
    points,
    pointerEvents,
    fill,
    stroke,
  } = displayObject.parsedStyle as ParsedPolylineStyleProps;
  const [, hasStroke] = isFillOrStrokeAffected(pointerEvents, fill, stroke);

  if ((!hasStroke && !isClipPath) || !lineWidth) {
    return false;
  }

  return inPolyline(
    points.points,
    (lineWidth || 0) + (increasedLineWidthForHitTesting || 0),
    position.x,
    position.y,
    false,
  );
}
