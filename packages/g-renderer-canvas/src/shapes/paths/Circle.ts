import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';

export function generatePath(context: CanvasRenderingContext2D, entity: Entity) {
  context.beginPath();
  const { r = 100 } = entity.getComponent(SceneGraphNode).attributes;
  context.arc(0, 0, r, 0, Math.PI * 2, false);
}
