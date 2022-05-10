import type {
  DisplayObject,
  PolylineStyleProps,
  Point,
  ParsedPolygonStyleProps,
  CSSRGB,
} from '@antv/g';
import { inPolygon, inPolyline } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<PolylineStyleProps>,
  position: Point,
): boolean {
  const {
    stroke,
    fill,
    lineWidth,
    increasedLineWidthForHitTesting,
    points,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedPolygonStyleProps;
  const isClipPath = !!clipPathTargets?.length;
  const hasFill = fill && !(fill as CSSRGB).isNone;
  const hasStroke = stroke && !(stroke as CSSRGB).isNone;

  let isHit = false;
  if (hasStroke || isClipPath) {
    isHit = inPolyline(
      points.points,
      lineWidth.value + increasedLineWidthForHitTesting.value,
      position.x + x,
      position.y + y,
      true,
    );
  }
  if (!isHit && (hasFill || isClipPath)) {
    isHit = inPolygon(points.points, position.x + x, position.y + y);
  }
  return isHit;
}
