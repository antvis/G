import type {
  DisplayObject,
  LineStyleProps,
  ParsedLineStyleProps,
  Point,
} from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';
import { inLine } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<LineStyleProps>,
  position: Point,
  isClipPath: boolean,
): boolean {
  const {
    x1,
    y1,
    x2,
    y2,
    lineWidth = 0,
    increasedLineWidthForHitTesting = 0,
    pointerEvents,
    fill,
    stroke,
  } = displayObject.parsedStyle as ParsedLineStyleProps;

  const [, hasStroke] = isFillOrStrokeAffected(pointerEvents, fill, stroke);

  if ((!hasStroke && !isClipPath) || !lineWidth) {
    return false;
  }

  return inLine(
    x1,
    y1,
    x2,
    y2,
    lineWidth + increasedLineWidthForHitTesting,
    position.x,
    position.y,
  );
}
