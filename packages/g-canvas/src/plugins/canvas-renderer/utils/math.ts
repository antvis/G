import { vec3, mat4 } from 'gl-matrix';

/**
 * 判断两个点是否重合，点坐标的格式为 [x, y]
 */
export function isSamePoint(
  point1: [number, number],
  point2: [number, number],
) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

export function calculateOverlapRect<
  Rect extends [number, number, number, number],
>(rect1: Rect, rect2: Rect): null | Rect {
  const [x1, y1, w1, h1] = rect1;
  const [x2, y2, w2, h2] = rect2;

  // 计算重叠区域的左上角和右下角
  const overlapLeft = Math.max(x1, x2);
  const overlapTop = Math.max(y1, y2);
  const overlapRight = Math.min(x1 + w1, x2 + w2);
  const overlapBottom = Math.min(y1 + h1, y2 + h2);

  if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
    return null;
  }

  return [
    overlapLeft,
    overlapTop,
    overlapRight - overlapLeft,
    overlapBottom - overlapTop,
  ] as Rect;
}

export function transformRect<Rect extends [number, number, number, number]>(
  rect: Rect,
  matrix: mat4,
): Rect {
  const tl = vec3.transformMat4(vec3.create(), [rect[0], rect[1], 0], matrix);
  const tr = vec3.transformMat4(
    vec3.create(),
    [rect[0] + rect[2], rect[1], 0],
    matrix,
  );
  const bl = vec3.transformMat4(
    vec3.create(),
    [rect[0], rect[1] + rect[3], 0],
    matrix,
  );
  const br = vec3.transformMat4(
    vec3.create(),
    [rect[0] + rect[2], rect[1] + rect[3], 0],
    matrix,
  );

  return [
    Math.min(tl[0], tr[0], bl[0], br[0]),
    Math.min(tl[1], tr[1], bl[1], br[1]),
    Math.max(tl[0], tr[0], bl[0], br[0]) - Math.min(tl[0], tr[0], bl[0], br[0]),
    Math.max(tl[1], tr[1], bl[1], br[1]) - Math.min(tl[1], tr[1], bl[1], br[1]),
  ] as Rect;
}
