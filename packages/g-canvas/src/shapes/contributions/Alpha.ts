import { SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { isNil } from '@antv/util';
import { StyleRendererContribution } from '../Base';

@injectable()
export class AlphaRenderer implements StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const { opacity } = sceneGraphNode.attributes;

    if (!isNil(opacity)) {
      context.globalAlpha = context.globalAlpha * opacity!;
    }
  }
}
