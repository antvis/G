import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DragDropEvent from '@antv/g-plugin-dragndrop';
import * as MobileInteraction from '@antv/g-plugin-mobile-interaction';
import { SVGPicker, SVGRenderer } from '@antv/g-svg';
import * as GesturePlugin from '@antv/g-plugin-gesture';
import { isNil } from '@antv/util';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { MobileInteraction, SVGRenderer, SVGPicker };

type MobileRenderConfig = Partial<
  RendererConfig & {
    isDocumentDraggable: boolean;
    isDocumentDroppable: boolean;
    dragstartDistanceThreshold: number;
    dragstartTimeThreshold: number;
  }
>;
export class Renderer extends AbstractRenderer {
  constructor(config?: MobileRenderConfig) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new SVGRenderer.Plugin());
    this.registerPlugin(new MobileInteraction.Plugin());
    this.registerPlugin(new SVGPicker.Plugin());
    this.registerPlugin(
      new DragDropEvent.Plugin({
        isDocumentDraggable: isNil(config?.isDocumentDraggable)
          ? true
          : config.isDocumentDraggable,
        isDocumentDroppable: isNil(config?.isDocumentDroppable)
          ? true
          : config.isDocumentDroppable,
        dragstartDistanceThreshold: isNil(config?.dragstartDistanceThreshold)
          ? 10
          : config.dragstartDistanceThreshold,
        dragstartTimeThreshold: isNil(config?.dragstartTimeThreshold)
          ? 50
          : config.dragstartTimeThreshold,
      }),
    );

    this.registerPlugin(
      new GesturePlugin.Plugin({
        isDocumentGestureEnabled: true,
      }),
    );
  }
}
