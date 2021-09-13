import { inject, injectable, named } from 'inversify';
import { Cullable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { RenderingContext, RENDER_REASON } from '../services/RenderingContext';
import { CanvasConfig } from '../types';

export const CullingStrategy = 'CullingStrategy';
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

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContributionProvider)
  @named(CullingStrategy)
  private strategies: ContributionProvider<CullingStrategy>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderer: RenderingService) {
    renderer.hooks.prepare.tap(CullingPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const entity = object.getEntity();
        const cullable = entity.getComponent(Cullable);
        if (this.strategies.getContributions(true).length === 0) {
          cullable.visible = true;
        } else {
          // eg. implemented by g-webgl(frustum culling)
          cullable.visible = this.strategies
            .getContributions(true)
            .every((strategy) => strategy.isVisible(object));
        }

        if (object.isVisible()) {
          return object;
        } else {
          // Those invisible objects which get renderred in last frame should be saved for later use.
          const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
          if (enableDirtyRectangleRendering) {
            const removedAABB = object.getBounds();
            if (removedAABB) {
              this.renderingContext.removedAABBs.push(removedAABB);
              this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectRemoved);
            }
          }
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
