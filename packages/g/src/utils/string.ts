import { isNil } from './assert';

const cache = {};
export function camelCase(str: string = '') {
  if (!cache[str]) {
    cache[str] = str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
  return cache[str];
}

export function isString(str: any): str is string {
  if (!isNil(str) && typeof str === 'string') {
    return true;
  }
  return false;
}
