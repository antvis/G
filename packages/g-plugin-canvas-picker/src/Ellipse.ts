import type { CSSRGB, DisplayObject, EllipseStyleProps, ParsedEllipseStyleProps } from '@antv/g';

function ellipseDistance(squareX: number, squareY: number, rx: number, ry: number) {
  return squareX / (rx * rx) + squareY / (ry * ry);
}

export function isPointInPath(
  displayObject: DisplayObject<EllipseStyleProps>,
  { x, y }: { x: number; y: number },
): boolean {
  const {
    rx: rxInPixels,
    ry: ryInPixels,
    fill,
    stroke,
    lineWidth,
    increasedLineWidthForHitTesting,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedEllipseStyleProps;
  const isClipPath = !!clipPathTargets?.length;

  const hasFill = fill && !(fill as CSSRGB).isNone;
  const hasStroke = stroke && !(stroke as CSSRGB).isNone;

  const rx = rxInPixels.value;
  const ry = ryInPixels.value;

  const halfLineWith =
    ((lineWidth?.value || 0) + (increasedLineWidthForHitTesting?.value || 0)) / 2;
  const squareX = (x - rx) * (x - rx);
  const squareY = (y - ry) * (y - ry);
  // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1;
  if ((hasFill && hasStroke) || isClipPath) {
    return ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <= 1;
  }
  if (hasFill) {
    return ellipseDistance(squareX, squareY, rx, ry) <= 1;
  }
  if (hasStroke) {
    return (
      ellipseDistance(squareX, squareY, rx - halfLineWith, ry - halfLineWith) >= 1 &&
      ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <= 1
    );
  }
  return false;
}
