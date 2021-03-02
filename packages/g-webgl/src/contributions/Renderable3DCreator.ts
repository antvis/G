import { Renderable, ShapeConfigHandlerContribution, ShapeRenderer, ShapeRendererFactory } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Geometry3D } from '../components/Geometry3D';
import { Material3D } from '../components/Material3D';

@injectable()
export class Renderable3DCreator implements ShapeConfigHandlerContribution {
  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  handle(entity: Entity) {
    entity.addComponent(Geometry3D);
    entity.addComponent(Material3D);
    const renderable = entity.getComponent(Renderable);

    // start to build model for 3D renderable
    const renderer = this.shapeRendererFactory(renderable.type);
    renderer?.render(entity);
  }
}
