import type { AsArray } from './Hook';
export class SyncWaterfallHook<T, R> {
  private callbacks: ((...args: AsArray<T>) => R)[] = [];

  tap(options: string, fn: (...args: AsArray<T>) => R) {
    this.callbacks.push(fn);
  }

  call(...args: AsArray<T>): R {
    if (this.callbacks.length) {
      let result: R = this.callbacks[0](...args);
      for (let i = 0; i < this.callbacks.length - 1; i++) {
        const callback = this.callbacks[i];
        // @ts-ignore
        result = callback(result);
      }

      return result;
    }

    return null;
  }
}
