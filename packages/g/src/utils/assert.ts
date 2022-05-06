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

export function isUndefined(a: any) {
  return typeof a === 'undefined';
}

export function isNil(a: any) {
  return a == null;
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: any): value is object {
  return Object.prototype.toString.call(value) === '[object Object]';
}
