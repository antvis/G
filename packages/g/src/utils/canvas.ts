import { Canvas } from '../Canvas';

let canvasMap: Record<string, Canvas> = {};
/**
 * destroy existed canvas with the same id
 */
export function cleanExistedCanvas(container: string | HTMLElement, canvas: Canvas) {
  const id = typeof container === 'string' ? container : container.id;

  if (canvasMap[id]) {
    canvasMap[id].destroy();
  }

  canvasMap[id] = canvas;
}
