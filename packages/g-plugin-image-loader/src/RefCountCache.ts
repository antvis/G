import { DisplayObject } from '@antv/g-lite';

export class RefCountCache<CacheValue> {
  private cacheStore = new Map<
    string,
    { value: CacheValue; counter: Set<number> }
  >();

  onRefAdded(ref: DisplayObject) {}

  has(key: string) {
    return this.cacheStore.has(key);
  }

  put(key: string, item: CacheValue, ref: DisplayObject) {
    if (this.cacheStore.has(key)) {
      return false;
    }

    this.cacheStore.set(key, {
      value: item,
      counter: new Set([ref.entity]),
    });
    this.onRefAdded(ref);

    return true;
  }

  get(key: string, ref: DisplayObject) {
    const cacheItem = this.cacheStore.get(key);
    if (!cacheItem) {
      return null;
    }

    if (!cacheItem.counter.has(ref.entity)) {
      cacheItem.counter.add(ref.entity);
      this.onRefAdded(ref);
    }

    return cacheItem.value;
  }

  update(key: string, value: CacheValue, ref: DisplayObject) {
    const cacheItem = this.cacheStore.get(key);
    if (!cacheItem) {
      return false;
    }

    cacheItem.value = { ...cacheItem.value, ...value };
    if (!cacheItem.counter.has(ref.entity)) {
      cacheItem.counter.add(ref.entity);
      this.onRefAdded(ref);
    }

    return true;
  }

  release(key: string, ref: DisplayObject) {
    const cacheItem = this.cacheStore.get(key);
    if (!cacheItem) {
      return false;
    }

    cacheItem.counter.delete(ref.entity);

    if (cacheItem.counter.size <= 0) {
      this.cacheStore.delete(key);
    }

    return true;
  }

  releaseRef(ref: DisplayObject) {
    Array.from(this.cacheStore.keys()).forEach((key) => {
      this.release(key, ref);
    });
  }

  getSize() {
    return this.cacheStore.size;
  }

  clear() {
    this.cacheStore.clear();
  }
}
