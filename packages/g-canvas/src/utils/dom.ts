import { isBrowser } from './browser';

const PX_SUFFIX = 'px';
export function setDOMSize($el: HTMLElement, width: number, height: number) {
  if (isBrowser) {
    $el.style.width = width + PX_SUFFIX;
    $el.style.height = height + PX_SUFFIX;
  }
}
