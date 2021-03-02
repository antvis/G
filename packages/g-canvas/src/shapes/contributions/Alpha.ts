import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import isNil from 'lodash-es/isNil';
import { StyleRendererContribution } from '../Base';

@injectable()
export class AlphaRenderer implements StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const renderable = entity.getComponent(Renderable);
    const { opacity } = renderable.attrs;

    if (!isNil(opacity)) {
      context.globalAlpha = context.globalAlpha * opacity;
    }
  }
}
