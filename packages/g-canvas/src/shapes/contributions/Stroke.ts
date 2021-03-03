import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import isNil from 'lodash-es/isNil';
import { StyleRendererContribution } from '../Base';
import { StyleParser } from '../StyleParser';

@injectable()
export class StrokeRenderer implements StyleRendererContribution {
  @inject(StyleParser)
  private styleParser: StyleParser;

  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const renderable = entity.getComponent(Renderable);
    const { stroke, strokeOpacity, lineWidth = 0 } = renderable.attrs;
    if (!isNil(stroke)) {
      context.strokeStyle = this.styleParser.parse(stroke);

      if (lineWidth > 0) {
        if (!isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        context.lineWidth = lineWidth;
        context.stroke();
      }
    }
  }
}
