/**
 * @fileoverview ellipse
 * @author dengfuping_develop@163.com
 */

import { each } from '@antv/util';
import { SVG_ATTR_MAP } from '../constant';
import ShapeBase from './base';

class Ellipse extends ShapeBase {
  type: string = 'ellipse';
  canFill: boolean = true;
  canStroke: boolean = true;

  createPath(context) {
    const attrs = this.attr();
    const el = this.get('el');
    each(attrs, (value, attr) => {
      // 圆和椭圆的点坐标属性不是 x, y，而是 cx, cy
      if (attr === 'x' || attr === 'y') {
        el.setAttribute(`c${attr}`, value);
      } else if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value);
      }
    });
  }
}

export default Ellipse;
