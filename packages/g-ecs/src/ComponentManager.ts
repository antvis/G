import { inject, injectable } from 'inversify';
import { IDENTIFIER } from './identifier';
import { Component, ComponentConstructor } from './Component';

@injectable()
export class ComponentManager {
  @inject(IDENTIFIER.ComponentRegistry)
  private registry: (clazz: ComponentConstructor<Component>) => void;

  public registerComponent<C extends Component>(clazz: ComponentConstructor<C>) {
    this.registry(clazz);
  }
}
