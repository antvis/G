import { SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
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
    return false;
  }

  async prepare() {}

  generatePath(context: SVGElement, entity: Entity) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const { r = 100 } = sceneGraphNode.attributes;

    this.$el.setAttribute('r', `${r}`);
  }
}
