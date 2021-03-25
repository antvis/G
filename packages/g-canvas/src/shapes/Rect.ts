import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { BaseRenderer } from './Base';

@injectable()
export class RectRenderer extends BaseRenderer {
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
    // const { attrs: { x: cx = 0, y: cy = 0, r = 0, fill, stroke } } = entity.getComponent(Renderable);
    // const halfLineWidth = lineWidth / 2;
    // const absDistance = distance(cx, cy, x, y);
    // // 直接用距离，如果同时存在边和填充时，可以减少两次计算
    // if (fill && stroke) {
    //   return absDistance <= r + halfLineWidth;
    // }
    // if (fill) {
    //   return absDistance <= r;
    // }
    // if (stroke) {
    //   return absDistance >= r - halfLineWidth && absDistance <= r + halfLineWidth;
    // }
    return false;
  }

  generatePath(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      const renderable = entity.getComponent(Renderable);
      const { radius = 0, width = 0, height = 0 } = renderable.attrs;

      if (radius === 0) {
        context.rect(0, 0, width, height);
      } else {
        // const [r1, r2, r3, r4] = parseRadius(radius);
        // context.moveTo(x + r1, y);
        // context.lineTo(x + width - r2, y);
        // r2 !== 0 && context.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
        // context.lineTo(x + width, y + height - r3);
        // r3 !== 0 && context.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
        // context.lineTo(x + r4, y + height);
        // r4 !== 0 && context.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
        // context.lineTo(x, y + r1);
        // r1 !== 0 && context.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
      }
    }
  }

  draw() {}
}
