import { injectable } from 'inversify';
import { Device } from '../platform';
import { DynamicUniformBuffer } from './DynamicUniformBuffer';
import { RenderCache } from './RenderCache';
import { RenderGraph } from './RenderGraph';
import { RenderInst } from './RenderInst';
import { RenderInstManager } from './RenderInstManager';

@injectable()
export class RenderHelper {
  renderCache: RenderCache;
  renderGraph: RenderGraph;
  renderInstManager: RenderInstManager;
  uniformBuffer: DynamicUniformBuffer;
  // debugThumbnails: DebugThumbnailDrawer;

  private device: Device;

  getDevice(): Device {
    return this.device;
  }

  setDevice(device: Device) {
    this.device = device;

    this.renderCache = new RenderCache(device);
    this.renderGraph = new RenderGraph(this.device);
    this.renderInstManager = new RenderInstManager(this.renderCache);
    this.uniformBuffer = new DynamicUniformBuffer(this.device);
    // this.debugThumbnails = new DebugThumbnailDrawer(this);
  }

  pushTemplateRenderInst(): RenderInst {
    const template = this.renderInstManager.pushTemplateRenderInst();
    template.setUniformBuffer(this.uniformBuffer);
    return template;
  }

  prepareToRender(): void {
    this.uniformBuffer.prepareToRender();
  }

  destroy(): void {
    this.uniformBuffer.destroy();
    this.renderInstManager.destroy();
    this.renderCache.destroy();
    this.renderGraph.destroy();
  }

  // getDebugTextDrawer(): TextDrawer | null {
  //   return null;
  // }

  getCache(): RenderCache {
    return this.renderCache;
  }
}
