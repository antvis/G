import type { Canvas } from '../Canvas';

const canvasMap: Record<string, Canvas> = {};
let defaultCanvasIdCounter = 0;
/**
 * destroy existed canvas with the same id
 */
export function cleanExistedCanvas(
  container: string | HTMLElement,
  canvas: Canvas,
  fast: boolean,
) {
  if (container) {
    const id =
      typeof container === 'string'
        ? container
        : container.id || defaultCanvasIdCounter++;

    if (canvasMap[id]) {
      canvasMap[id].destroy(true, !!fast);
    }

    canvasMap[id] = canvas;
  }
}

export const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';
