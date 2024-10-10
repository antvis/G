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
    const { strategies } = this;

    renderingService.hooks.cull.tap(
      CullingPlugin.tag,
      (object: DisplayObject | null) => {
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
          }
          // if (this.renderingContext.renderListLastFrame.indexOf(object) > -1) {
          object.dispatchEvent(new CustomEvent(ElementEvent.CULLED));
          // }

          return null;
        }

        return object;
      },
    );

    renderingService.hooks.afterRender.tap(
      CullingPlugin.tag,
      (object: DisplayObject) => {
        object.cullable.visibilityPlaneMask = -1;
      },
    );
  }
}
