// @ts-nocheck
import type { UnsetAdditionalOptions } from './Hook';
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';

class SyncHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onDone,
      rethrowIfPossible,
    });
  }
}

const factory = new SyncHookCodeFactory();

const TAP_ASYNC = () => {
  throw new Error('tapAsync is not supported on a SyncHook');
};

const TAP_PROMISE = () => {
  throw new Error('tapPromise is not supported on a SyncHook');
};

const COMPILE = function (options) {
  factory.setup(this, options);
  return factory.create(options);
};

export class SyncHook<T, R = void, AdditionalOptions = UnsetAdditionalOptions> extends Hook<
  T,
  R,
  AdditionalOptions
> {
  constructor(args = [], name = undefined) {
    super(args, name);
    this.tapAsync = TAP_ASYNC;
    this.tapPromise = TAP_PROMISE;
    this.compile = COMPILE;
  }
}

// export function SyncHook(args = [], name = undefined) {
//   const hook = new Hook(args, name);
//   hook.constructor = SyncHook;
//   hook.tapAsync = TAP_ASYNC;
//   hook.tapPromise = TAP_PROMISE;
//   hook.compile = COMPILE;
//   return hook;
// }
// SyncHook.prototype = null;
