/* eslint-disable max-classes-per-file */
import type { CanvasContext } from './dom';
import { GlobalRuntime } from './global-runtime';
import type { RenderingPlugin } from './services';
import { ClipSpaceNearZ, RendererConfig } from './types';

export interface RendererPlugin {
  name: string;
  context: CanvasContext;
  init: (runtime: GlobalRuntime) => void;
  destroy: (runtime: GlobalRuntime) => void;
}

export abstract class AbstractRendererPlugin<T = any>
  implements RendererPlugin
{
  context: CanvasContext & T;
  protected plugins = [];

  protected addRenderingPlugin(plugin: RenderingPlugin) {
    this.plugins.push(plugin);
    this.context.renderingPlugins.push(plugin);
  }

  protected removeAllRenderingPlugins() {
    this.plugins.forEach((plugin) => {
      const index = this.context.renderingPlugins.indexOf(plugin);
      if (index >= 0) {
        this.context.renderingPlugins.splice(index, 1);
      }
    });
  }

  abstract name: string;
  abstract init(runtime: GlobalRuntime): void;
  abstract destroy(runtime: GlobalRuntime): void;
}

export interface IRenderer {
  /**
   * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
   * which matches WebGPU/Vulkan/DirectX/Metal's clip volume, while [-1, 1] matches WebGL/OpenGL's clip volume.
   */
  clipSpaceNearZ: ClipSpaceNearZ;

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
  clipSpaceNearZ = ClipSpaceNearZ.NEGATIVE_ONE;
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
      enableSizeAttenuation: true,
      enableRenderingOptimization: false,
      ...config,
    };
  }

  registerPlugin(plugin: RendererPlugin) {
    const index = this.plugins.findIndex((p) => p === plugin);
    if (index === -1) {
      this.plugins.push(plugin);
    }
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
