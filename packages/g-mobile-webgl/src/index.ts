import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DragDropEvent from '@antv/g-plugin-dragndrop';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import * as DomInteraction from '@antv/g-plugin-mobile-interaction';
import * as WebGLDevice from '@antv/g-plugin-webgl-device';
import { isNil } from '@antv/util';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, DeviceRenderer, WebGLDevice, HTMLRenderer };

interface WebGLRendererConfig extends RendererConfig {
  targets: ('webgl1' | 'webgl2')[];
}

type MobileWebglRenderConfig = Partial<
  WebGLRendererConfig & {
    isDocumentDraggable: boolean;
    isDocumentDroppable: boolean;
    dragstartDistanceThreshold: number;
    dragstartTimeThreshold: number;
  }
>;

export class Renderer extends AbstractRenderer {
  constructor(config?: MobileWebglRenderConfig) {
    super(config);

    const deviceRendererPlugin = new DeviceRenderer.Plugin();

    this.registerPlugin(new ContextRegisterPlugin(deviceRendererPlugin));
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(
      new WebGLDevice.Plugin(
        config?.targets
          ? {
              targets: config.targets,
            }
          : {
              targets: ['webgl2', 'webgl1'],
            },
      ),
    );
    this.registerPlugin(deviceRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
    this.registerPlugin(
      new DragDropEvent.Plugin({
        isDocumentDraggable: isNil(config?.isDocumentDraggable) ? true : config.isDocumentDraggable,
        isDocumentDroppable: isNil(config?.isDocumentDroppable) ? true : config.isDocumentDroppable,
        dragstartDistanceThreshold: isNil(config?.dragstartDistanceThreshold)
          ? 10
          : config.dragstartDistanceThreshold,
        dragstartTimeThreshold: isNil(config?.dragstartTimeThreshold)
          ? 50
          : config.dragstartTimeThreshold,
      }),
    );
  }
}
