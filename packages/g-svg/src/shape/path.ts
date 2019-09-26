/**
 * @fileoverview path
 * @author dengfuping_develop@163.com
 */

import { each, isArray, isBoolean } from '@antv/util';
import { SVG_ATTR_MAP } from '../constant';
import ShapeBase from './base';

class Path extends ShapeBase {
  type: string = 'path';
  canFill: boolean = true;
  canStroke: boolean = true;

  createPath(context, targetAttrs) {
    const attrs = this.attr();
    const el = this.get('el');
    each(targetAttrs || attrs, (value, attr) => {
      if (attr === 'path' && isArray(value)) {
        el.setAttribute('d', this._formatPath(value));
      } else if (attr === 'startArrow' || attr === 'endArrow') {
        const id = isBoolean(value)
          ? context.getDefaultArrow(attrs, SVG_ATTR_MAP[attr])
          : context.addArrow(attrs, SVG_ATTR_MAP[attr]);
        el.setAttribute(SVG_ATTR_MAP[attr], `url(#${id})`);
      } else if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value);
      }
    });
  }

  _formatPath(value) {
    const newValue = value
      .map((path) => {
        return path.join(' ');
      })
      .join('');
    if (~newValue.indexOf('NaN')) {
      return '';
    }
    return newValue;
  }
}

export default Path;
