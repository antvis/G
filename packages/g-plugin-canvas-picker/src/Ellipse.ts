import { DisplayObject, EllipseStyleProps } from '@antv/g';

function ellipseDistance(squareX: number, squareY: number, rx: number, ry: number) {
  return squareX / (rx * rx) + squareY / (ry * ry);
}

export function isPointInPath(
  displayObject: DisplayObject<EllipseStyleProps>,
  { x, y }: { x: number; y: number },
): boolean {
  const {
    rx = 0,
    ry = 0,
    fill,
    stroke,
    lineWidth = 0,
    clipPathTargets,
  } = displayObject.parsedStyle;
  const isClipPath = !!clipPathTargets?.length;

  const halfLineWith = lineWidth / 2;
  const squareX = (x - rx) * (x - rx);
  const squareY = (y - ry) * (y - ry);
  // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1;
  if ((fill && stroke) || isClipPath) {
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
