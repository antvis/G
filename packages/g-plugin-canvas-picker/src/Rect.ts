import type { DisplayObject, RectStyleProps, Point, ParsedRectStyleProps, CSSRGB } from '@antv/g';
import { UnitType } from '@antv/g';
import { inLine, inArc, inBox, inRect } from './utils/math';

export function isPointInPath(
  displayObject: DisplayObject<RectStyleProps>,
  position: Point,
  isPointInPath: (displayObject: DisplayObject<RectStyleProps>, position: Point) => boolean,
): boolean {
  const {
    radius,
    fill,
    stroke,
    lineWidth,
    increasedLineWidthForHitTesting,
    width: parsedWidth,
    height: parsedHeight,
    clipPathTargets,
  } = displayObject.parsedStyle as ParsedRectStyleProps;
  const isClipPath = !!clipPathTargets?.length;
  const hasFill = fill && !(fill as CSSRGB).isNone;
  const hasStroke = stroke && !(stroke as CSSRGB).isNone;

  const { unit: widthUnit, value: widthValue } = parsedWidth;
  const { unit: heightUnit, value: heightValue } = parsedHeight;
  let width = 0;
  let height = 0;
  if (widthUnit === UnitType.kNumber || widthUnit === UnitType.kPixels) {
    width = widthValue;
  }
  if (heightUnit === UnitType.kNumber || heightUnit === UnitType.kPixels) {
    height = heightValue;
  }

  const increasedLineWidthForHitTesting = lineWidth.value + increasedLineWidthForHitTesting.value;

  // 无圆角时的策略
  if (!radius) {
    const halfWidth = increasedLineWidthForHitTesting / 2;
    // 同时填充和带有边框
    if ((hasFill && hasStroke) || isClipPath) {
      return inBox(
        0 - halfWidth,
        0 - halfWidth,
        width + halfWidth,
        height + halfWidth,
        position.x,
        position.y,
      );
    }
    // 仅填充
    if (hasFill) {
      return inBox(0, 0, width, height, position.x, position.y);
    }
    if (hasStroke) {
      return inRect(0, 0, width, height, increasedLineWidthForHitTesting, position.x, position.y);
    }
  } else {
    let isHit = false;
    if (hasStroke || isClipPath) {
      isHit = inRectWithRadius(
        0,
        0,
        width,
        height,
        radius.value,
        increasedLineWidthForHitTesting,
        position.x,
        position.y,
      );
    }
    // 仅填充时带有圆角的矩形直接通过图形拾取
    // 以后可以改成纯数学的近似拾取，将圆弧切割成多边形
    if (!isHit && (hasFill || isClipPath)) {
      isHit = isPointInPath(displayObject, position);
    }
    return isHit;
  }

  return false;
}

function inRectWithRadius(
  minX: number,
  minY: number,
  width: number,
  height: number,
  radius: number,
  lineWidth: number,
  x: number,
  y: number,
) {
  return (
    inLine(minX + radius, minY, minX + width - radius, minY, lineWidth, x, y) ||
    inLine(minX + width, minY + radius, minX + width, minY + height - radius, lineWidth, x, y) ||
    inLine(minX + width - radius, minY + height, minX + radius, minY + height, lineWidth, x, y) ||
    inLine(minX, minY + height - radius, minX, minY + radius, lineWidth, x, y) ||
    inArc(
      minX + width - radius,
      minY + radius,
      radius,
      1.5 * Math.PI,
      2 * Math.PI,
      lineWidth,
      x,
      y,
    ) ||
    inArc(
      minX + width - radius,
      minY + height - radius,
      radius,
      0,
      0.5 * Math.PI,
      lineWidth,
      x,
      y,
    ) ||
    inArc(minX + radius, minY + height - radius, radius, 0.5 * Math.PI, Math.PI, lineWidth, x, y) ||
    inArc(minX + radius, minY + radius, radius, Math.PI, 1.5 * Math.PI, lineWidth, x, y)
  );
}
