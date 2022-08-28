import { memoize } from '@antv/util';
import { camelCase, isString } from './string';

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
    values: {
      middle: 'center',
    },
  },
  src: {
    alias: 'img',
  },
};

const formatAttributeName = memoize((name: string) => {
  let attributeName = camelCase(name);
  const map = FORMAT_ATTR_MAP[attributeName];
  attributeName = map?.alias || attributeName;
  return [attributeName, map];
});

export function formatAttribute(name: string, value: any): [string, any] {
  const [attributeName, map] = formatAttributeName(name);
  const attributeValue = (isString(value) && map?.values?.[value]) || value;
  return [attributeName, attributeValue];
}
