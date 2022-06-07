import { contrib, Contribution, inject, singleton, Syringe } from 'mana-syringe';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { CustomEvent, ElementEvent } from '../dom';
import { RenderingContext } from '../services';
import type { RenderingPlugin, RenderingService } from '../services/RenderingService';
import { RenderingPluginContribution } from '../services/RenderingService';

export const CullingStrategyContribution = Syringe.defineToken('CullingStrategyContribution');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CullingStrategyContribution {
  isVisible: (object: DisplayObject) => boolean;
}

/**
 * apply following rules:
 * 1. `visibility` in scenegraph node
 * 2. other custom culling strategies, eg. frustum culling
 */
@singleton({ contrib: RenderingPluginContribution })
export class CullingPlugin implements RenderingPlugin {
  static tag = 'Culling';

  @contrib(CullingStrategyContribution)
  private strategyProvider: Contribution.Provider<CullingStrategyContribution>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const strategies = this.strategyProvider.getContributions();

    renderingService.hooks.cull.tap(CullingPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const cullable = object.cullable;
        cullable.visible = true;
        // if (strategies.length === 0) {
        //   cullable.visible = true;
        // } else {
        //   // eg. implemented by g-webgl(frustum culling)
        //   cullable.visible = strategies.every((strategy) => strategy.isVisible(object));
        // }

        if (!cullable.isCulled() && object.isVisible()) {
          return object;
        } else {
          if (this.renderingContext.renderListLastFrame.indexOf(object) > -1) {
            object.dispatchEvent(new CustomEvent(ElementEvent.CULLED));
          }
        }
        return null;
      }

      return object;
    });

    renderingService.hooks.afterRender.tap(CullingPlugin.tag, (object: DisplayObject) => {
      object.cullable.visibilityPlaneMask = -1;
    });
  }
}
