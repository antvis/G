// @ts-nocheck

import type { AsArray, UnsetAdditionalOptions } from './Hook';
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';

class AsyncSeriesWaterfallHookCodeFactory extends HookCodeFactory {
  content({ onError, onResult, onDone }) {
    return this.callTapsSeries({
      onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
      onResult: (i, result, next) => {
        let code = '';
        code += `if(${result} !== undefined) {\n`;
        code += `${this._args[0]} = ${result};\n`;
        code += `}\n`;
        code += next();
        return code;
      },
      onDone: () => onResult(this._args[0]),
    });
  }
}

const factory = new AsyncSeriesWaterfallHookCodeFactory();

const COMPILE = function (options) {
  factory.setup(this, options);
  return factory.create(options);
};

// export function AsyncSeriesWaterfallHook(args = [], name = undefined) {
//   if (args.length < 1) throw new Error('Waterfall hooks must have at least one argument');
//   const hook = new Hook(args, name);
//   hook.constructor = AsyncSeriesWaterfallHook;
//   hook.compile = COMPILE;
//   hook._call = undefined;
//   hook.call = undefined;
//   return hook;
// }

// AsyncSeriesWaterfallHook.prototype = null;

export class AsyncSeriesWaterfallHook<T, AdditionalOptions = UnsetAdditionalOptions> extends Hook<
  T,
  AsArray<T>[0],
  AdditionalOptions
> {
  constructor(args = [], name = undefined) {
    super(args, name);
    this.compile = COMPILE;
    this._call = undefined;
    this.call = undefined;
  }
}
