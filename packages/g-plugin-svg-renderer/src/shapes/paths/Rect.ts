import { RectStyleProps } from '@antv/g';
import { isArray } from '@antv/util';
import { parseRadius } from '../../utils/format';
import { injectable } from 'inversify';
import { ElementRenderer } from '.';

@injectable()
export class RectRenderer implements ElementRenderer<RectStyleProps> {
  apply($el: SVGElement, attributes: RectStyleProps) {
    const { radius = 0, width = 0, height = 0 } = attributes;

    let d = '';
    if (!radius) {
      d = `M 0, 0 l ${width},0 l 0,${height} l${-width} 0 z`;
    } else {
      const r = parseRadius(radius);
      if (isArray(radius)) {
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
