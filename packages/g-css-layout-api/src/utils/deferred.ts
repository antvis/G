interface PromiseStatus<T> {
  isPending: () => boolean;
  isRejected: () => boolean;
  isFulfilled: () => boolean;
  getFullFilledValue: () => T;
}

/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * But modified according to the specs of promises : https://promisesaplus.com/
 */
export const makeQuerablePromise = <T>(promise: Promise<T>) => {
  // Don't modify any promise that has been already modified.
  if ((promise as any).isRejected || (promise as any).isFulfilled)
    return promise as any as PromiseStatus<T>;

  // Set initial state
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;
  let fullFilledValue: T;

  // Observe the promise, saving the fulfillment in a closure scope.
  const result = promise.then(
    (v) => {
      isFulfilled = true;
      isPending = false;
      fullFilledValue = v;
      return v;
    },
    (e) => {
      isRejected = true;
      isPending = false;
      throw e;
    },
  ) as any as PromiseStatus<T>;

  result.isFulfilled = () => {
    return isFulfilled;
  };
  result.isPending = () => {
    return isPending;
  };
  result.isRejected = () => {
    return isRejected;
  };
  result.getFullFilledValue = () => {
    return fullFilledValue;
  };
  return result;
};

/**
 * Simple implementation of the deferred pattern.
 * An object that exposes a promise and functions to resolve and reject it.
 */
export class Deferred<T = void> {
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (err?: any) => void;

  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

export const equalSet = (as: Set<any>, bs: Set<any>) => {
  if (as.size !== bs.size) return false;
  // eslint-disable-next-line no-restricted-syntax
  for (const a of as) {
    if (!bs.has(a)) {
      return false;
    }
  }
  return true;
};

/**
 * Nicely typed aliases for some `Object` Methods
 * - PSA: Don't mutate `yourObject`s
 * - Numerical keys are BAD, resolve that issue upstream
 * - Discussion: https://stackoverflow.com/a/65117465/565877
 */
export const ObjectTyped = {
  /**
   * Object.keys, but with nice typing (`Array<keyof T>`)
   */
  keys: Object.keys as <T extends Record<string, unknown>>(
    yourObject: T,
  ) => (keyof T)[],
  /**
   * Object.values, but with nice typing
   */
  values: Object.values as <T extends Record<string, unknown>>(
    yourObject: T,
  ) => T[keyof T][],
  /**
   * Object.entries, but with nice typing
   */
  entries: Object.entries as <T extends Record<string, unknown>>(
    yourObject: T,
  ) => [keyof T, T[keyof T]][],
};
