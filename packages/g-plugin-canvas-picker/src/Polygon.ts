import { DisplayObject } from '@antv/g';
import { Point } from './CanvasPickerPlugin';
import { inPolygon, inPolyline } from './utils/math';

export function isPointInPath(displayObject: DisplayObject, position: Point): boolean {
  const { stroke, fill, lineWidth = 0, points, x, y } = displayObject.attributes;

  let isHit = false;
  if (stroke) {
    isHit = inPolyline(points, lineWidth, position.x + x, position.y + y, true);
  }
  if (!isHit && fill) {
    isHit = inPolygon(points, position.x + x, position.y + y);
  }
  return isHit;
}
