/**
 * @fileoverview marker
 * @author dengfuping_develop@163.com
 */

import { isArray, isFunction } from '@antv/util';
import ShapeBase from '../base';
import symbolsFactory from './symbols';

class Marker extends ShapeBase {
  type: string = 'marker';
  canFill: boolean = true;
  canStroke: boolean = true;

  // 作为其静态属性
  public static symbolsFactory = symbolsFactory;

  createPath(context) {
    const el = this.get('el');
    el.setAttribute('d', this._assembleMarker());
  }

  _assembleMarker() {
    const d = this._getPath();
    if (isArray(d)) {
      return d
        .map((path) => {
          return path.join(' ');
        })
        .join('');
    }
    return d;
  }

  _getPath(): any[] {
    const attrs = this.attrs;
    const x = attrs.x;
    const y = attrs.y;
    const r = attrs.r;
    const symbol = attrs.symbol || 'circle';
    let method;
    if (isFunction(symbol)) {
      method = symbol;
    } else {
      method = symbolsFactory.get(symbol);
    }

    if (!method) {
      console.warn(`${method} symbol is not exist.`);
      return null;
    }
    return method(x, y, r);
  }
}

export default Marker;
