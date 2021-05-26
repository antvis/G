export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 判断两个点是否重合，点坐标的格式为 [x, y]
 */
export function isSamePoint(point1: [number, number], point2: [number, number]) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}
