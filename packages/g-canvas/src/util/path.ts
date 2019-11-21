/**
 * @fileoverview path 的一些工具
 * @author dxq613@gmail.com
 */
import getArcParams from './arc-params';
import QuadUtil from '@antv/g-math/lib/quadratic';
import CubicUtil from '@antv/g-math/lib/cubic';
import EllipseArcUtil from '@antv/g-math/lib/arc';
import { inBox } from './util';
import inLine from './in-stroke/line';
import inArc from './in-stroke/arc';

import * as mat3 from '@antv/gl-matrix/lib/gl-matrix/mat3';
import * as vec3 from '@antv/gl-matrix/lib/gl-matrix/vec3';

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

function getSegments(path) {
  const segments = [];
  let currentPoint = null; // 当前图形
  let nextParams = null; // 下一节点的 path 参数
  let startMovePoint = null; // 开始 M 的点，可能会有多个
  let lastStartMovePointIndex = 0; // 最近一个开始点 M 的索引
  const count = path.length;
  for (let i = 0; i < count; i++) {
    const params = path[i];
    nextParams = path[i + 1];
    const command = params[0];
    // 数学定义上的参数，便于后面的计算
    const segment = {
      command,
      prePoint: currentPoint,
      params,
    };
    switch (command) {
      case 'M':
        startMovePoint = [params[1], params[2]];
        lastStartMovePointIndex = i;
        break;
      case 'A':
        const arcParams = getArcParams(currentPoint, params);
        segment['arcParams'] = arcParams;
        break;
      default:
        break;
    }
    if (command === 'Z') {
      // 有了 Z 后，当前节点从开始 M 的点开始
      currentPoint = startMovePoint;
      // 如果当前点的命令为 Z，相当于当前点为最近一个 M 点，则下一个点直接指向最近一个 M 点的下一个点
      nextParams = path[lastStartMovePointIndex + 1];
    } else {
      const len = params.length;
      currentPoint = [params[len - 2], params[len - 1]];
    }
    if (nextParams && nextParams[0] === 'Z') {
      // 如果下一个点的命令为 Z，则下一个点直接指向最近一个 M 点
      nextParams = path[lastStartMovePointIndex];
      if (segments[lastStartMovePointIndex]) {
        // 如果下一个点的命令为 Z，则最近一个 M 点的前一个点为当前点
        segments[lastStartMovePointIndex].prePoint = currentPoint;
      }
    }
    segment['currentPoint'] = currentPoint;
    // 如果当前点与最近一个 M 点相同，则最近一个 M 点的前一个点为当前点的前一个点
    if (
      segments[lastStartMovePointIndex] &&
      isSamePoint(currentPoint, segments[lastStartMovePointIndex].currentPoint)
    ) {
      segments[lastStartMovePointIndex].prePoint = segment.prePoint;
    }
    const nextPoint = nextParams ? [nextParams[nextParams.length - 2], nextParams[nextParams.length - 1]] : null;
    segment['nextPoint'] = nextPoint;
    segments.push(segment);
  }
  return segments;
}

function getPathBox(segments, lineWidth) {
  let xArr = [];
  let yArr = [];
  const segmentsWithAngle = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const { currentPoint, params, prePoint } = segment;
    let box;
    switch (segment.command) {
      case 'Q':
        box = QuadUtil.box(prePoint[0], prePoint[1], params[1], params[2], params[3], params[4]);
        break;
      case 'C':
        box = CubicUtil.box(prePoint[0], prePoint[1], params[1], params[2], params[3], params[4], params[5], params[6]);
        break;
      case 'A':
        const arcParams = segment.arcParams;
        box = EllipseArcUtil.box(
          arcParams.cx,
          arcParams.cy,
          arcParams.rx,
          arcParams.ry,
          arcParams.xRotation,
          arcParams.startAngle,
          arcParams.endAngle
        );
        break;
      default:
        xArr.push(currentPoint[0]);
        yArr.push(currentPoint[1]);
        break;
    }
    if (box) {
      segment.box = box;
      xArr.push(box.x, box.x + box.width);
      yArr.push(box.y, box.y + box.height);
    }
    if ((segment.command === 'L' || segment.command === 'M') && segment.prePoint && segment.nextPoint) {
      segmentsWithAngle.push(segment);
    }
  }
  // bbox calculation should ignore NaN for path attribute
  // ref: https://github.com/antvis/g/issues/210
  xArr = xArr.filter((item) => !Number.isNaN(item));
  yArr = yArr.filter((item) => !Number.isNaN(item));
  let minX = Math.min.apply(null, xArr);
  let minY = Math.min.apply(null, yArr);
  let maxX = Math.max.apply(null, xArr);
  let maxY = Math.max.apply(null, yArr);
  if (segmentsWithAngle.length === 0) {
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  for (let i = 0; i < segmentsWithAngle.length; i++) {
    const segment = segmentsWithAngle[i];
    const { currentPoint } = segment;
    let extra;
    if (currentPoint[0] === minX) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      minX = minX - extra.xExtra;
    } else if (currentPoint[0] === maxX) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      maxX = maxX + extra.xExtra;
    }
    if (currentPoint[1] === minY) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      minY = minY - extra.yExtra;
    } else if (currentPoint[1] === maxY) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      maxY = maxY + extra.yExtra;
    }
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// 判断两个点是否重合
function isSamePoint(point1, point2) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

// 获取 L segment 的外尖角与内夹角的距离 + 二分之一线宽
function getExtraFromSegmentWithAngle(segment, lineWidth) {
  const { prePoint, currentPoint, nextPoint } = segment;
  const currentAndPre = Math.pow(currentPoint[0] - prePoint[0], 2) + Math.pow(currentPoint[1] - prePoint[1], 2);
  const currentAndNext = Math.pow(currentPoint[0] - nextPoint[0], 2) + Math.pow(currentPoint[1] - nextPoint[1], 2);
  const preAndNext = Math.pow(prePoint[0] - nextPoint[0], 2) + Math.pow(prePoint[1] - nextPoint[1], 2);
  // 以 currentPoint 为顶点的夹角
  const currentAngle = Math.acos(
    (currentAndPre + currentAndNext - preAndNext) / (2 * Math.sqrt(currentAndPre) * Math.sqrt(currentAndNext))
  );
  // 夹角为空、 0 或 PI 时，不需要计算夹角处的额外宽度
  if (!currentAngle || Math.sin(currentAngle) === 0) {
    return {
      xExtra: 0,
      yExtra: 0,
    };
  }
  let xAngle = Math.abs(Math.atan2(nextPoint[1] - currentPoint[1], nextPoint[0] - currentPoint[0]));
  let yAngle = Math.abs(Math.atan2(nextPoint[0] - currentPoint[0], nextPoint[1] - currentPoint[1]));
  // 将夹角转为锐角
  xAngle = xAngle > Math.PI / 2 ? Math.PI - xAngle : xAngle;
  yAngle = yAngle > Math.PI / 2 ? Math.PI - yAngle : yAngle;
  // 这里不考虑在水平和垂直方向的投影，直接使用最大差值
  // 由于上层统一加减了二分之一线宽，这里需要进行弥补
  const extra = {
    // 水平方向投影
    xExtra:
      Math.cos(currentAngle / 2 - xAngle) * ((lineWidth / 2) * (1 / Math.sin(currentAngle / 2))) - lineWidth / 2 || 0,
    // 垂直方向投影
    yExtra:
      Math.cos(yAngle - currentAngle / 2) * ((lineWidth / 2) * (1 / Math.sin(currentAngle / 2))) - lineWidth / 2 || 0,
  };
  return extra;
}

function isPointInStroke(segments, lineWidth, x, y) {
  let isHit = false;
  const halfWidth = lineWidth / 2;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const { currentPoint, params, prePoint, box } = segment;
    // 如果在前面已经生成过包围盒，直接按照包围盒计算
    if (box && !inBox(box.x - halfWidth, box.y - halfWidth, box.width + lineWidth, box.height + lineWidth, x, y)) {
      continue;
    }
    switch (segment.command) {
      // L 和 Z 都是直线， M 不进行拾取
      case 'L':
      case 'Z':
        isHit = inLine(prePoint[0], prePoint[1], currentPoint[0], currentPoint[1], lineWidth, x, y);
        break;
      case 'Q':
        const qDistance = QuadUtil.pointDistance(
          prePoint[0],
          prePoint[1],
          params[1],
          params[2],
          params[3],
          params[4],
          x,
          y
        );
        isHit = qDistance <= lineWidth / 2;
        break;
      case 'C':
        const cDistance = CubicUtil.pointDistance(
          prePoint[0],
          prePoint[1],
          params[1],
          params[2],
          params[3],
          params[4],
          params[5],
          params[6],
          x,
          y
        );
        isHit = cDistance <= lineWidth / 2;
        break;
      case 'A':
        // 计算点到椭圆圆弧的距离，暂时使用近似算法，后面可以改成切割法求最近距离
        const arcParams = segment.arcParams;
        const { cx, cy, rx, ry, startAngle, endAngle, xRotation } = arcParams;
        const p = [x, y, 1];
        const m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
        const r = rx > ry ? rx : ry;
        const scaleX = rx > ry ? 1 : rx / ry;
        const scaleY = rx > ry ? ry / rx : 1;
        mat3.translate(m, m, [-cx, -cy]);
        mat3.rotate(m, m, -xRotation);
        mat3.scale(m, m, [1 / scaleX, 1 / scaleY]);
        vec3.transformMat3(p, p, m);
        isHit = inArc(0, 0, r, startAngle, endAngle, lineWidth, p[0], p[1]);
        break;
      default:
        break;
    }
    if (isHit) {
      break;
    }
  }
  return isHit;
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
  // 说明 points 未放入 polygons 或者 polyline
  // 仅当只有一个 M，没有 Z 时会发生这种情况
  if (points.length > 0) {
    polylines.push(points);
  }
  return {
    polygons,
    polylines,
  };
}

export default {
  hasArc,
  extractPolygons,
  getSegments,
  getPathBox,
  isPointInStroke,
};
