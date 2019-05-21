
import { IShape } from '../interfaces';
import { ShapeCfg } from '../types';
import Element from './element';
import { each, isArray } from '@antv/util';

// 需要考虑数组嵌套数组的场景
// 数组嵌套对象的场景不考虑
function _cloneArrayAttr(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (isArray(arr[i])) {
      result.push([].concat(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

abstract class AbstractShape extends Element implements IShape {
  constructor(cfg: ShapeCfg) {
    super(cfg);
  }

  // 不同的 Shape 各自实现
  abstract isHit(x: number, y: number): boolean;

  clone() {
    const originAttrs = this.attrs;
    const attrs = {};
    each(originAttrs, (i, k) => {
      if (isArray(originAttrs[k])) {
        attrs[k] = _cloneArrayAttr(originAttrs[k]);
      } else {
        attrs[k] = originAttrs[k];
      }
    });
    const cons = this.constructor;
    // @ts-ignore
    const clone = new cons({ attrs });
    return clone;
  }
}

export default AbstractShape;
