import { Entity } from '@antv/g-ecs';
import { SceneGraphNode } from '@antv/g';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class PolylineRenderer implements ElementRenderer {
  apply($el: SVGElement, entity: Entity) {
    const { points } = entity.getComponent(SceneGraphNode).attributes;

    if (points && points.length >= 2) {
      $el.setAttribute(
        'points',
        (points as [number, number][]).map((point: [number, number]) => `${point[0]},${point[1]}`).join(' ')
      );
    }
  }
}
