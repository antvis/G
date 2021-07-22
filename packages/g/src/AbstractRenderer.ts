import { ContainerModule } from 'inversify';
import { RendererConfig } from './types';

export interface IRenderer {
  getConfig(): RendererConfig;

  /**
   * register plugin at runtime
   */
  registerPlugin(containerModule: ContainerModule): void;

  /**
   * return all registered plugins
   */
  getPlugins(): ContainerModule[];
}

export abstract class AbstractRenderer implements IRenderer {
  private plugins: ContainerModule[] = [];
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

  registerPlugin(containerModule: ContainerModule) {
    this.plugins.push(containerModule);
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
