import type { Canvas } from '../Canvas';

const CANVAS_Map = new WeakMap<Element, Canvas>();

/**
 * destroy existed canvas with the same id
 */
export function cleanExistedCanvas(
  container: string | HTMLElement,
  canvas: Canvas,
  cleanUp?: boolean,
) {
  if (container) {
    const $dom =
      typeof container === 'string'
        ? document.getElementById(container)
        : container;
    if (CANVAS_Map.has($dom)) CANVAS_Map.get($dom).destroy(cleanUp);
    CANVAS_Map.set($dom, canvas);
  }
}

export const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';
