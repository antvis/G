import { Entity } from '@antv/g-ecs';
import { SceneGraphNode } from '@antv/g';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class LineRenderer implements ElementRenderer {
  apply($el: SVGElement, entity: Entity) {
    const { width, height } = entity.getComponent(SceneGraphNode).attributes;

    $el.setAttribute('x1', '0');
    $el.setAttribute('y1', '0');
    $el.setAttribute('x1', `${width}`);
    $el.setAttribute('y1', `${height}`);

    $el.removeAttribute('width');
    $el.removeAttribute('height');
  }
}
