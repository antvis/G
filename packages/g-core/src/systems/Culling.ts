import { Entity, Matcher, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Geometry } from '../components';
import { Cullable } from '../components/Cullable';
import { Renderable } from '../components/Renderable';
import { ContributionProvider } from '../contribution-provider';

export const CullingStrategy = Symbol('CullingStrategy');
export interface CullingStrategy {
  isVisible(enity: Entity): boolean;
}

@injectable()
export class DefaultCullingStrategy implements CullingStrategy {
  isVisible() {
    return true;
  }
}

@injectable()
export class Culling implements System {
  static tag = 's-culling';

  @inject(ContributionProvider)
  @named(CullingStrategy)
  protected strategies: ContributionProvider<CullingStrategy>;

  trigger() {
    return new Matcher().allOf(Renderable, Cullable, Geometry);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const cullable = entity.getComponent(Cullable);

      // eg. implemented by g-webgl(frustum culling)
      cullable.visible = this.strategies.getContributions().every((strategy) => strategy.isVisible(entity));
    });
  }
}
