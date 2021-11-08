import 'reflect-metadata';
import { Module, injectable, decorate } from 'mana-syringe';
import { EventEmitter } from 'eventemitter3';
import { ObjectPool } from './ObjectPool';
import { Component, ComponentConstructor } from './Component';
import { IDENTIFIER } from './identifier';
import { EntityManager } from './EntityManager';
import { Entity } from './Entity';
import { World } from './World';
import { ComponentManager } from './ComponentManager';
import { System, SystemConstructor } from './System';
import { SystemManager } from './SystemManager';
import { Matcher } from './Matcher';

const containerModule = Module((register) => {
  decorate(injectable(), EventEmitter);

  register({
    token: IDENTIFIER.ComponentRegistry,
    useFactory: (context) => {
      return (clazz: ComponentConstructor<Component>) => {
        // if (!context.container.isBound(clazz)) {
        context.container.register(clazz);
        // }
      };
    },
  });

  register({
    token: IDENTIFIER.SystemRegistry,
    useDynamic: (context) => {
      return {
        register: (clazz: SystemConstructor<System>) => {
          context.container.register(clazz);
        },
        get: (clazz: SystemConstructor<System>) => {
          return context.container.get(clazz);
        },
        has: (clazz: SystemConstructor<System>) => {
          return context.container.isBound(clazz);
        },
      };
    },
  });

  register({
    token: IDENTIFIER.ComponentPoolFactory,
    useFactory: (context) => {
      const factoryRegistry: Record<string, ObjectPool<Component>> = {};
      return (clazz: ComponentConstructor<Component>) => {
        let componentPool = factoryRegistry[clazz.tag];
        if (!componentPool) {
          componentPool = context.container.get(ObjectPool);
          componentPool.init(() => {
            const isBound = context.container.isBound(clazz);
            if (!isBound) {
              throw new Error(
                `Component "${clazz.tag}" is not registered, please call registerComponent() first.`,
              );
            }
            const component = context.container.get(clazz);
            return component;
          }, 10);
          factoryRegistry[clazz.tag] = componentPool;
        }
        return componentPool;
      };
    },
  });

  register({
    token: IDENTIFIER.EntityPoolFactory,
    useFactory: (context) => {
      let entityPool: ObjectPool<Entity>;
      return () => {
        if (!entityPool) {
          entityPool = context.container.get(ObjectPool);
          entityPool.init(() => context.container.get(Entity), 10);
        }
        return entityPool;
      };
    },
  });

  register(EntityManager);
  register(ComponentManager);
  register(SystemManager);

  register(Entity);
  register(ObjectPool);
  register(World);
});

export * from './System';
export { Matcher, Entity, Component, World, EntityManager, containerModule };
