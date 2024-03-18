import type { DisplayObject } from '../display-objects';
import type { IElement, IEventTarget, INode } from '../dom';
import type { CanvasLike } from '../types';
import { isBrowser } from './canvas';

export function isElement(
  target: IEventTarget | INode | IElement,
): target is IElement {
  return !!(target as IElement).getAttribute;
}

export function sortedIndex(array: IElement[], value: IElement) {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (sortByZIndex(array[mid], value) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

export function sortByZIndex(o1: IElement, o2: IElement) {
  const zIndex1 = Number(o1.parsedStyle.zIndex || 0);
  const zIndex2 = Number(o2.parsedStyle.zIndex || 0);
  if (zIndex1 === zIndex2) {
    const parent = o1.parentNode;
    if (parent) {
      const children = parent.childNodes || [];
      return children.indexOf(o1) - children.indexOf(o2);
    }
  }
  return zIndex1 - zIndex2;
}

export function findClosestClipPathTarget(
  object: DisplayObject,
): DisplayObject {
  let el = object;
  do {
    const clipPath = el.parsedStyle?.clipPath;
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
    return document.defaultView
      .getComputedStyle($el as Element, null)
      .getPropertyValue(property);
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
