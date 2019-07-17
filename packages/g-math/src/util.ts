/**
 * 两点之间的距离
 * @param {number} x1 起始点 x
 * @param {number} y1 起始点 y
 * @param {number} x2 结束点 x
 * @param {number} y2 结束点 y
 * @returns {number} 距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 根据比例获取点
 * @param {number} x1 起始点 x
 * @param {number} y1 起始点 y
 * @param {number} x2 结束点 x
 * @param {number} y2 结束点 y
 * @return {object} 包含 x, y 的点
 */
export function pointAtLine(x1, y1, x2, y2, t) {
  return {
    x: (1 - t) * x1 + t * x2,
    y: (1 - t) * y1 + t * y2,
  };
}

function analyzePoints(points) {
  // 计算每段的长度和总的长度
  let totalLength = 0;
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const length = distance(from[0], from[1], to[0], to[1]);
    const seg = {
      from,
      to,
      length,
    };
    segments.push(seg);
    totalLength += length;
  }
  return { segments, totalLength };
}

/**
 * 按照比例在数据片段中获取点
 * @param {array} points 点的集合
 * @param {number} t 百分比 0-1
 * @returns {object} 点的坐标
 */
export function pointAtSegments(points: any[], t: number) {
  // 边界判断
  if (t > 1 || t < 0 || points.length < 2) {
    return null;
  }
  const { segments, totalLength } = analyzePoints(points);
  // 多个点有可能重合
  if (totalLength === 0) {
    return {
      x: points[0][0],
      y: points[0][1],
    };
  }
  // 计算比例
  let startRatio = 0;
  let point = null;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const { from, to } = seg;
    const currentRatio = seg.length / totalLength;
    if (t >= startRatio && t <= startRatio + currentRatio) {
      const localRatio = (t - startRatio) / currentRatio;
      point = pointAtLine(from[0], from[1], to[0], to[1], localRatio);
      break;
    }
    startRatio += currentRatio;
  }
  return point;
}

/**
 * 按照比例在数据片段中获取切线的角度
 * @param {array} points 点的集合
 * @param {number} t 百分比 0-1
 */
export function angleAtSegments(points: any[], t: number) {
  // 边界判断
  if (t > 1 || t < 0 || points.length < 2) {
    return 0;
  }
  const { segments, totalLength } = analyzePoints(points);
  // 计算比例
  let startRatio = 0;
  let angle = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const { from, to } = seg;
    const currentRatio = seg.length / totalLength;
    if (t >= startRatio && t <= startRatio + currentRatio) {
      angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
      break;
    }
    startRatio += currentRatio;
  }
  return angle;
}
