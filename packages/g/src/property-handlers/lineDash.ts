import { isString } from '@antv/util';
import { parseLength } from './dimension';
import type { ParsedElement } from './dimension';

/**
 * format lineDash to [dash, dash]
 *
 * also support string format such as `"stroke-dasharray": "2px 4px"`
 */
export function parseLineDash(lineDash: number[] | string): number[] {
  const formatted: number[] = [];
  if (isString(lineDash)) {
    lineDash.split(' ').forEach((segment) => {
      const dimension = parseLength(segment) as ParsedElement;
      formatted.push(dimension.value);
    });
  } else {
    formatted.push(...lineDash);
  }

  if (formatted && formatted.length === 1) {
    return [formatted[0], formatted[0]];
  }

  return [formatted[0], formatted[1]];
}
