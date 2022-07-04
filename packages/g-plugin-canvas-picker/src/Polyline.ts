import type {
  CSSRGB,
  DisplayObject,
  ParsedPolylineStyleProps,
  Point,
  PolylineStyleProps,
} from '@antv/g';
import { inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  const {
    stroke,
    lineWidth,
    increasedLineWidthForHitTesting,
    points,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedPolylineStyleProps;
  const isClipPath = !!clipPathTargets?.length;
  const hasStroke = stroke && !(stroke as CSSRGB).isNone;

  if ((!hasStroke && !isClipPath) || !lineWidth) {
    return false;
  }

  return inPolyline(
    points.points,
    (lineWidth?.value || 0) + (increasedLineWidthForHitTesting?.value || 0),
    position.x + x,
    position.y + y,
    false,
  );
}
