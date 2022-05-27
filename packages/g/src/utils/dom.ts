import type { CanvasLike } from '../types';
import { isBrowser } from './canvas';

const PX_SUFFIX = 'px';
export function setDOMSize($el: CanvasLike, width: number, height: number) {
  if (isBrowser && ($el as unknown as HTMLElement).style) {
    ($el as unknown as HTMLElement).style.width = width + PX_SUFFIX;
    ($el as unknown as HTMLElement).style.height = height + PX_SUFFIX;
  }
}
