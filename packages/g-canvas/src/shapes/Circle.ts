import { Renderable, Transform } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { BaseRenderer } from './Base';

@injectable()
export class CircleRenderer extends BaseRenderer {
  generatePath(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      const transform = entity.getComponent(Transform);
      const renderable = entity.getComponent(Renderable);
      const { r = 100 } = renderable.attrs;
      // get position in world space
      const [cx, cy] = transform.getPosition();
      context.arc(cx, cy, r, 0, Math.PI * 2, false);
    }
  }
}
