import type { DisplayObject, LineStyleProps, ParsedLineStyleProps } from '@antv/g';
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
  } = displayObject.parsedStyle as ParsedLineStyleProps;

  return inLine(
    x1.value,
    y1.value,
    x2.value,
    y2.value,
    lineWidth.value + increasedLineWidthForHitTesting.value,
    position.x + x,
    position.y + y,
  );
}
