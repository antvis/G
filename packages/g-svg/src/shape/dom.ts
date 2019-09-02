/**
 * @fileoverview dom
 * @author dengfuping_develop@163.com
 */

import { each } from '@antv/util';
import { SVG_ATTR_MAP } from '../constant';
import ShapeBase from './base';

class Dom extends ShapeBase {
  type: string = 'dom';
  canFill: boolean = false;
  canStroke: boolean = false;

  createPath(context) {
    const attrs = this.attr();
    const el = this.get('el');
    each(attrs, (value, attr) => {
      if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value);
      }
    });
    el.innerHTML = attrs['html']; // set innerHTML
  }
}

export default Dom;
