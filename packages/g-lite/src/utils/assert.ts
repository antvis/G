import { memoize } from '@antv/util';
import { camelCase } from './string';

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

export const definedProps = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const FORMAT_ATTR_MAP = {
  d: {
    alias: 'path',
  },
  strokeDasharray: {
    alias: 'lineDash',
  },
  strokeWidth: {
    alias: 'lineWidth',
  },
  textAnchor: {
    alias: 'textAlign',
  },
  src: {
    alias: 'img',
  },
};

export const formatAttributeName = memoize((name: string) => {
  let attributeName = camelCase(name);
  const map = FORMAT_ATTR_MAP[attributeName];
  attributeName = map?.alias || attributeName;
  return attributeName;
});
