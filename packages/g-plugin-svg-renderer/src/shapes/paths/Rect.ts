import type { ParsedRectStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import { parseRadius } from '../../utils/format';
import type { ElementRenderer } from '.';

@singleton()
export class RectRenderer implements ElementRenderer<ParsedRectStyleProps> {
  dependencies = ['radius', 'width', 'height'];

  apply($el: SVGElement, parsedStyle: ParsedRectStyleProps) {
    const { radius: radiusUnitValue, width: widthUnitValue, height: heightUnitValue } = parsedStyle;

    const radius = (radiusUnitValue && radiusUnitValue.value) || 0;
    const width = widthUnitValue.value;
    const height = heightUnitValue.value;

    let d = '';
    if (!radius) {
      d = `M 0,0 l ${width},0 l 0,${height} l${-width} 0 z`;
    } else {
      const r = parseRadius(radius);
      if (Array.isArray(radius)) {
        if (radius.length === 1) {
          r.r1 = r.r2 = r.r3 = r.r4 = radius[0];
        } else if (radius.length === 2) {
          r.r1 = r.r3 = radius[0];
          r.r2 = r.r4 = radius[1];
        } else if (radius.length === 3) {
          r.r1 = radius[0];
          r.r2 = r.r4 = radius[1];
          r.r3 = radius[2];
        } else {
          r.r1 = radius[0];
          r.r2 = radius[1];
          r.r3 = radius[2];
          r.r4 = radius[3];
        }
      } else {
        r.r1 = r.r2 = r.r3 = r.r4 = radius;
      }
      d = [
        [`M ${r.r1},0`],
        [`l ${width - r.r1 - r.r2},0`],
        [`a ${r.r2},${r.r2},0,0,1,${r.r2},${r.r2}`],
        [`l 0,${height - r.r2 - r.r3}`],
        [`a ${r.r3},${r.r3},0,0,1,${-r.r3},${r.r3}`],
        [`l ${r.r3 + r.r4 - width},0`],
        [`a ${r.r4},${r.r4},0,0,1,${-r.r4},${-r.r4}`],
        [`l 0,${r.r4 + r.r1 - height}`],
        [`a ${r.r1},${r.r1},0,0,1,${r.r1},${-r.r1}`],
        ['z'],
      ].join(' ');
    }
    $el.setAttribute('d', d);
  }
}
