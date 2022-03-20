import type { CircleStyleProps, DisplayObject, ParsedCircleStyleProps, Point } from '@antv/g';
import { distance } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<CircleStyleProps>,
  position: Point,
): boolean {
  const {
    rInPixels: r,
    fill,
    stroke,
    lineWidth,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedCircleStyleProps;
  const halfLineWidth = lineWidth.value / 2;
  const absDistance = distance(r, r, position.x, position.y);
  const isClipPath = !!clipPathTargets?.length;

  // 直接用距离，如果同时存在边和填充时，可以减少两次计算
  if ((fill && stroke) || isClipPath) {
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
