import { isBrowser } from './browser';

const PX_SUFFIX = 'px';
export function setDOMSize($el: HTMLElement | OffscreenCanvas, width: number, height: number) {
  if (isBrowser) {
    // @ts-ignore
    $el.style.width = width + PX_SUFFIX;
    // @ts-ignore
    $el.style.height = height + PX_SUFFIX;
  }
}
