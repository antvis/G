import { AbstractRenderer, ClipSpaceNearZ, RendererConfig } from '@antv/g-lite';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import * as WebGPUDevice from '@antv/g-plugin-webgpu-device';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, DeviceRenderer, WebGPUDevice, HTMLRenderer };

interface WebGPURendererConfig extends RendererConfig {
  shaderCompilerPath: string;
  onContextLost: () => void;
}

export class Renderer extends AbstractRenderer {
  clipSpaceNearZ = ClipSpaceNearZ.ZERO;

  constructor(config?: Partial<WebGPURendererConfig>) {
    super(config);

    const deviceRendererPlugin = new DeviceRenderer.Plugin();
    this.registerPlugin(new ContextRegisterPlugin(deviceRendererPlugin));
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(
      new WebGPUDevice.Plugin({
        shaderCompilerPath: config?.shaderCompilerPath,
        onContextLost: config?.onContextLost,
      }),
    );
    this.registerPlugin(deviceRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
