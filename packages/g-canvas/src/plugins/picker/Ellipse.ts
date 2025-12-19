import type {
  DisplayObject,
  EllipseStyleProps,
  ParsedEllipseStyleProps,
  Point,
} from '@antv/g-lite';
import { isFillOrStrokeAffected } from '@antv/g-lite';

function ellipseDistance(
  squareX: number,
  squareY: number,
  rx: number,
  ry: number,
) {
  return squareX / (rx * rx) + squareY / (ry * ry);
}

export function isPointInPath(
  displayObject: DisplayObject<EllipseStyleProps>,
  position: Point,
  isClipPath: boolean,
): boolean {
  const {
    cx = 0,
    cy = 0,
    rx,
    ry,
    fill,
    stroke,
    lineWidth = 1,
    increasedLineWidthForHitTesting = 0,
    pointerEvents = 'auto',
  } = displayObject.parsedStyle as ParsedEllipseStyleProps;

  const { x, y } = position;
  const [hasFill, hasStroke] = isFillOrStrokeAffected(
    pointerEvents,
    fill,
    stroke,
  );

  const halfLineWith = (lineWidth + increasedLineWidthForHitTesting) / 2;
  const squareX = (x - cx) * (x - cx);
  const squareY = (y - cy) * (y - cy);
  // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1;
  if ((hasFill && hasStroke) || isClipPath) {
    return (
      ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <=
      1
    );
  }
  if (hasFill) {
    return ellipseDistance(squareX, squareY, rx, ry) <= 1;
  }
  if (hasStroke) {
    return (
      ellipseDistance(squareX, squareY, rx - halfLineWith, ry - halfLineWith) >=
        1 &&
      ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <=
        1
    );
  }
  return false;
}
