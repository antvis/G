import { IBase } from '../interfaces';
export function removeFromArray(arr: any[], obj: any) {
  const index = arr.indexOf(obj);
  if (index !== -1) {
    arr.splice(index, 1);
  }
}

export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export { default as isNil } from '@antv/util/lib/is-nil';
export { default as isFunction } from '@antv/util/lib/is-function';
export { default as isString } from '@antv/util/lib/is-string';
export { default as isObject } from '@antv/util/lib/is-object';
export { default as isArray } from '@antv/util/lib/is-array';
export { default as mix } from '@antv/util/lib/mix';
export { default as each } from '@antv/util/lib/each';
export { default as upperFirst } from '@antv/util/lib/upper-first';

// 是否元素的父容器
export function isParent(container, shape) {
  // 所有 shape 都是 canvas 的子元素
  if (container.isCanvas()) {
    return true;
  }
  let parent = shape.getParent();
  let isParent = false;
  while (parent) {
    if (parent === container) {
      isParent = true;
      break;
    }
    parent = parent.getParent();
  }
  return isParent;
}

export function isAllowCapture(element: IBase): boolean {
  // @ts-ignore
  return element.cfg.visible && element.cfg.capture;
}
