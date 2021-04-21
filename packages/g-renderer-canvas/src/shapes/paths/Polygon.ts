import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';

export function generatePath(context: CanvasRenderingContext2D, entity: Entity) {
  const points = (entity.getComponent(SceneGraphNode).attributes.points as number[][]) || [];
  const length = points.length;

  let x1 = points[0][0];
  let y1 = points[0][1];
  let x2 = points[length - 1][0];
  let y2 = points[length - 1][1];

  context.beginPath();
  context.moveTo(x1, y1);
  for (let i = 0; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0], point[1]);
  }
  context.lineTo(x2, y2);
  context.closePath();
}
