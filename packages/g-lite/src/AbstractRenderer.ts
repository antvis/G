import type { Syringe } from '@alipay/mana-syringe';
import type { RendererConfig } from './types';

export interface RendererPlugin {
  name: string;
  container: Syringe.Container;
  init: () => void;
  destroy: () => void;
}

export abstract class AbstractRendererPlugin implements RendererPlugin {
  container: Syringe.Container;
  abstract name: string;
  abstract init(): void;
  abstract destroy(): void;
}

export interface IRenderer {
  getConfig: () => RendererConfig;

  /**
   * register plugin at runtime
   */
  registerPlugin: (plugin: RendererPlugin) => void;

  /**
   * unregister plugin at runtime
   */
  unregisterPlugin: (plugin: RendererPlugin) => void;

  /**
   * get plugin by name
   */
  getPlugin: (name: string) => RendererPlugin;

  /**
   * return all registered plugins
   */
  getPlugins: () => RendererPlugin[];
}

export class AbstractRenderer implements IRenderer {
  private plugins: RendererPlugin[] = [];
  private config: RendererConfig;

  constructor(config?: Partial<RendererConfig>) {
    this.config = {
      /**
       * only dirty object will cause re-render
       */
      enableDirtyCheck: true,
      enableCulling: false,
      /**
       * enable auto rendering by default
       */
      enableAutoRendering: true,
      /**
       * enable dirty rectangle rendering by default
       */
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
      ...config,
    };
  }

  registerPlugin(plugin: RendererPlugin) {
    this.plugins.push(plugin);
  }

  unregisterPlugin(plugin: RendererPlugin) {
    const index = this.plugins.findIndex((p) => p === plugin);
    if (index > -1) {
      this.plugins.splice(index, 1);
    }
  }

  getPlugins() {
    return this.plugins;
  }

  getPlugin(name: string) {
    return this.plugins.find((plugin) => plugin.name === name);
  }

  getConfig() {
    return this.config;
  }

  setConfig(config: Partial<RendererConfig>) {
    Object.assign(this.config, config);
  }
}
