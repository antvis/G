/**
 * A classic LRU (Least Recently Used) cache implementation.
 * It evicts the least recently used item when the cache is full.
 *
 * It uses a Map for O(1) key-based access
 * to maintain the usage order of items.
 *
 * 通过利用 JavaScript 内置 Map 的特性（按插入顺序迭代），我们不再需要手动维护一个双向链表
 */
export default class LRU<T> {
  private readonly capacity: number;
  private cache: Map<string | number, T>;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('LRU capacity must be a positive number.');
    }
    this.capacity = capacity;
    // Using a Map directly simplifies the implementation significantly.
    // A Map in modern JS engines iterates in insertion order, which is exactly what we need.
    this.cache = new Map<string | number, T>();
  }

  /**
   * Retrieves an item from the cache. Marks the item as recently used.
   * @param key The key of the item to retrieve.
   * @returns The value of the item, or undefined if not found.
   */
  public get(key: string | number): T | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Get the value.
    const value = this.cache.get(key);

    // Mark as recently used by deleting and re-setting the key.
    // This moves the key to the end of the Map's internal order.
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Adds or updates an item in the cache. Marks the item as recently used.
   * If the cache is full, it removes the least recently used item.
   * @param key The key of the item.
   * @param value The value of the item.
   */
  public put(key: string | number, value: T): void {
    // If the key already exists, delete it first to ensure it's moved to the end.
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add the new item. It will be the most recently used.
    this.cache.set(key, value);

    // Check if the cache has exceeded its capacity.
    if (this.cache.size > this.capacity) {
      // Evict the least recently used item, which is the first one in the Map's iteration order.
      const leastRecentlyUsedKey = this.cache.keys().next().value;
      this.cache.delete(leastRecentlyUsedKey);
    }
  }

  /**
   * Returns the current number of items in the cache.
   */
  public len(): number {
    return this.cache.size;
  }

  /**
   * Clears all items from the cache.
   */
  public clear(): void {
    this.cache.clear();
  }
}
