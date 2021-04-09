import { injectable } from 'inversify';
import { ILifecycle } from './ObjectPool';

let counter = 0;

@injectable()
export class Component<C = {}> implements ILifecycle {
  readonly _id = counter++;

  public getId() {
    return this._id;
  }

  public copy(props: Partial<Omit<C, keyof Component>>): this {
    // @ts-ignore
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
