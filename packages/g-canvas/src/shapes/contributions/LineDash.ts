import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import isNil from 'lodash-es/isNil';
import isArray from 'lodash-es/isArray';
import { StyleRendererContribution } from '../Base';

@injectable()
export class LineDashRenderer implements StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D) {
    const renderable = entity.getComponent(Renderable);
    const { lineDash } = renderable.attrs;

    if (!isNil(lineDash) && context.setLineDash && isArray(lineDash)) {
      context.setLineDash(lineDash);
    }
  }
}
