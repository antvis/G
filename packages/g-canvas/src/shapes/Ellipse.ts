import { Renderable, Transform } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { BaseRenderer } from './Base';

@injectable()
export class EllipseRenderer extends BaseRenderer {
  generatePath(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      const transform = entity.getComponent(Transform);
      // get position in world space
      const [cx, cy] = transform.getPosition();

      const renderable = entity.getComponent(Renderable);

      const { rx, ry } = renderable.attrs;
      context.beginPath();

      // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
      if (context.ellipse) {
        context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
      } else {
        // 如果不支持，则使用圆来绘制，进行变形
        const r = rx > ry ? rx : ry;
        const scaleX = rx > ry ? 1 : rx / ry;
        const scaleY = rx > ry ? ry / rx : 1;
        context.save();
        context.translate(cx, cy);
        context.scale(scaleX, scaleY);
        context.arc(0, 0, r, 0, Math.PI * 2);

        context.closePath();
        context.restore();
      }
    }
  }
}
