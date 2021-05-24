import { ShapeAttrs } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, attributes: ShapeAttrs) {
  context.beginPath();
  const { r = 0 } = attributes;
  context.arc(0, 0, r, 0, Math.PI * 2, false);
}
