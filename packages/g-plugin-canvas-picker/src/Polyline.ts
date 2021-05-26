import { DisplayObject } from '@antv/g';
import { Point } from './CanvasPickerPlugin';
import { inPolyline } from './utils/math';

export function isPointInPath(displayObject: DisplayObject, position: Point): boolean {
  const { stroke, lineWidth = 0, points, x, y } = displayObject.attributes;
  if (!stroke || !lineWidth) {
    return false;
  }

  return inPolyline(points, lineWidth, position.x + x, position.y + y, false);
}
