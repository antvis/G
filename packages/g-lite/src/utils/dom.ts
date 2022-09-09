import type { IElement } from '../dom';
import type { DisplayObject } from '../display-objects';
import type { CanvasLike } from '../types';
import { isBrowser } from './canvas';

export function sortByZIndex(o1: IElement, o2: IElement) {
  const zIndex1 = Number(o1.style.zIndex);
  const zIndex2 = Number(o2.style.zIndex);
  if (zIndex1 === zIndex2) {
    // return o1.entity.getComponent(Sortable).lastSortedIndex - o2.entity.getComponent(Sortable).lastSortedIndex;
    const parent = o1.parentNode;
    if (parent) {
      const children = parent.childNodes || [];
      return children.indexOf(o1) - children.indexOf(o2);
    }
  }
  return zIndex1 - zIndex2;
}

export function findClosestClipPathTarget(object: DisplayObject): DisplayObject {
  let el = object;
  do {
    const clipPath = el.style?.clipPath;
    if (clipPath) return el;
    el = el.parentElement as DisplayObject;
  } while (el !== null);
  return null;
}

const PX_SUFFIX = 'px';
export function setDOMSize($el: CanvasLike, width: number, height: number) {
  if (isBrowser && ($el as unknown as HTMLElement).style) {
    ($el as unknown as HTMLElement).style.width = width + PX_SUFFIX;
    ($el as unknown as HTMLElement).style.height = height + PX_SUFFIX;
  }
}

export function getStyle($el: HTMLElement | CanvasLike, property: string) {
  if (isBrowser) {
    return document.defaultView.getComputedStyle($el as Element, null).getPropertyValue(property);
  }
}

export function getWidth($el: HTMLElement | CanvasLike) {
  const width = getStyle($el, 'width');
  if (width === 'auto') {
    return ($el as HTMLElement).offsetWidth;
  }
  return parseFloat(width);
}

export function getHeight($el: HTMLElement | CanvasLike) {
  const height = getStyle($el, 'height');
  if (height === 'auto') {
    return ($el as HTMLElement).offsetHeight;
  }
  return parseFloat(height);
}
