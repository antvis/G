import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as CanvasPathGenerator from '@antv/g-plugin-canvas-path-generator';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as DragDropEvent from '@antv/g-plugin-dragndrop';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import * as MobileInteraction from '@antv/g-plugin-mobile-interaction';
import * as GesturePlugin from '@antv/g-plugin-gesture';

import { isNil } from '@antv/util';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { CanvasRenderer, CanvasPicker };

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

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin());
    this.registerPlugin(new MobileInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());

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
