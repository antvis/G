import { ChangeType } from '@antv/g-base/lib/types';
import { ISVGElement } from '../interfaces';
import { setTransform } from './svg';
import { sortDom, moveTo } from './dom';
import Defs from '../defs';

export function drawChildren(context: Defs, children: ISVGElement[]) {
  children.forEach((child) => {
    child.draw(context);
  });
}

export function applyClipChildren(context: Defs, children: ISVGElement[]) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.applyClip(context);
  }
}

export function drawPathChildren(context: Defs, children: ISVGElement[]) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.drawPath(context);
  }
}

/**
 * 更新元素，包括 canvas、group 和 shape
 * @param {ISVGElement} element    SVG 元素
 * @param {ChangeType} changeType  更新类型
 */
export function refreshElement(element: ISVGElement, changeType: ChangeType) {
  // element maybe canvas
  const canvas = element.get('canvas') || element;
  // should get context from canvas
  const context = canvas.get('context');
  const parent = element.getParent();
  const parentChildren = parent ? parent.getChildren() : [canvas];
  const el = element.get('el');
  if (changeType === 'remove') {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  } else if (changeType === 'show') {
    el.setAttribute('visibility', 'visible');
  } else if (changeType === 'hide') {
    el.setAttribute('visibility', 'hidden');
  } else if (changeType === 'zIndex') {
    moveTo(el, parentChildren.indexOf(element));
  } else if (changeType === 'sort') {
    const children = element.get('children');
    if (children && children.length) {
      sortDom(element, (a: ISVGElement, b: ISVGElement) => {
        return children.indexOf(a) - children.indexOf(b) ? 1 : 0;
      });
    }
  } else if (changeType === 'clear') {
    // el is null for group
    if (el) {
      el.innerHTML = '';
    }
  } else if (changeType === 'matrix') {
    setTransform(element);
  } else if (changeType === 'clip') {
    element.applyClip(context);
  } else if (changeType === 'changeSize') {
    const canvasEl = canvas.get('el');
    canvasEl.setAttribute('width', `${canvas.get('width')}`);
    canvasEl.setAttribute('height', `${canvas.get('height')}`);
  } else if (changeType === 'attr') {
    // 已在 afterAttrsChange 进行了处理，此处 do nothing
  } else if (changeType === 'add') {
    element.drawPath(context);
  }
}
