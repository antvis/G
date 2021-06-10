import { injectable } from 'inversify';

export interface ILifecycle {
  getId(): number;
  reset(): void;
  destroy(): void;
}

@injectable()
export class ObjectPool<T extends ILifecycle> {
  private count = 0;
  private freeList: T[] = [];
  protected objectFactory: () => T;

  public init(T: () => T, initialSize?: number) {
    this.objectFactory = T;

    if (typeof initialSize !== 'undefined') {
      this.expand(initialSize);
    }
  }

  public acquire(): T {
    if (this.freeList.length <= 0) {
      this.expand(Math.round(this.count * 0.2) + 1);
    }
    return this.freeList.pop() as T;
  }

  public release(item: T) {
    item.reset();
    this.freeList.push(item);
  }

  private expand(count: number) {
    for (let n = 0; n < count; n++) {
      const clone = this.objectFactory();
      this.freeList.push(clone);
    }
    this.count += count;
  }
}
