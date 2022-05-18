import type { ParsedRectStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import type { ElementRenderer } from '.';

@singleton()
export class RectRenderer implements ElementRenderer<ParsedRectStyleProps> {
  dependencies = ['radius', 'width', 'height'];

  apply($el: SVGElement, parsedStyle: ParsedRectStyleProps) {
    const { radius, width, height } = parsedStyle;

    const hasRadius = radius && radius.some((r) => r.value !== 0);

    let d = '';
    if (!hasRadius) {
      d = `M 0,0 l ${width},0 l 0,${height} l${-width} 0 z`;
    } else {
      const [tlr, trr, brr, blr] = radius.map((r) => r.value);
      d = [
        [`M ${tlr},0`],
        [`l ${width.value - tlr - trr},0`],
        [`a ${trr},${trr},0,0,1,${trr},${trr}`],
        [`l 0,${height.value - trr - brr}`],
        [`a ${brr},${brr},0,0,1,${-brr},${brr}`],
        [`l ${brr + blr - width.value},0`],
        [`a ${blr},${blr},0,0,1,${-blr},${-blr}`],
        [`l 0,${blr + tlr - height.value}`],
        [`a ${tlr},${tlr},0,0,1,${tlr},${-tlr}`],
        ['z'],
      ].join(' ');
    }
    $el.setAttribute('d', d);
  }
}
