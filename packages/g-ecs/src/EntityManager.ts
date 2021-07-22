import { EventEmitter } from 'eventemitter3';
import { inject, injectable } from 'inversify';
import { IDENTIFIER } from './identifier';
import { Component, ComponentConstructor } from './Component';
import { Entity } from './Entity';
import { ObjectPool } from './ObjectPool';
import { Matcher } from './Matcher';

export const ENTITY_EVENT = {
  Created: 'Created',
};

export const COMPONENT_EVENT = {
  Added: 'Added',
  Remove: 'Remove',
};

@injectable()
export class EntityManager extends EventEmitter {
  @inject(IDENTIFIER.ComponentPoolFactory)
  private componentPoolFactory: <C extends Component<unknown>>(c: ComponentConstructor<C>) => ObjectPool<C>;

  private entities: Entity[] = [];
  private entitiesByNames: Record<string, Entity> = {};

  /**
   * use cache when query a matcher
   */
  private matcherCache: Record<string, Entity[]> = {};

  public getEntityByName(name: string) {
    return this.entitiesByNames[name];
  }

  public getAllEntities() {
    return this.entities;
  }

  public queryByMatcher<C extends Component>(matcher: Matcher<C>) {
    const hash = matcher.hash();
    if (!this.matcherCache[hash]) {
      this.matcherCache[hash] = this.entities.filter((entity) => matcher.matches(entity));
    }

    return this.matcherCache[hash];
  }

  public createEntity(entity: Entity) {
    const name = entity.getName();
    if (name) {
      if (this.entitiesByNames[name]) {
        throw new Error(`Entity name '${name}' already exist`);
      } else {
        this.entitiesByNames[name] = entity;
      }
    }

    this.entities.push(entity);

    this.emit(ENTITY_EVENT.Created, entity);
    return entity;
  }

  public destroyEntity(entity: Entity) {
    if (entity.getName()) {
      delete this.entitiesByNames[entity.getName()];
    }

    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }

    this.matcherCache = {};
  }

  public addComponentToEntity<C extends Component<unknown>>(
    entity: Entity,
    clazz: ComponentConstructor<C>,
    values?: Partial<Omit<C, keyof Component<unknown>>>
  ): C {
    const tag = clazz.tag;
    const components = entity.getComponents();
    let component = components[tag];
    if (component) {
      if (!entity.cast(component, clazz)) {
        throw new Error(
          `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
        );
      }
      delete components[tag];
    }

    component = this.componentPoolFactory<C>(clazz).acquire();

    if (values) {
      component.copy(values);
    }

    components[tag] = component;

    this.emit(COMPONENT_EVENT.Added, entity, component);

    this.matcherCache = {};

    return component as C;
  }

  public removeComponentFromEntity<C extends Component<unknown>>(
    entity: Entity,
    clazz: ComponentConstructor<C>,
    immediately = false
  ) {
    if (!entity.hasComponent(clazz)) {
      return;
    }

    this.emit(COMPONENT_EVENT.Remove, entity, clazz);

    if (immediately) {
      this.removeComponentFromEntitySync(entity, clazz);
    } else {
      //   if (entity._ComponentTypesToRemove.length === 0)
      //     this.entitiesWithComponentsToRemove.push(entity);
      //   entity._ComponentTypes.splice(index, 1);
      //   entity._ComponentTypesToRemove.push(Component);
      //   entity._componentsToRemove[Component._typeId] =
      //     entity._components[Component._typeId];
      //   delete entity._components[Component._typeId];
      // }
      // Check each indexed query to see if we need to remove it
      // this._queryManager.onEntityComponentRemoved(entity, Component);
      // if (Component.__proto__ === SystemStateComponent) {
      //   entity.numStateComponents--;
      //   // Check if the entity was a ghost waiting for the last system state component to be removed
      //   if (entity.numStateComponents === 0 && !entity.alive) {
      //     entity.remove();
      //   }
    }

    this.matcherCache = {};
  }

  public destroy() {
    this.entities = [];
    this.entitiesByNames = {};
  }

  private removeComponentFromEntitySync<C extends Component<unknown>>(entity: Entity, clazz: ComponentConstructor<C>) {
    // Remove T listing on entity and property ref, then free the component.
    // entity._ComponentTypes.splice(index, 1);
    const component = entity.getComponent(clazz);

    const components = entity.getComponents();
    delete components[clazz.tag];
    component.destroy();
    // this.world.componentsManager.componentRemovedFromEntity(Component);
  }
}
