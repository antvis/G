import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Geometry, SceneGraphNode } from '../components';
import { Renderable } from '../components/Renderable';
import { SceneGraphService } from '../services';
import { AABBCalculator } from './AABBCalculator';

export const ShapeRendererFactory = Symbol('ShapeRendererFactory');
export const ShapeRenderer = Symbol('ShapeRenderer');
export interface ShapeRenderer<Context> {
  init(context: Context, entity: Entity): Promise<void>;
  render(context: Context, entity: Entity): void;
  onAttributeChanged(entity: Entity, name: string, value: any): Promise<void>;
  isHit?(entity: Entity, position: { x: number; y: number }): boolean;
}
@injectable()
export abstract class DefaultShapeRenderer<Context> implements ShapeRenderer<Context> {
  @inject(System)
  @named(AABBCalculator.tag)
  protected aabbSystem: AABBCalculator;

  @inject(SceneGraphService)
  protected sceneGraphSystem: SceneGraphService;

  getDefaultAttributes() {
    return {
      opacity: 1,
      strokeOpacity: 1,
    };
  }

  abstract init(context: Context, entity: Entity): Promise<void>;

  abstract render(context: Context, entity: Entity): void;

  async onAttributeChanged(entity: Entity, name: string, value: any) {
    const renderable = entity.getComponent(Renderable);
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const geometry = entity.getComponent(Geometry);

    const [x, y] = this.sceneGraphSystem.getPosition(entity);

    sceneGraphNode.attributes[name] = value;

    if (name === 'x') {
      this.sceneGraphSystem.setPosition(entity, value, y);
    } else if (name === 'y') {
      this.sceneGraphSystem.setPosition(entity, x, value);
    } else if (
      name === 'lineWidth' ||
      name === 'r' || // circle
      name === 'rx' ||
      name === 'rx' || // ellipse
      name === 'width' ||
      name === 'height' || // rect & image
      name === 'anchor' // image
    ) {
      this.aabbSystem.updateAABB(sceneGraphNode.tagName, sceneGraphNode.attributes, geometry.aabb);
      renderable.aabbDirty = true;
    }
  }
}
