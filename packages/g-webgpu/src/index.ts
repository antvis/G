import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import * as WebGPUDevice from '@antv/g-plugin-webgpu-device';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, DeviceRenderer, WebGPUDevice, HTMLRenderer };

type WebGPURendererConfig = RendererConfig;

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<WebGPURendererConfig>) {
    super(config);

    const deviceRendererPlugin = new DeviceRenderer.Plugin();
    this.registerPlugin(new ContextRegisterPlugin(deviceRendererPlugin));
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new WebGPUDevice.Plugin());
    this.registerPlugin(deviceRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
