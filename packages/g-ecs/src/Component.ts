import { transient } from 'mana-syringe';
import type { ILifecycle } from './ObjectPool';

let counter = 0;

@transient()
export class Component<C = {}> implements ILifecycle {
  // eslint-disable-next-line no-plusplus
  readonly pid = counter++;

  public getId() {
    return this.pid;
  }

  public copy(props: Partial<Omit<C, keyof Component>>): this {
    Object.assign(this, props);
    return this;
  }
  public clone(): Component<C> {
    return new Component().copy(this);
  }
  public reset() {
    //
  }
  public destroy() {
    //
  }
}

export interface ComponentConstructor<C extends Component> {
  readonly tag: string;
  new (props?: Partial<Omit<C, keyof Component>> | false): C;
}
