import type { DisplayObject } from '../display-objects/DisplayObject';
import { parseColor, ParsedColorStyleProperty } from './color';
import { ParsedElement, parseDimension } from './dimension';

export interface ParsedFilterStyleProperty {
  name: string;
  params: (ParsedElement | ParsedColorStyleProperty)[];
}

export const parseParam = parseDimension.bind(null, /deg|rad|grad|turn|px|%/g);

const supportedFilters = [
  'blur',
  'brightness',
  'drop-shadow',
  'contrast',
  'grayscale',
  'sepia',
  'saturate',
  'hue-rotate',
  'invert',
];

export function parseFilter(
  filterStr: string = '',
  displayObject: DisplayObject | null,
): ParsedFilterStyleProperty[] {
  filterStr = filterStr.toLowerCase().trim();
  if (filterStr === 'none') {
    return [];
  }
  const filterRegExp = /\s*([\w-]+)\(([^)]*)\)/g;
  const result: ParsedFilterStyleProperty[] = [];
  let match;
  let prevLastIndex = 0;
  while ((match = filterRegExp.exec(filterStr))) {
    if (match.index !== prevLastIndex) {
      return [];
    }
    prevLastIndex = match.index + match[0].length;

    if (supportedFilters.indexOf(match[1]) > -1) {
      result.push({
        name: match[1],
        params: match[2].split(' ').map((p) => parseParam(p) || parseColor(p, null)),
      });
    }

    if (filterRegExp.lastIndex === filterStr.length) {
      return result;
    }
  }

  return [];
}
