import { SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { isNil } from '@antv/util';
import { StyleRendererContribution } from '../Base';

/**
 * apply attrs to context directly
 */
@injectable()
export class RestRenderer implements StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    // eslint-disable-next-line no-unused-vars
    const { stroke, fill, opacity, fillOpacity, lineDash, ...rest } = sceneGraphNode.attributes;
    for (const key in rest) {
      if (key in context && !isNil(rest[key])) {
        // @ts-ignore
        context[key] = rest[key];
      }
    }
  }
}
