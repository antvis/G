import { CircleStyleProps, DisplayObject, Point } from '@antv/g';
import { distance } from './utils/math';

export function isPointInPath(displayObject: DisplayObject<CircleStyleProps>, position: Point): boolean {
  const { r = 0, fill, stroke, lineWidth = 0 } = displayObject.attributes;

  const halfLineWidth = lineWidth / 2;
  const absDistance = distance(0, 0, position.x, position.y);

  // 直接用距离，如果同时存在边和填充时，可以减少两次计算
  if (fill && stroke) {
    return absDistance <= r + halfLineWidth;
  }
  if (fill) {
    return absDistance <= r;
  }
  if (stroke) {
    return absDistance >= r - halfLineWidth && absDistance <= r + halfLineWidth;
  }
  return false;
}
