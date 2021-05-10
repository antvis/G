import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';

export function generatePath(context: CanvasRenderingContext2D, entity: Entity) {
  context.beginPath();
  const { width = 0, height = 0 } = entity.getComponent(SceneGraphNode).attributes;
  context.moveTo(0, 0);
  context.lineTo(width, height);
}
