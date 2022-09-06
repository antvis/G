import type { DisplayObject, LineStyleProps, ParsedLineStyleProps } from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';
import { inLine } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<LineStyleProps>,
  position: {
    x: number;
    y: number;
  },
): boolean {
  const {
    x1,
    y1,
    x2,
    y2,
    lineWidth,
    increasedLineWidthForHitTesting,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
    pointerEvents,
    fill,
    stroke,
  } = displayObject.parsedStyle as ParsedLineStyleProps;

  const isClipPath = !!clipPathTargets?.length;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, hasStroke] = isFillOrStrokeAffected(pointerEvents, fill, stroke);

  if ((!hasStroke && !isClipPath) || !lineWidth) {
    return false;
  }

  return inLine(
    x1,
    y1,
    x2,
    y2,
    (lineWidth || 0) + (increasedLineWidthForHitTesting || 0),
    position.x + x,
    position.y + y,
  );
}
