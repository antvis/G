import { ShapeAttrs } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, attributes: ShapeAttrs) {
  const { x1, y1, x2, y2, x = 0, y = 0 } = attributes;
  context.beginPath();
  context.moveTo(x1 - x, y1 - y);
  context.lineTo(x2 - x, y2 - y);
}
