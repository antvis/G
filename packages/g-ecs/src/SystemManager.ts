import { inject, injectable } from 'inversify';
import { Entity } from './Entity';
import { COMPONENT_EVENT, EntityManager } from './EntityManager';
import { IDENTIFIER } from './identifier';
import { System, SystemConstructor } from './System';

export interface ISystemRegistry {
  register(clazz: SystemConstructor<System>): void;
  get(clazz: SystemConstructor<System>): System;
  has(clazz: SystemConstructor<System>): boolean;
}

@injectable()
export class SystemManager {
  @inject(IDENTIFIER.SystemRegistry)
  private registry: ISystemRegistry;

  @inject(EntityManager)
  private entityManager: EntityManager;

  private systems: System[] = [];

  public registerSystem<S extends System>(clazz: SystemConstructor<S>) {
    if (!this.registry.has(clazz)) {
      this.registry.register(clazz);
      const system = this.registry.get(clazz);
      const systemCtor = system.constructor as SystemConstructor<S>;

      if (system.initialize) {
        // TODO: support async init @see https://github.com/ecsyjs/ecsy/issues/20
        system.initialize();
      } else {
        system.initialized = true;
      }

      this.entityManager.on(COMPONENT_EVENT.Added, (entity: Entity) => {
        if (system.onEntityAdded && systemCtor.trigger && systemCtor.trigger.matches(entity)) {
          system.onEntityAdded(entity);
        }
      });

      this.entityManager.on(COMPONENT_EVENT.Remove, (entity: Entity) => {
        if (system.onEntityRemoved && systemCtor.trigger && systemCtor.trigger.matches(entity)) {
          system.onEntityRemoved(entity);
        }
      });

      this.systems.push(system);
      this.systems.sort(
        (a, b) =>
          ((a.constructor as SystemConstructor<S>).priority || 0) -
          ((b.constructor as SystemConstructor<S>).priority || 0),
      );
    }
  }

  public execute(delta?: number, millis?: number) {
    for (const system of this.systems) {
      if (system.initialized && system.execute) {
        // const t1 = performance.now();
        system.execute(this.getEntities(system), delta, millis);
        // console.log((system.constructor as SystemConstructor<System>).tag, performance.now() - t1);
      }
    }
  }

  public destroy() {
    this.systems.forEach((system) => {
      if (system.initialized && system.tearDown) {
        system.tearDown(this.getEntities(system));
      }
    });
  }

  private getEntities<S extends System>(system: System) {
    const systemCtor = system.constructor as SystemConstructor<S>;
    return systemCtor.trigger
      ? this.entityManager.queryByMatcher(systemCtor.trigger)
      : this.entityManager.getAllEntities();
  }
}
