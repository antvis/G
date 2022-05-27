import type { CanvasLike } from '../types';
import { isBrowser } from './canvas';

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
