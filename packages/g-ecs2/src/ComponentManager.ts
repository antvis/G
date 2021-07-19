import { EMPTY, Entity } from './Entity';

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (args: unknown) => void ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type ComponentClassType<P> = new (
  data: Partial<NonFunctionProperties<P>>,
) => Component<P> & P;

export abstract class Component<P> {
  constructor(data?: Partial<NonFunctionProperties<P>>) {
    //
  }
}

/**
 * 管理某一类 Component，尽可能做到 AoS 而非 SoA
 * @see https://wickedengine.net/2019/09/29/entity-component-system/
 * @see https://github.com/turanszkij/WickedEngine/blob/master/WickedEngine/wiECS.h
 */
// tslint:disable-next-line:max-classes-per-file
export class ComponentManager<P> {
  private clazz: ComponentClassType<P>;
  private components: Array<Component<P> & P> = [];
  private entities: Entity[] = [];

  /**
   * 不在 Entity 中维护拥有的 Component 列表，反之亦然
   */
  private lookup: Record<Entity, number> = {};

  constructor(clazz: ComponentClassType<P>) {
    this.clazz = clazz;
  }

  clear() {
    this.components = [];
    this.entities = [];
    this.lookup = {};
  }

  contains(entity: Entity) {
    return this.lookup[entity] > -1;
  }

  create(entity: Entity, data?: Partial<NonFunctionProperties<P>>) {
    this.lookup[entity] = this.components.length;
    const component = new this.clazz(data || {});
    this.components.push(component);
    this.entities.push(entity);
    return component;
  }

  remove(entity: Entity) {
    const componentIndex = this.lookup[entity];
    if (componentIndex > -1) {
      if (componentIndex < this.components.length - 1) {
        // 将待删除元素和最后一个元素交换
        // C++ 中有 std::move 这样的操作，避免数据的拷贝
        // @see https://github.com/turanszkij/WickedEngine/blob/master/WickedEngine/wiECS.h#L169
        this.components[componentIndex] = this.components[
          this.components.length - 1
        ];
        this.entities[componentIndex] = this.entities[this.entities.length - 1];
        this.lookup[this.entities[componentIndex]] = componentIndex;
      }
    }

    // 待删除元素已经移动到了最后一个
    this.components.pop();
    this.entities.pop();
    delete this.lookup[entity];
  }

  removeKeepSorted(entity: Entity) {
    const componentIndex = this.lookup[entity];
    if (componentIndex > -1) {
      const entity2 = this.entities[componentIndex];

      if (componentIndex < this.components.length - 1) {
        // Move every component left by one that is after this element:
        for (let i = componentIndex + 1; i < this.components.length; ++i) {
          this.components[i - 1] = this.components[i];
        }
        // Move every entity left by one that is after this element and update lut:
        for (let i = componentIndex + 1; i < this.entities.length; ++i) {
          this.entities[i - 1] = this.entities[i];
          this.lookup[this.entities[i - 1]] = i - 1;
        }
      }

      this.components.pop();
      this.entities.pop();
      delete this.lookup[entity2];
    }
  }

  moveItem(srcIndex: number, destIndex: number) {
    if (srcIndex === destIndex) {
      return;
    }

    // Save the moved component and entity:
    const srcComponent = this.components[srcIndex];
    const srcEntity = this.entities[srcIndex];

    // Every other entity-component that's in the way gets moved by one and lut is kept updated:
    const direction = srcIndex < destIndex ? 1 : -1;
    for (let i = srcIndex; i !== destIndex; i += direction) {
      const next = i + direction;
      this.components[i] = this.components[next];
      this.entities[i] = this.entities[next];
      this.lookup[this.entities[i]] = i;
    }

    // Saved entity-component moved to the required position:
    this.components[destIndex] = srcComponent;
    this.entities[destIndex] = srcEntity;
    this.lookup[srcEntity] = destIndex;
  }

  getEntity(index: number) {
    return this.entities[index];
  }

  /**
   * 由于缺少类似 C++ 的重载操作符，没法通过 [下标] 直接访问。因此只能增加该方法用于遍历。
   */
  getComponent(index: number) {
    return this.components[index];
  }

  getComponentByEntity(entity: Entity) {
    const componentIndex = this.lookup[entity];
    if (componentIndex > -1) {
      return this.components[componentIndex];
    }
    return null;
  }

  getCount() {
    return this.components.length;
  }

  getEntityByComponentIndex(componentIdx: number) {
    for (const entity of Object.keys(this.lookup)) {
      const entityInNum = Number(entity);
      if (this.lookup[entityInNum] === componentIdx) {
        return entityInNum;
      }
    }
    return EMPTY;
  }

  find(callback: (component: Component<P> & P, i: number) => boolean) {
    for (let i = 0; i < this.getCount(); i++) {
      const component = this.getComponent(i);
      if (callback(component, i)) {
        return component;
      }
    }
    return null;
  }

  findIndex(
    callback: (component: Component<P> & P, i: number) => boolean,
  ) {
    for (let i = 0; i < this.getCount(); i++) {
      const component = this.getComponent(i);
      if (callback(component, i)) {
        return i;
      }
    }
    return -1;
  }

  forEach(
    callback: (entity: Entity, component: Component<P> & P) => void,
  ) {
    for (const entity of Object.keys(this.lookup)) {
      const entityInNum = Number(entity);
      const componentIndex = this.lookup[entityInNum];
      callback(entityInNum, this.getComponent(componentIndex));
    }
  }

  // async forEachAsync(
  //   callback: (entity: Entity, component: Component<P> & P) => Promise<void>,
  // ) {
  //   for (const entity of Object.keys(this.lookup)) {
  //     const entityInNum = Number(entity);
  //     const componentIndex = this.lookup[entityInNum];
  //     await callback(entityInNum, this.getComponent(componentIndex));
  //   }
  // }

  map(callback: (entity: Entity, component: Component<P> & P) => void) {
    const result = [];
    for (const entity of Object.keys(this.lookup)) {
      const entityInNum = Number(entity);
      const componentIndex = this.lookup[entityInNum];
      result.push(callback(entityInNum, this.getComponent(componentIndex)));
    }
    return result;
  }
}
