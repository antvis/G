import type { AsArray } from './Hook';

export class AsyncSeriesWaterfallHook<T, R> {
  private callbacks: ((...args: AsArray<T>) => Promise<R>)[] = [];

  tapPromise(options: string, fn: (...args: AsArray<T>) => Promise<R>) {
    this.callbacks.push(fn);
  }

  async promise(...args: AsArray<T>): Promise<R> {
    if (this.callbacks.length) {
      let result: R = await this.callbacks[0](...args);
      for (let i = 0; i < this.callbacks.length - 1; i++) {
        const callback = this.callbacks[i];
        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        result = await callback(result);
      }

      return result;
    }

    return null;
  }
}
