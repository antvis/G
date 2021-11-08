import { inject, singleton, contrib, Syringe, Contribution } from 'mana-syringe';
import { Cullable } from '../components';
import { DisplayObject } from '../display-objects/DisplayObject';
import {
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
} from '../services/RenderingService';
import { RenderingContext, RENDER_REASON } from '../services/RenderingContext';
import { CanvasConfig } from '../types';

export const CullingStrategyContribution = Syringe.defineToken('CullingStrategyContribution');
export interface CullingStrategyContribution {
  isVisible(object: DisplayObject): boolean;
}

/**
 * apply following rules:
 * 1. `visibility` in scenegraph node
 * 2. other custom culling strategies, eg. frustum culling
 */
@singleton({ contrib: RenderingPluginContribution })
export class CullingPlugin implements RenderingPlugin {
  static tag = 'CullingPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @contrib(CullingStrategyContribution)
  private strategyProvider: Contribution.Provider<CullingStrategyContribution>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const strategies = this.strategyProvider.getContributions();

    renderingService.hooks.prepare.tap(CullingPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const cullable = object.entity.getComponent(Cullable);
        if (strategies.length === 0) {
          cullable.visible = true;
        } else {
          // eg. implemented by g-webgl(frustum culling)
          cullable.visible = strategies.every((strategy) => strategy.isVisible(object));
        }

        if (object.isVisible()) {
          return object;
        } else {
          // Those invisible objects which get renderred in last frame should be saved for later use.
          const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
          if (enableDirtyRectangleRendering) {
            const removedRenderBounds = object.getRenderBounds();
            if (removedRenderBounds) {
              this.renderingContext.removedRenderBoundsList.push(removedRenderBounds);
              this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectRemoved);
            }
          }
          return null;
        }
      }

      return object;
    });

    renderingService.hooks.afterRender.tap(CullingPlugin.tag, (object: DisplayObject) => {
      object.entity.getComponent(Cullable).visibilityPlaneMask = -1;
    });
  }
}
