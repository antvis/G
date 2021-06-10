import { inject, injectable } from 'inversify';
import { Component, ComponentConstructor } from './Component';
import { ComponentManager } from './ComponentManager';
import { Entity } from './Entity';
import { EntityManager } from './EntityManager';
import { IDENTIFIER } from './identifier';
import { ObjectPool } from './ObjectPool';
import { System, SystemConstructor } from './System';
import { SystemManager } from './SystemManager';

interface IWorldLifecycle {
  execute(): void;
  stop(): void;
  resume(): void;
}

/**
 * the context of ECS
 * @see https://github.com/sschmid/Entitas-CSharp/blob/master/Entitas/Entitas/Context/IContext.cs
 * @example
 * ```
 * // register components
 * world
    .registerComponent(C1)
    .registerComponent(C2)
    .registerComponent(C3);
  
  // register systems
 * ```
 */
@injectable()
export class World implements IWorldLifecycle {
  @inject(IDENTIFIER.EntityPoolFactory)
  private entityPoolFactory: () => ObjectPool<Entity>;

  @inject(EntityManager)
  private entityManager: EntityManager;

  @inject(ComponentManager)
  private componentManager: ComponentManager;

  @inject(SystemManager)
  private systemManager: SystemManager;

  private lastMillis = new Date().getTime();

  private enabled = true;

  public createEntity(name: string = '') {
    const entity = this.entityPoolFactory().acquire();
    entity.setName(name);
    return this.entityManager.createEntity(entity);
  }

  public getEntityByName(name: string) {
    return this.entityManager.getEntityByName(name);
  }

  public registerComponent<C extends Component>(clazz: ComponentConstructor<C>) {
    this.componentManager.registerComponent(clazz);
    return this;
  }

  public registerSystem<S extends System>(clazz: SystemConstructor<S>) {
    this.systemManager.registerSystem(clazz);
    return this;
  }

  public execute(delta?: number, millis?: number): void {
    if (!delta) {
      millis = new Date().getTime();
      delta = millis - this.lastMillis;
      this.lastMillis = millis;
    }

    if (this.enabled) {
      this.systemManager.execute(delta, millis);
    }
  }

  public stop() {
    this.enabled = false;
  }

  public resume() {
    this.enabled = true;
  }

  public destroy() {
    this.systemManager.destroy();
    this.entityManager.destroy();
    // this.componentManager.destroy();
  }
}
