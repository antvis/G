import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import isNil from 'lodash-es/isNil';
import { StyleRendererContribution } from '../Base';
import { StyleParser } from '../StyleParser';

@injectable()
export class FillRenderer implements StyleRendererContribution {
  @inject(StyleParser)
  private styleParser: StyleParser;

  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const renderable = entity.getComponent(Renderable);
    const { fill, opacity = 1, fillOpacity = 1 } = renderable.attrs;

    if (!isNil(fill)) {
      context.fillStyle = this.styleParser.parse(fill);

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
