/**
 * 判断两个点是否重合，点坐标的格式为 [x, y]
 */
export function isSamePoint(
  point1: [number, number],
  point2: [number, number],
) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}
