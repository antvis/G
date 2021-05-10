import { Entity } from '@antv/g-ecs';
import { ContainerModule } from 'inversify';
import { SyncHook, AsyncSeriesHook } from 'tapable';
import { CanvasContainerModule } from './Canvas';
import { container } from './inversify.config';
import { ShapeCfg } from './types';

export interface DisplayObjectPlugin {
  apply(): void;
}

/**
 * hooks for plugins
 */
export const DisplayObjectHooks = {
  /**
   * get called at the end of constructor
   */
  init: new SyncHook<[Entity, ShapeCfg]>(['entity', 'config']),
  /**
   * get called when attributes changed, eg. calling `attr/setAttribute()`
   */
  changeAttribute: new AsyncSeriesHook<[Entity, string, any]>(['entity', 'name', 'value']),
  // hit: new SyncHook<[Entity]>(['entity']),
  /**
   * get called when mounted into canvas first time
   */
  mounted: new AsyncSeriesHook<[string, any, Entity]>(['renderer', 'context', 'entity']),
  /**
   * get called every time renderred
   */
  render: new SyncHook<[string, any, Entity]>(['renderer', 'context', 'entity']),
  /**
   * get called when unmounted from canvas
   */
  unmounted: new AsyncSeriesHook<[string, any, Entity]>(['renderer', 'context', 'entity']),
  /**
   * get called when destroyed, eg. calling `destroy()`
   */
  destroy: new SyncHook<[Entity]>(['entity']),
};

export function registerDisplayObjectPlugin(pluginClazz: new () => DisplayObjectPlugin) {
  container.bind(pluginClazz).toSelf().inSingletonScope();
  container.get(pluginClazz).apply();
}

export function registerCanvasContainerModule(containerModule: ContainerModule, renderer: string) {
  container.bind(CanvasContainerModule).toConstantValue(containerModule).whenTargetNamed(renderer);
}
