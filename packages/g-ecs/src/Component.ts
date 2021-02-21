// import { PropType } from './Types';

import { inject, injectable } from 'inversify';
import { ILifecycle } from './ObjectPool';

// export type ComponentSchemaProp = {
//   default?: any;
//   type: PropType<any, any>;
// };

// export type ComponentSchema = {
//   [propName: string]: ComponentSchemaProp;
// };

@injectable()
export class Component<C = {}> implements ILifecycle {
  // static schema: ComponentSchema;
  readonly tag: string;

  public copy(props: Partial<Omit<C, keyof Component>>): this {
    // @ts-ignore
    Object.assign(this, props);
    return this;
  }
  public clone(): Component<C> {
    return new Component().copy(this);
  }
  public reset() {}
  public dispose() {}
}

export interface ComponentConstructor<C extends Component> {
  // schema: ComponentSchema;
  readonly tag: string;
  // new (...args: unknown[]): C;
  new (props?: Partial<Omit<C, keyof Component>> | false): C;
}
