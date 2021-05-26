import { DisplayObject } from '@antv/g';
import { inLine } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject,
  position: {
    x: number;
    y: number;
  }
): boolean {
  const { x1, y1, x2, y2, lineWidth = 0, x, y } = displayObject.attributes;

  return inLine(x1, y1, x2, y2, lineWidth, position.x + x, position.y + y);
}
