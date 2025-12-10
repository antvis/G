import type {
  DisplayObject,
  ParsedPolygonStyleProps,
  Point,
  PolylineStyleProps,
} from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';
import { inPolygon, inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
  isClipPath: boolean,
): boolean {
  const {
    stroke,
    fill,
    lineWidth = 1,
    increasedLineWidthForHitTesting = 0,
    points,
    pointerEvents = 'auto',
  } = displayObject.parsedStyle as ParsedPolygonStyleProps;
  const [hasFill, hasStroke] = isFillOrStrokeAffected(
    pointerEvents,
    fill,
    stroke,
  );

  let isHit = false;
  if (hasStroke || isClipPath) {
    isHit = inPolyline(
      points.points,
      lineWidth + increasedLineWidthForHitTesting,
      position.x,
      position.y,
      true,
    );
  }
  if (!isHit && (hasFill || isClipPath)) {
    isHit = inPolygon(points.points, position.x, position.y);
  }
  return isHit;
}
