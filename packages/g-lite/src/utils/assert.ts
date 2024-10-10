import { memoize } from './memoize';
import { camelCase } from './string';

export function DCHECK(bool: boolean) {
  if (!bool) {
    throw new Error();
  }
}

export function isSymbol(value: any): value is symbol {
  // @see https://github.com/lodash/lodash/blob/master/isSymbol.js
  return typeof value === 'symbol';
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

export function formatAttributes(attributes: Record<string, any>) {
  const formattedAttributes: Record<string, any> = {};
  for (const [key, value] of Object.entries(attributes)) {
    const formattedKey = formatAttributeName(key);
    formattedAttributes[formattedKey] = value;
  }
  return formattedAttributes;
}
