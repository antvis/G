import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as WebGPUDevice from '@antv/g-plugin-webgpu-device';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, DeviceRenderer, WebGPUDevice, HTMLRenderer };

type WebGPURendererConfig = RendererConfig;

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<WebGPURendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new WebGPUDevice.Plugin());
    this.registerPlugin(new DeviceRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
