import { SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { isNil } from '@antv/util';
import { StyleRendererContribution } from '../Base';
import { StyleParser } from '../StyleParser';

@injectable()
export class FillRenderer implements StyleRendererContribution {
  @inject(StyleParser)
  private styleParser: StyleParser;

  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const { fill, opacity = 1, fillOpacity = 1 } = sceneGraphNode.attributes;

    if (!isNil(fill)) {
      context.fillStyle = this.styleParser.parse(fill!);

      if (!isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        context.fill();
        context.globalAlpha = opacity;
      } else {
        context.fill();
      }
    }
  }
}
