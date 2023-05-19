import type { AsArray } from './Hook';
export class SyncHook<T, R = void> {
  private callbacks: ((...args: AsArray<T>) => R)[] = [];

  tap(options: string, fn: (...args: AsArray<T>) => R) {
    this.callbacks.push(fn);
  }

  call(...args: AsArray<T>): void {
    this.callbacks.forEach((callback) => {
      callback(...args);
    });
  }
}
