// @ts-nocheck

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// type FixedSizeArray<T extends number, U> = T extends 0
//   ? void[]
//   : readonly U[] & {
//       0: U;
//       length: T;
//     };
type Measure<T extends number> = T extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  ? T
  : never;
type Append<T extends any[], U> = {
  0: [U];
  1: [T[0], U];
  2: [T[0], T[1], U];
  3: [T[0], T[1], T[2], U];
  4: [T[0], T[1], T[2], T[3], U];
  5: [T[0], T[1], T[2], T[3], T[4], U];
  6: [T[0], T[1], T[2], T[3], T[4], T[5], U];
  7: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], U];
  8: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], U];
}[Measure<T['length']>];
export type AsArray<T> = T extends any[] ? T : [T];

export declare class UnsetAdditionalOptions {
  _UnsetAdditionalOptions: true;
}

type IfSet<X> = X extends UnsetAdditionalOptions ? Record<string, unknown> : X;

type Callback<E, T> = (error: E | null, result?: T) => void;
type InnerCallback<E, T> = (error?: E | null | false, result?: T) => void;

type FullTap = Tap & {
  type: 'sync' | 'async' | 'promise';
  fn: () => any;
};

type Tap = TapOptions & {
  name: string;
};

type TapOptions = {
  before?: string;
  stage?: number;
};

// interface HookInterceptor<T, R, AdditionalOptions = UnsetAdditionalOptions> {
//   name?: string;
//   tap?: (tap: FullTap & IfSet<AdditionalOptions>) => void;
//   call?: (...args: any[]) => void;
//   loop?: (...args: any[]) => void;
//   error?: (err: Error) => void;
//   result?: (result: R) => void;
//   done?: () => void;
//   register?: (tap: FullTap & IfSet<AdditionalOptions>) => FullTap & IfSet<AdditionalOptions>;
// }

// type ArgumentNames<T extends any[]> = FixedSizeArray<T['length'], string>;

// export declare class AsyncHook<T, R, AdditionalOptions = UnsetAdditionalOptions> extends Hook<
//   T,
//   R,
//   AdditionalOptions
// > {
//   tapAsync(
//     options: string | (Tap & IfSet<AdditionalOptions>),
//     fn: (...args: Append<AsArray<T>, InnerCallback<Error, R>>) => void,
//   ): void;
//   tapPromise(
//     options: string | (Tap & IfSet<AdditionalOptions>),
//     fn: (...args: AsArray<T>) => Promise<R>,
//   ): void;
// }

const CALL_DELEGATE = function (...args) {
  this.call = this._createCall('sync');
  return this.call(...args);
};
const CALL_ASYNC_DELEGATE = function (...args) {
  this.callAsync = this._createCall('async');
  return this.callAsync(...args);
};
const PROMISE_DELEGATE = function (...args) {
  this.promise = this._createCall('promise');
  return this.promise(...args);
};

export class Hook<T, R, AdditionalOptions = UnsetAdditionalOptions> {
  name: string | undefined;
  taps: FullTap[];
  callAsync(...args: Append<AsArray<T>, Callback<Error, R>>): void;
  promise: (...args: AsArray<T>) => Promise<R>;
  call(...args: AsArray<T>): R;

  private _promise: (...args: AsArray<T>) => Promise<R>;

  constructor(args = [], name = undefined) {
    this._args = args;
    this.name = name;
    this.taps = [];
    this.interceptors = [];
    this._call = CALL_DELEGATE;
    this.call = CALL_DELEGATE;
    this._callAsync = CALL_ASYNC_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this._promise = PROMISE_DELEGATE;
    this.promise = PROMISE_DELEGATE;
    this._x = undefined;

    // this.compile = this.compile;
    // this.tap = this.tap;
    // this.tapAsync = this.tapAsync;
    // this.tapPromise = this.tapPromise;
  }

  compile(options) {
    throw new Error('Abstract: should be overridden');
  }

  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type,
    });
  }

  _tap(
    type: string,
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => R,
  ) {
    if (typeof options === 'string') {
      options = {
        name: options.trim(),
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }
    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }
    // if (typeof options.context !== "undefined") {
    // 	deprecateContext();
    // }
    options = Object.assign({ type, fn }, options);
    options = this._runRegisterInterceptors(options);
    this._insert(options);
  }

  tap(
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => R,
  ) {
    this._tap('sync', options, fn);
  }

  tapAsync(
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: Append<AsArray<T>, InnerCallback<Error, R>>) => void,
  ): void;
  tapAsync(
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => R,
  ) {
    this._tap('async', options, fn);
  }

  tapPromise(
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => Promise<R>,
  ): void;
  tapPromise(
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => R,
  ) {
    this._tap('promise', options, fn);
  }

  _runRegisterInterceptors(options) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        const newOptions = interceptor.register(options);
        if (newOptions !== undefined) {
          options = newOptions;
        }
      }
    }
    return options;
  }

  withOptions(
    options: TapOptions & IfSet<AdditionalOptions>,
  ): Omit<this, 'call' | 'callAsync' | 'promise'> {
    const mergeOptions = (opt) =>
      Object.assign({}, options, typeof opt === 'string' ? { name: opt } : opt);

    return {
      name: this.name,
      tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
      tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
      tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
      // intercept: (interceptor) => this.intercept(interceptor),
      isUsed: () => this.isUsed(),
      withOptions: (opt) => this.withOptions(mergeOptions(opt)),
    };
  }

  isUsed() {
    return this.taps.length > 0 || this.interceptors.length > 0;
  }

  // intercept(interceptor: HookInterceptor<T, R, AdditionalOptions>) {
  //   this._resetCompilation();
  //   this.interceptors.push(Object.assign({}, interceptor));
  //   if (interceptor.register) {
  //     for (let i = 0; i < this.taps.length; i++) {
  //       this.taps[i] = interceptor.register(this.taps[i]);
  //     }
  //   }
  // }

  _resetCompilation() {
    this.call = this._call;
    this.callAsync = this._callAsync;
    this.promise = this._promise;
  }

  _insert(item) {
    this._resetCompilation();
    let before;
    if (typeof item.before === 'string') {
      before = new Set([item.before]);
    } else if (Array.isArray(item.before)) {
      before = new Set(item.before);
    }
    let stage = 0;
    if (typeof item.stage === 'number') {
      stage = item.stage;
    }
    let i = this.taps.length;
    while (i > 0) {
      i--;
      const x = this.taps[i];
      this.taps[i + 1] = x;
      const xStage = x.stage || 0;
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name);
          continue;
        }
        if (before.size > 0) {
          continue;
        }
      }
      if (xStage > stage) {
        continue;
      }
      i++;
      break;
    }
    this.taps[i] = item;
  }
}

// Object.setPrototypeOf(Hook.prototype, null);
