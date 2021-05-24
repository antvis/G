import { SceneGraphNode, DisplayObject } from '@antv/g';
import { distance } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject,
  {
    // lineWidth,
    x,
    y,
  }: {
    // lineWidth: number;
    x: number;
    y: number;
  }
): boolean {
  const {
    attributes: { r = 0, fill, stroke, lineWidth = 0 },
  } = displayObject.getEntity().getComponent(SceneGraphNode);
  const [cx, cy] = displayObject.getPosition();

  const halfLineWidth = lineWidth / 2;
  const absDistance = distance(cx, cy, x, y);

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
