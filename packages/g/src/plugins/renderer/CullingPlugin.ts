import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Cullable, SceneGraphNode } from '../../components';
import { ContributionProvider } from '../../contribution-provider';
import { RenderingService, RenderingPlugin } from '../../services/RenderingService';

export const CullingStrategy = Symbol('CullingStrategy');
export interface CullingStrategy {
  isVisible(enity: Entity): boolean;
}

/**
 * apply following rules:
 * 1. `visibility` in scenegraph node
 * 2. other custom culling strategies, eg. frustum culling
 */
@injectable()
export class CullingPlugin implements RenderingPlugin {
  static tag = 'CullingPlugin';

  @inject(ContributionProvider)
  @named(CullingStrategy)
  private strategies: ContributionProvider<CullingStrategy>;

  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tap(CullingPlugin.tag, (entities: Entity[]) => {
      return entities.filter((entity) => {
        const cullable = entity.getComponent(Cullable);
        if (this.strategies.getContributions(true).length === 0) {
          cullable.visible = true;
        } else {
          // eg. implemented by g-webgl(frustum culling)
          cullable.visible = this.strategies.getContributions(true).every((strategy) => strategy.isVisible(entity));
        }

        return this.isVisible(entity) && (!cullable || cullable.visible);
      });
    });

    renderer.hooks.endFrame.tap(CullingPlugin.tag, (entities: Entity[]) => {
      entities.forEach((entity) => {
        entity.getComponent(Cullable).visibilityPlaneMask = -1;
      });
    });
  }

  private isVisible(entity: Entity): boolean {
    // descendants of the element will be visible if they have `visibility` set to `visible`.
    const sceneGraphNode = entity.getComponent(SceneGraphNode);

    return sceneGraphNode.attributes.visibility === 'visible';

    // return (
    //   !sceneGraphNode.parent ||
    //   sceneGraphNode.attributes.visibility === 'visible' ||
    //   (sceneGraphNode.attributes.visibility === 'initial' &&
    //     !!sceneGraphNode.parent &&
    //     this.isVisible(sceneGraphNode.parent))
    // );
  }
}
