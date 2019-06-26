
import { IElement } from '@antv/g-base/lib/interfaces';
import { ICanvasElement } from '../interfaces';
import { parseStyle } from './parse';

const SHAPE_ATTRS_MAP = {
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  opacity: 'globalAlpha',
};

export function applyAttrsToContext(context: CanvasRenderingContext2D, element: IElement) {
  const attrs = element.attr();
  for (const k in attrs) {
    let v = attrs[k];
    // 转换一下不与 canvas 兼容的属性名
    const name = SHAPE_ATTRS_MAP[k] ? SHAPE_ATTRS_MAP[k] : k;
    if (name === 'matrix' && v) { // 设置矩阵
      context.transform(v[0], v[1], v[3], v[4], v[6], v[7]);
    } else if (name === 'lineDash' && context.setLineDash) {
      // 不再考虑支持字符串的形式
      context.setLineDash(v);
    } else {
      if (name === 'strokeStyle' || name === 'fillStyle') {
        // 如果存在渐变、pattern 这个开销有些大
        // 可以考虑缓存机制，通过 hasUpdate 来避免一些运算
        v = parseStyle(context, element, v);
      }
      context[name] = v;
    }
  }
}

export function drawChildren(context: CanvasRenderingContext2D, children: IElement[]) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as ICanvasElement;
    child.draw(context);
  }
}
