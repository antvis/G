import type { ParsedPathStyleProps } from '@antv/g';
import { path2String } from '@antv/util';

export function updatePathElementAttribute($el: SVGElement, parsedStyle: ParsedPathStyleProps) {
  const { path } = parsedStyle;
  $el.setAttribute('d', path2String(path.absolutePath, 3));
}
