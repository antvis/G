import type { AsArray } from './Hook';

export class SyncHook<T, R = void> {
  private callbacks: ((...args: AsArray<T>) => R)[] = [];

  tap(options: string, fn: (...args: AsArray<T>) => R) {
    this.callbacks.push(fn);
  }

  call(...args: AsArray<T>): void {
    /* eslint-disable-next-line prefer-rest-params */
    const argsArr = arguments;
    this.callbacks.forEach(function (callback) {
      /* eslint-disable-next-line prefer-spread */
      callback.apply(undefined, argsArr);
    });
  }
}
