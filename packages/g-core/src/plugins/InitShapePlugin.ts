import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Cullable, Geometry, Renderable, SceneGraphNode } from '../components';
import { Shape, ShapePlugin } from '../Shape';
import { AABBCalculator } from '../systems';

@injectable()
export class InitShapePlugin implements ShapePlugin {
  @inject(System)
  @named(AABBCalculator.tag)
  private aabbSystem: AABBCalculator;

  apply(shape: Shape) {
    shape.hooks.init.tap('InitPlugin', (entity: Entity) => {
      const sceneGraphNode = entity.getComponent(SceneGraphNode);

      // FIXME: only shape can be rendered
      const renderable = entity.addComponent(Renderable);
      renderable.aabbDirty = true;

      entity.addComponent(Cullable);

      const geometry = entity.addComponent(Geometry);
      this.aabbSystem.updateAABB(sceneGraphNode.tagName, sceneGraphNode.attributes, geometry.aabb);
    });
  }
}
