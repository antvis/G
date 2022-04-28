import type { DisplayObject, PolylineStyleProps, Point, ParsedBaseStyleProps } from '@antv/g';
import { inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  const {
    stroke,
    lineWidth,
    points,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedBaseStyleProps;
  const isClipPath = !!clipPathTargets?.length;
  const hasStroke = displayObject.attributes.stroke !== 'none' && !!stroke;
  if ((!hasStroke && !isClipPath) || !lineWidth) {
    return false;
  }

  return inPolyline(points.points, lineWidth.value, position.x + x, position.y + y, false);
}
