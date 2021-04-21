import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';

export function generatePath(context: CanvasRenderingContext2D, entity: Entity) {
  context.beginPath();
  const { x1 = 0, x2 = 0, y1 = 0, y2 = 0 } = entity.getComponent(SceneGraphNode).attributes;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
}
