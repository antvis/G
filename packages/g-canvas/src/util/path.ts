/**
 * @fileoverview path 的一些工具
 * @author dxq613@gmail.com
 */

function hasArc(path) {
  let hasArc = false;
  const count = path.length;
  for (let i = 0; i < count; i++) {
    const params = path[i];
    const cmd = params[0];
    if (cmd === 'C' || cmd === 'A' || cmd === 'Q') {
      hasArc = true;
      break;
    }
  }
  return hasArc;
}

// 获取 path 的类型，便于实现快速拾取
function getPathType(path) {
  let type = 'mix'; // 混合的 path ,不但有 L，也有 Q,C,A
  let hasArc = false;
  let zCount = 0;
  let mCount = 0;
  const count = path.length;
  for (let i = 0; i < count; i++) {
    const params = path[i];
    switch (params[0]) {
      case 'M':
        mCount++;
        break;
      case 'Q':
      case 'C':
      case 'A':
        hasArc = true;
        break;
      case 'Z':
        zCount++;
        break;
      default:
        break;
    }
  }
  if (!hasArc) {
    if (mCount === 1 && path[0][0] === 'M') {
      if (zCount === 1 && path[count - 1][0] === 'Z') {
        // 只有一个 M，一个 Z 则是polygon
        type = 'polygon';
      } else if (zCount === 0) {
        type = 'polyline';
      }
    } else if (mCount === zCount) {
      type = 'polygons';
    } else if (mCount > 1 && zCount === 0) {
      type = 'lines';
    }
  }
  return type;
}

/**
 * 提取出内部的闭合多边形和非闭合的多边形，假设 path 不存在圆弧
 * @param {Array} path 路径
 * @returns {Array} 点的集合
 */
function extractPolygons(path) {
  const count = path.length;
  const polygons = [];
  const polylines = [];
  let points = []; // 防止第一个命令不是 'M'
  for (let i = 0; i < count; i++) {
    const params = path[i];
    const cmd = params[0];
    if (cmd === 'M') {
      // 遇到 'M' 判定是否是新数组，新数组中没有点
      if (points.length) {
        // 如果存在点，则说明没有遇到 'Z'，开始了一个新的多边形
        polylines.push(points);
        points = []; // 创建新的点
      }
      points.push([params[1], params[2]]);
    } else if (cmd === 'Z') {
      if (points.length) {
        // 存在点
        polygons.push(points);
        points = []; // 开始新的点集合
      }
      // 如果不存在点，同时 'Z'，则说明是错误，不处理
    } else {
      points.push([params[1], params[2]]);
    }
  }
  return {
    polygons,
    polylines,
  };
}

export default {
  hasArc,
  extractPolygons,
};
