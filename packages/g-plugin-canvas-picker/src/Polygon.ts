import { DisplayObject, PolylineStyleProps, Point } from '@antv/g';
import { inPolygon, inPolyline } from './utils/math';

export function isPointInPath(displayObject: DisplayObject<PolylineStyleProps>, position: Point): boolean {
  const { stroke, fill, lineWidth = 0, points, x = 0, y = 0, clipPathTargets } = displayObject.attributes;
  const isClipPath = !!clipPathTargets?.length;

  let isHit = false;
  if (stroke || isClipPath) {
    isHit = inPolyline(points, lineWidth, position.x + x, position.y + y, true);
  }
  if (!isHit && (fill || isClipPath)) {
    isHit = inPolygon(points, position.x + x, position.y + y);
  }
  return isHit;
}
