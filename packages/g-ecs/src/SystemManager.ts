import { inject, injectable } from 'inversify';
import { Entity } from './Entity';
import { COMPONENT_EVENT, EntityManager, ENTITY_EVENT } from './EntityManager';
import { IDENTIFIER } from './identifier';
import { ISystem, System, SystemConstructor } from './System';

export interface ISystemRegistry {
  register(clazz: SystemConstructor<System>): void;
  get(clazz: SystemConstructor<System>): ISystem;
}

@injectable()
export class SystemManager {
  @inject(IDENTIFIER.SystemRegistry)
  private registry: ISystemRegistry;

  @inject(EntityManager)
  private entityManager: EntityManager;

  private systems: ISystem[] = [];

  public registerSystem<S extends System>(clazz: SystemConstructor<S>) {
    this.registry.register(clazz);
    const system = this.registry.get(clazz);

    if (system.initialize) {
      // TODO: support async init @see https://github.com/ecsyjs/ecsy/issues/20
      system.initialize();
    } else {
      system.initialized = true;
    }

    this.entityManager.on(COMPONENT_EVENT.Added, (entity: Entity) => {
      if (system.onEntityAdded && system.trigger && system.trigger().matches(entity)) {
        system.onEntityAdded(entity);
      }
    });

    this.entityManager.on(COMPONENT_EVENT.Remove, (entity: Entity) => {
      if (system.onEntityRemoved && system.trigger && system.trigger().matches(entity)) {
        system.onEntityRemoved(entity);
      }
    });

    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  public execute(delta: number, time?: number) {
    this.systems.forEach((system) => {
      if (system.initialized && system.execute) {
        const entities = system.trigger
          ? this.entityManager.queryByMatcher(system.trigger())
          : this.entityManager.getAllEntities();
        system.execute(entities);
      }
    });
  }

  public destroy() {
    this.systems.forEach((system) => {
      if (system.initialized && system.tearDown) {
        system.tearDown();
      }
    });
  }
}
