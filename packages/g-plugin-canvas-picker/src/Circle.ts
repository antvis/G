import type {
  CircleStyleProps,
  DisplayObject,
  ParsedCircleStyleProps,
  Point,
  CSSRGB,
} from '@antv/g';
import { distance } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<CircleStyleProps>,
  position: Point,
): boolean {
  const {
    r: rInPixels,
    fill,
    stroke,
    lineWidth,
    increasedLineWidthForHitTesting,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedCircleStyleProps;
  const r = rInPixels.value;
  const halfLineWidth = (lineWidth.value + increasedLineWidthForHitTesting.value) / 2;
  const absDistance = distance(r, r, position.x, position.y);
  const isClipPath = !!clipPathTargets?.length;

  const hasFill = fill && !(fill as CSSRGB).isNone;
  const hasStroke = stroke && !(stroke as CSSRGB).isNone;

  // 直接用距离，如果同时存在边和填充时，可以减少两次计算
  if ((hasFill && hasStroke) || isClipPath) {
    return absDistance <= r + halfLineWidth;
  }
  if (hasFill) {
    return absDistance <= r;
  }
  if (hasStroke) {
    return absDistance >= r - halfLineWidth && absDistance <= r + halfLineWidth;
  }
  return false;
}
