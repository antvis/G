import type { Device } from '@antv/g-device-api';
import { RendererParameters, ToneMapping } from '../interfaces';
import { DynamicUniformBuffer } from './DynamicUniformBuffer';
import { RenderCache } from './RenderCache';
import { RenderGraph } from './RenderGraph';
import type { RenderInst } from './RenderInst';
import { RenderInstManager } from './RenderInstManager';

export class RenderHelper {
  renderCache: RenderCache;
  renderGraph: RenderGraph;
  renderInstManager: RenderInstManager;
  uniformBuffer: DynamicUniformBuffer;
  // debugThumbnails: DebugThumbnailDrawer;

  private device: Device;

  constructor(private parameters: RendererParameters) {}

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
    if (this.uniformBuffer) {
      this.uniformBuffer.destroy();
    }
    if (this.renderInstManager) {
      this.renderInstManager.destroy();
    }
    if (this.renderCache) {
      this.renderCache.destroy();
    }
    if (this.renderGraph) {
      this.renderGraph.destroy();
    }
  }

  // getDebugTextDrawer(): TextDrawer | null {
  //   return null;
  // }

  getCache(): RenderCache {
    return this.renderCache;
  }

  getDefines() {
    return {
      USE_TONEMAPPING:
        this.parameters?.toneMapping &&
        this.parameters?.toneMapping !== ToneMapping.NONE,
      toneMapping: this.parameters?.toneMapping,
    };
  }
}
