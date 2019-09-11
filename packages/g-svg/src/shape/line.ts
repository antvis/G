/**
 * @fileoverview line
 * @author dengfuping_develop@163.com
 */

import { each, isBoolean } from '@antv/util';
import { SVG_ATTR_MAP } from '../constant';
import ShapeBase from './base';

class Line extends ShapeBase {
  type: string = 'line';
  canFill: boolean = false;
  canStroke: boolean = true;

  createPath(context, targetAttrs) {
    const attrs = this.attr();
    const el = this.get('el');
    each(targetAttrs || attrs, (value, attr) => {
      if (attr === 'startArrow' || attr === 'endArrow') {
        const id = isBoolean(value)
          ? context.getDefaultArrow(attrs, SVG_ATTR_MAP[attr])
          : context.addArrow(attrs, SVG_ATTR_MAP[attr]);
        el.setAttribute(SVG_ATTR_MAP[attr], `url(#${id})`);
      } else if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value);
      }
    });
  }
}

export default Line;
