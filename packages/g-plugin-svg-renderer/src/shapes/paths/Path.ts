import type { ParsedPathStyleProps, PathCommand } from '@antv/g';

export function updatePathElementAttribute($el: SVGElement, parsedStyle: ParsedPathStyleProps) {
  const { path, defX: x = 0, defY: y = 0 } = parsedStyle;
  $el.setAttribute('d', formatPath(path!.absolutePath as PathCommand[], x, y));
}

function formatPath(value: PathCommand[], x: number, y: number) {
  const newValue = value
    .map((params) => {
      const command = params[0];

      switch (command) {
        case 'M':
          return `M ${params[1]! - x},${params[2]! - y}`;
        case 'L':
          return `L ${params[1]! - x},${params[2]! - y}`;
        case 'Q':
          return `Q ${params[1]! - x} ${params[2]! - y},${params[3]! - x} ${params[4]! - y}`;
        case 'C':
          return `C ${params[1]! - x} ${params[2]! - y},${params[3]! - x} ${params[4]! - y},${
            params[5]! - x
          } ${params[6]! - y}`;
        case 'A':
          return `A ${params[1]} ${params[2]} ${params[3]} ${params[4]} ${params[5]} ${
            params[6]! - x
          } ${params[7]! - y}`;
        case 'Z':
          return 'Z';
        default:
          break;
      }
    })
    .join(' ');
  if (~newValue.indexOf('NaN')) {
    return '';
  }
  return newValue;
}
