import { SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { isNil, isArray } from '@antv/util';
import { StyleRendererContribution } from '../Base';

@injectable()
export class LineDashRenderer implements StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const { lineDash } = sceneGraphNode.attributes;

    if (!isNil(lineDash) && context.setLineDash && isArray(lineDash)) {
      context.setLineDash(lineDash);
    }
  }
}
