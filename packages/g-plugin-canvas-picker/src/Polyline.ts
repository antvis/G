import type { DisplayObject, PolylineStyleProps, Point } from '@antv/g';
import { inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  // @ts-ignore
  const { stroke, lineWidth = 0, points, x = 0, y = 0 } = displayObject.attributes;
  if (!stroke || !lineWidth) {
    return false;
  }

  return inPolyline(points, lineWidth, position.x + x, position.y + y, false);
}
