import { inject, singleton } from 'mana-syringe';
import { IDENTIFIER } from './identifier';
import { Component, ComponentConstructor } from './Component';

@singleton()
export class ComponentManager {
  @inject(IDENTIFIER.ComponentRegistry)
  private registry: (clazz: ComponentConstructor<Component>) => void;

  public registerComponent<C extends Component>(clazz: ComponentConstructor<C>) {
    this.registry(clazz);
  }
}
