// @ts-nocheck

import type { UnsetAdditionalOptions } from './Hook';
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';

class AsyncParallelHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone }) {
    return this.callTapsParallel({
      onError: (i, err, done, doneBreak) => onError(err) + doneBreak(true),
      onDone,
    });
  }
}

const factory = new AsyncParallelHookCodeFactory();

const COMPILE = function (options) {
  factory.setup(this, options);
  return factory.create(options);
};

export class AsyncParallelHook<T, AdditionalOptions = UnsetAdditionalOptions> extends Hook<
  T,
  void,
  AdditionalOptions
> {
  constructor(args = [], name = undefined) {
    super(args, name);
    this.compile = COMPILE;
    this._call = undefined;
    this.call = undefined;
  }
}

// export function AsyncParallelHook(args = [], name = undefined) {
//   const hook = new Hook(args, name);
//   hook.constructor = AsyncParallelHook;
//   hook.compile = COMPILE;
//   hook._call = undefined;
//   hook.call = undefined;
//   return hook;
// }

// AsyncParallelHook.prototype = null;
