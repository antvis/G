import type { ICamera } from '../camera';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { CustomEvent, ElementEvent } from '../dom';
import type {
  RenderingPlugin,
  RenderingPluginContext,
} from '../services/RenderingService';

export interface CullingStrategyContribution {
  isVisible: (camera: ICamera, object: DisplayObject) => boolean;
}

/**
 * apply following rules:
 * 1. `visibility` in scenegraph node
 * 2. other custom culling strategies, eg. frustum culling
 */
export class CullingPlugin implements RenderingPlugin {
  static tag = 'Culling';

  constructor(private strategies: CullingStrategyContribution[]) {}

  apply(context: RenderingPluginContext) {
    const { camera, renderingService, renderingContext } = context;
    const strategies = this.strategies;

    renderingService.hooks.cull.tap(
      CullingPlugin.tag,
      (object: DisplayObject | null) => {
        if (object) {
          const { cullable } = object;

          if (strategies.length === 0) {
            cullable.visible =
              renderingContext.unculledEntities.indexOf(object.entity) > -1;
          } else {
            // eg. implemented by g-webgl(frustum culling)
            cullable.visible = strategies.every((strategy) =>
              strategy.isVisible(camera, object),
            );
          }

          if (!object.isCulled() && object.isVisible()) {
            return object;
          } else {
            object.dispatchEvent(new CustomEvent(ElementEvent.CULLED));
          }
          return null;
        }

        return object;
      },
    );

    renderingService.hooks.afterRender.tap(CullingPlugin.tag, (objects) => {
      objects.forEach((object) => {
        object.cullable.visibilityPlaneMask = -1;
      });
    });
  }
}
