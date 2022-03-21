import type { DisplayObject } from '../display-objects/DisplayObject';
import { Shape } from '../types';

/**
 * @see /zh/docs/api/animation#%E8%B7%AF%E5%BE%84%E5%8A%A8%E7%94%BB
 */
export function updateOffsetDistance(
  oldOffsetDistance: number,
  newOffsetDistance: number,
  object: DisplayObject,
) {
  if (!object.attributes.offsetPath) {
    return;
  }
  const offsetPathNodeName = object.attributes.offsetPath.nodeName;
  if (
    offsetPathNodeName === Shape.LINE ||
    offsetPathNodeName === Shape.PATH ||
    offsetPathNodeName === Shape.POLYLINE
  ) {
    const point = object.attributes.offsetPath.getPoint(newOffsetDistance);
    if (point) {
      object.setLocalPosition(point.x, point.y);
    }
  }
}
