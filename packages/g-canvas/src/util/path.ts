/**
 * @fileoverview path 的一些工具
 * @author dxq613@gmail.com
 */
import getArcParams from './arc-params';
import QuadUtil from '@antv/g-math/lib/quadratic';
import CubicUtil from '@antv/g-math/lib/cubic';
import EllipseArcUtil from '@antv/g-math/lib/arc';
import { getBBoxByArray } from '@antv/g-math/lib/util';
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
  let currentPoint = [0, 0]; // 当前图形
  let startMovePoint = [0, 0]; // 开始 M 的点，可能会有多个
  const count = path.length;
  for (let i = 0; i < count; i++) {
    const params = path[i];
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
        break;
      case 'A':
        const arcParams = getArcParams(currentPoint, params);
        segment['arcParams'] = arcParams;
        break;
      default:
        break;
    }
    // 有了 Z 后，当前节点从开始 M 的点开始
    if (command === 'Z') {
      currentPoint = startMovePoint;
    } else {
      const len = params.length;
      currentPoint = [params[len - 2], params[len - 1]];
    }
    segment['currentPoint'] = currentPoint;
    segments.push(segment);
  }
  return segments;
}

function getPathBox(segments) {
  let xArr = [];
  let yArr = [];
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
  }
  // bbox calculation should ignore NaN for path attribute
  // ref: https://github.com/antvis/g/issues/210
  xArr = xArr.filter((item) => !Number.isNaN(item));
  yArr = yArr.filter((item) => !Number.isNaN(item));
  return getBBoxByArray(xArr, yArr);
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
