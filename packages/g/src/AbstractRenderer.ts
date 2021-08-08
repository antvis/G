import { Container } from 'inversify';
import { RendererConfig } from './types';

export interface RendererPlugin {
  init(container: Container): void;
  destroy(container: Container): void;
}

export interface IRenderer {
  getConfig(): RendererConfig;

  /**
   * register plugin at runtime
   */
  registerPlugin(plugin: RendererPlugin): void;

  /**
   * return all registered plugins
   */
  getPlugins(): RendererPlugin[];
}

export class AbstractRenderer implements IRenderer {
  private plugins: RendererPlugin[] = [];
  private config: RendererConfig;

  constructor(config?: Partial<RendererConfig>) {
    this.config = {
      /**
       * enable auto rendering by default
       */
      enableAutoRendering: true,
      /**
       * enable dirty rectangle rendering by default
       */
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
      enableTAA: false,
      ...config,
    };
  }

  registerPlugin(plugin: RendererPlugin) {
    this.plugins.push(plugin);
  }

  getPlugins() {
    return this.plugins;
  }

  getConfig() {
    return this.config;
  }

  setConfig(config: Partial<RendererConfig>) {
    Object.assign(this.config, config);
  }
}
