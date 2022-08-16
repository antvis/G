import { memoize } from '@antv/util';
import { isNil } from './assert';

export const camelCase = memoize((str: string = '') => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
});

export function isString(str: any): str is string {
  if (!isNil(str) && typeof str === 'string') {
    return true;
  }
  return false;
}
