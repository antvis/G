import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { distance } from '../utils/math';
import { BaseRenderer } from './Base';

@injectable()
export class CircleRenderer extends BaseRenderer {
  isInStrokeOrPath(
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
      attrs: { x: cx = 0, y: cy = 0, r = 0, fill, stroke },
    } = entity.getComponent(Renderable);
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

  generatePath(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      const renderable = entity.getComponent(Renderable);
      const { r = 100 } = renderable.attrs;
      context.arc(0, 0, r, 0, Math.PI * 2, false);
    }
  }
}
