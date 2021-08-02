import { inject, injectable, named } from 'inversify';
import { Cullable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';

export const CullingStrategy = Symbol('CullingStrategy');
export interface CullingStrategy {
  isVisible(object: DisplayObject): boolean;
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
    renderer.hooks.prepare.tap(CullingPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const entity = object.getEntity();
        const cullable = entity.getComponent(Cullable);
        if (this.strategies.getContributions(true).length === 0) {
          cullable.visible = true;
        } else {
          // eg. implemented by g-webgl(frustum culling)
          cullable.visible = this.strategies.getContributions(true).every((strategy) => strategy.isVisible(object));
        }

        if (object.style.visibility === 'visible'
          && (!cullable || cullable.visible)
        ) {
          return object;
        } else {
          return null;
        }
      }

      return object;
    });

    renderer.hooks.afterRender.tap(CullingPlugin.tag, (object: DisplayObject) => {
      const entity = object.getEntity();
      entity.getComponent(Cullable).visibilityPlaneMask = -1;
    });
  }
}
