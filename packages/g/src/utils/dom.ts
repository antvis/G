import { isBrowser } from './canvas';

const PX_SUFFIX = 'px';
export function setDOMSize($el: HTMLElement | OffscreenCanvas, width: number, height: number) {
  if (isBrowser && ($el as HTMLElement).style) {
    ($el as HTMLElement).style.width = width + PX_SUFFIX;
    ($el as HTMLElement).style.height = height + PX_SUFFIX;
  }
}
