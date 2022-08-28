import { contrib, Contribution, inject, singleton, Syringe } from 'mana-syringe';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { CustomEvent, ElementEvent } from '../dom';
import { RenderingContext } from '../services';
import type { RenderingPlugin, RenderingService } from '../services/RenderingService';
import { RenderingPluginContribution } from '../services/RenderingService';

export const CullingStrategyContribution = Syringe.defineToken('');
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
        const { cullable } = object;
        // cullable.visible = true;
        // const renderBounds = object.getRenderBounds();
        // if (AABB.isEmpty(renderBounds)) {
        //   cullable.visible = false;
        // } else {
        //   const isShape2D = shape2D.indexOf(object.nodeName as Shape) > -1;
        //   const [p0, p1, p2, p3] = camera.getFrustum().planes;
        //   tmpAABB.setMinMax([-p1.distance, -p3.distance, 0], [p0.distance, p2.distance, 0]);

        //   cullable.visible = isShape2D ? renderBounds.intersects(tmpAABB) : true;
        // }

        if (strategies.length === 0) {
          cullable.visible = this.renderingContext.unculledEntities.indexOf(object.entity) > -1;
        } else {
          // eg. implemented by g-webgl(frustum culling)
          cullable.visible = strategies.every((strategy) => strategy.isVisible(object));
        }

        if (!object.isCulled() && object.isVisible()) {
          return object;
        } else {
          // if (this.renderingContext.renderListLastFrame.indexOf(object) > -1) {
          object.dispatchEvent(new CustomEvent(ElementEvent.CULLED));
          // }
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
