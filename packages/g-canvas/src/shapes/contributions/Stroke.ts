import { SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { isNil } from '@antv/util';
import { StyleRendererContribution } from '../Base';
import { StyleParser } from '../StyleParser';

@injectable()
export class StrokeRenderer implements StyleRendererContribution {
  @inject(StyleParser)
  private styleParser: StyleParser;

  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const { stroke, strokeOpacity, lineWidth = 0 } = sceneGraphNode.attributes;
    if (!isNil(stroke)) {
      context.strokeStyle = this.styleParser.parse(stroke!);

      if (lineWidth > 0) {
        if (!isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity!;
        }
        context.lineWidth = lineWidth;
        context.stroke();
      }
    }
  }
}
