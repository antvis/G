import type {
  DisplayObject,
  PolylineStyleProps,
  Point,
  ParsedPolylineStyleProps,
  CSSRGB,
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
    lineWidth.value + increasedLineWidthForHitTesting.value,
    position.x + x,
    position.y + y,
    false,
  );
}
