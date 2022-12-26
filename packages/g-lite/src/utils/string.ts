import { memoize } from './memoize';

export const camelCase = memoize((str = '') => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
});
