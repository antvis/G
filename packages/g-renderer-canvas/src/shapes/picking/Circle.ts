import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { distance } from '../../utils/math';

export function isPointInPath(
  entity: Entity,
  {
    lineWidth,
    x,
    y,
  }: {
    lineWidth: number;
    x: number;
    y: number;
  }
): boolean {
  const {
    attributes: { x: cx = 0, y: cy = 0, r = 0, fill, stroke },
  } = entity.getComponent(SceneGraphNode);
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
