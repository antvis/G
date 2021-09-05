import { DisplayObject, PolylineStyleProps, Point } from '@antv/g';
import { inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  const {
    stroke,
    lineWidth = 0,
    points,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
  } = displayObject.parsedStyle;
  const isClipPath = !!clipPathTargets?.length;
  if ((!stroke && !isClipPath) || !lineWidth) {
    return false;
  }

  return inPolyline(points.points, lineWidth, position.x + x, position.y + y, false);
}
