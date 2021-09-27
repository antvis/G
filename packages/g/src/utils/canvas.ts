import type { Canvas } from '../Canvas';

let canvasMap: Record<string, Canvas> = {};
let defaultCanvasIdCounter = 0;
/**
 * destroy existed canvas with the same id
 */
export function cleanExistedCanvas(container: string | HTMLElement, canvas: Canvas) {
  const id = typeof container === 'string' ? container : container.id || defaultCanvasIdCounter++;

  if (canvasMap[id]) {
    canvasMap[id].destroy();
  }

  canvasMap[id] = canvas;
}
