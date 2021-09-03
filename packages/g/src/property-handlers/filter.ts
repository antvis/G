import type { DisplayObject } from '../DisplayObject';
import { ParsedElement, parseDimension } from './dimension';

export interface ParsedFilterStyleProperty {
  name: string;
  params: ParsedElement[];
}

export const parseParam = parseDimension.bind(null, /deg|rad|grad|turn|px|%/g);

export function parseFilter(
  filterStr: string = '',
  displayObject: DisplayObject | null,
): ParsedFilterStyleProperty[] {
  filterStr = filterStr.toLowerCase().trim();
  if (filterStr === 'none') {
    return [];
  }
  const transformRegExp = /\s*(\w+)\(([^)]*)\)/g;
  const result: ParsedFilterStyleProperty[] = [];
  let match;
  let prevLastIndex = 0;
  while ((match = transformRegExp.exec(filterStr))) {
    if (match.index !== prevLastIndex) {
      return [];
    }
    prevLastIndex = match.index + match[0].length;
    result.push({
      name: match[1],
      params: match[2].split(' ').map((p) => parseParam(p)!),
    });

    if (transformRegExp.lastIndex === filterStr.length) {
      return result;
    }
  }

  return [];
}
