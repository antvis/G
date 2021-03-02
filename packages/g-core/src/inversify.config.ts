import 'reflect-metadata';
import { Container } from 'inversify';
// import getDecorators from 'inversify-inject-decorators';
import { containerModule } from '@antv/g-ecs';
import { systemModule } from './systems';

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md#defaultscope

export function createRootContainer() {
  const container = new Container();
  container.load(containerModule);
  container.load(systemModule);
  return container;
}

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#what-can-i-do-when-my-base-class-is-provided-by-a-third-party-module
// decorate(injectable(), EventEmitter);
// container.bind(IDENTIFIER.IEventEmitter).to(EventEmitter);
// 支持使用 new 而非容器实例化的场景，同时禁止 lazyInject cache
// @see https://github.com/inversify/inversify-inject-decorators#caching-vs-non-caching-behaviour
// const DECORATORS = getDecorators(container, false);

// const { lazyInject, lazyInjectNamed } = getDecorators(container, false);
// export { lazyInject, lazyInjectNamed };
