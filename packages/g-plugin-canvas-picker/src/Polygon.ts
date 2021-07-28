import type { DisplayObject, PolylineStyleProps, Point } from '@antv/g';
import { inPolygon, inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  // @ts-ignore
  const { stroke, fill, lineWidth = 0, points, x = 0, y = 0 } = displayObject.attributes;

  let isHit = false;
  if (stroke) {
    isHit = inPolyline(points, lineWidth, position.x + x, position.y + y, true);
  }
  if (!isHit && fill) {
    isHit = inPolygon(points, position.x + x, position.y + y);
  }
  return isHit;
}
