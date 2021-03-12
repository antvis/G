import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { BaseRenderer } from './Base';

@injectable()
export class CircleRenderer extends BaseRenderer {
  generatePath(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      const renderable = entity.getComponent(Renderable);
      const { r = 100 } = renderable.attrs;
      context.arc(0, 0, r, 0, Math.PI * 2, false);
    }
  }
}
