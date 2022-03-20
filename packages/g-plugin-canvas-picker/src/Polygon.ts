import type { DisplayObject, PolylineStyleProps, Point, ParsedBaseStyleProps } from '@antv/g';
import { inPolygon, inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  const {
    stroke,
    fill,
    lineWidth,
    points,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedBaseStyleProps;
  const isClipPath = !!clipPathTargets?.length;

  let isHit = false;
  if (stroke || isClipPath) {
    isHit = inPolyline(points.points, lineWidth.value, position.x + x, position.y + y, true);
  }
  if (!isHit && (fill || isClipPath)) {
    isHit = inPolygon(points.points, position.x + x, position.y + y);
  }
  return isHit;
}
