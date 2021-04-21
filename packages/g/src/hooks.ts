import { Entity } from '@antv/g-ecs';
import { SyncHook, AsyncSeriesHook } from 'tapable';
import { container } from './inversify.config';
import { RENDERER } from './types';

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
  init: new SyncHook<[Entity]>(['entity']),
  /**
   * get called when attributes changed, eg. calling `attr/setAttribute()`
   */
  changeAttribute: new AsyncSeriesHook<[Entity, string, any]>(['entity', 'name', 'value']),
  // hit: new SyncHook<[Entity]>(['entity']),
  /**
   * get called when mounted into canvas first time
   */
  mounted: new AsyncSeriesHook<[RENDERER, any, Entity]>(['renderer', 'context', 'entity']),
  /**
   * get called every time renderred
   */
  render: new SyncHook<[RENDERER, any, Entity]>(['renderer', 'context', 'entity']),
  /**
   * get called when unmounted from canvas
   */
  unmounted: new AsyncSeriesHook<[RENDERER, any, Entity]>(['renderer', 'context', 'entity']),
  /**
   * get called when destroyed, eg. calling `destroy()`
   */
  destroy: new SyncHook<[Entity]>(['entity']),
};

export function registerDisplayObjectPlugin(pluginClazz: new () => DisplayObjectPlugin) {
  container.bind(pluginClazz).toSelf().inSingletonScope();
  container.get(pluginClazz).apply();
}
