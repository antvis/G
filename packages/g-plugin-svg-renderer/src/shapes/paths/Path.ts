import type { ParsedPathStyleProps } from '@antv/g';
import { translatePathToString } from '@antv/g';

export function updatePathElementAttribute($el: SVGElement, parsedStyle: ParsedPathStyleProps) {
  const { path, defX = 0, defY = 0 } = parsedStyle;
  $el.setAttribute('d', translatePathToString(path.absolutePath, defX, defY));
}
