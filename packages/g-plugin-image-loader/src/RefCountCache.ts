export class RefCountCache<CacheValue, CounterValue> {
  #cacheStore = new Map<
    string,
    { value: CacheValue; counter: Set<CounterValue> }
  >();

  has(key: string) {
    return this.#cacheStore.has(key);
  }

  put(key: string, item: CacheValue, ref: CounterValue) {
    if (this.#cacheStore.has(key)) {
      return false;
    }

    this.#cacheStore.set(key, {
      value: item,
      counter: new Set([ref]),
    });

    return true;
  }

  get(key: string, ref: CounterValue) {
    const cacheItem = this.#cacheStore.get(key);
    if (!cacheItem) {
      return null;
    }

    cacheItem.counter.add(ref);

    return cacheItem.value;
  }

  update(key: string, value: CacheValue, ref: CounterValue) {
    const cacheItem = this.#cacheStore.get(key);
    if (!cacheItem) {
      return false;
    }

    cacheItem.value = { ...cacheItem.value, ...value };
    cacheItem.counter.add(ref);

    return true;
  }

  release(key: string, ref: CounterValue) {
    const cacheItem = this.#cacheStore.get(key);
    if (!cacheItem) {
      return false;
    }

    cacheItem.counter.delete(ref);

    if (cacheItem.counter.size <= 0) {
      this.#cacheStore.delete(key);
    }

    return true;
  }

  releaseRef(ref: CounterValue) {
    this.#cacheStore.keys().forEach((key) => {
      this.release(key, ref);
    });
  }

  getSize() {
    return this.#cacheStore.size;
  }

  clear() {
    this.#cacheStore.clear();
  }
}
