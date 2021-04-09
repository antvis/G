import 'reflect-metadata';
import { ContainerModule, decorate, injectable, interfaces } from 'inversify';
import EventEmitter from 'eventemitter3';
import { ILifecycle, ObjectPool } from './ObjectPool';
import { Component, ComponentConstructor } from './Component';
import { IDENTIFIER } from './identifier';
import { EntityManager } from './EntityManager';
import { Entity } from './Entity';
import { World } from './World';
import { ComponentManager } from './ComponentManager';
import { System, SystemConstructor } from './System';
import { SystemManager, ISystemRegistry } from './SystemManager';
import { Matcher } from './Matcher';

// bind EventEmitter only once
let isEventEmitterBound = false;
const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  if (!isEventEmitterBound) {
    decorate(injectable(), EventEmitter);
    bind(IDENTIFIER.EventEmitter).to(EventEmitter);
    isEventEmitterBound = true;
  }

  bind<interfaces.Factory<void>>(IDENTIFIER.ComponentRegistry).toFactory<void>((context: interfaces.Context) => {
    return (clazz: ComponentConstructor<Component>) => {
      if (!context.container.isBound(clazz)) {
        context.container.bind(clazz).toSelf();
      }
    };
  });

  bind<ISystemRegistry>(IDENTIFIER.SystemRegistry).toDynamicValue((context: interfaces.Context) => {
    return {
      register: (clazz: SystemConstructor<System>) => {
        if (!context.container.isBoundTagged(System, clazz.tag, clazz)) {
          context.container.bind(System).to(clazz).inSingletonScope().whenTargetNamed(clazz.tag);
        }
      },
      get: (clazz: SystemConstructor<System>) => {
        return context.container.getNamed(System, clazz.tag);
      },
      has: (clazz: SystemConstructor<System>) => {
        return context.container.isBoundNamed(System, clazz.tag);
      },
    };
  });

  bind<interfaces.Factory<ObjectPool<Component>>>(IDENTIFIER.ComponentPoolFactory).toFactory<ObjectPool<Component>>(
    (context: interfaces.Context) => {
      const factoryRegistry: Record<string, ObjectPool<Component>> = {};
      return (clazz: ComponentConstructor<Component>) => {
        let componentPool = factoryRegistry[clazz.tag];
        if (!componentPool) {
          componentPool = context.container.get(ObjectPool);
          componentPool.init(() => {
            const isBound = context.container.isBound(clazz);
            if (!isBound) {
              throw new Error(`Component "${clazz.tag}" is not registered, please call registerComponent() first.`);
            }
            const component = context.container.get(clazz);
            return component;
          }, 10);
          factoryRegistry[clazz.tag] = componentPool;
        }
        return componentPool;
      };
    }
  );

  bind<interfaces.Factory<ObjectPool<Entity>>>(IDENTIFIER.EntityPoolFactory).toFactory<ObjectPool<Entity>>(
    (context: interfaces.Context) => {
      let entityPool: ObjectPool<Entity>;
      return () => {
        if (!entityPool) {
          entityPool = context.container.get(ObjectPool);
          entityPool.init(() => context.container.get(Entity), 10);
        }
        return entityPool;
      };
    }
  );

  bind<EntityManager>(EntityManager).toSelf().inSingletonScope();
  bind<ComponentManager>(ComponentManager).toSelf().inSingletonScope();
  bind<SystemManager>(SystemManager).toSelf().inSingletonScope();
  bind<Entity>(Entity).toSelf();
  bind<ObjectPool<ILifecycle>>(ObjectPool).toSelf();
  bind<World>(World).toSelf().inSingletonScope();
});

export * from './System';
export { Matcher, Entity, Component, World, EntityManager, containerModule };
