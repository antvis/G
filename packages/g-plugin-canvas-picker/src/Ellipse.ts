import type { DisplayObject, EllipseStyleProps } from '@antv/g';

function ellipseDistance(squareX: number, squareY: number, rx: number, ry: number) {
  return squareX / (rx * rx) + squareY / (ry * ry);
}

export function isPointInPath(
  displayObject: DisplayObject<EllipseStyleProps>,
  { x, y }: { x: number; y: number },
): boolean {
  const { rx = 0, ry = 0, fill, stroke, lineWidth = 0 } = displayObject.attributes;

  const halfLineWith = lineWidth / 2;
  const squareX = x * x;
  const squareY = y * y;
  // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1;
  if (fill && stroke) {
    return ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <= 1;
  }
  if (fill) {
    return ellipseDistance(squareX, squareY, rx, ry) <= 1;
  }
  if (stroke) {
    return (
      ellipseDistance(squareX, squareY, rx - halfLineWith, ry - halfLineWith) >= 1 &&
      ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <= 1
    );
  }
  return false;
}
