export function DCHECK(bool: boolean) {
  if (!bool) {
    throw new Error();
  }
}

export function DCHECK_EQ(a: any, b: any) {
  if (a !== b) {
    throw new Error();
  }
}

export function DCHECK_NE(a: any, b: any) {
  if (a === b) {
    throw new Error();
  }
}

export function isFunction(func: any): func is (...args: any[]) => any {
  return typeof func === 'function';
}

export function isSymbol(value: any): value is symbol {
  // @see https://github.com/lodash/lodash/blob/master/isSymbol.js
  return typeof value === 'symbol';
}

export const definedProps = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
