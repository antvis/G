/**
 * Root Container
 * @see /dev-docs/IoC 容器、依赖注入与服务说明.md
 */
import 'reflect-metadata';

// import { EventEmitter } from 'eventemitter3';
import { Container } from 'inversify';
import { containerModule } from '@antv/g-ecs';

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md#defaultscope
export const container = new Container();

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#what-can-i-do-when-my-base-class-is-provided-by-a-third-party-module
// decorate(injectable(), EventEmitter);
// container.bind(EventEmitter).to(EventEmitter);

container.load(containerModule);
