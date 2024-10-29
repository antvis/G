/**
 * implements morph animation with cubic splitting
 * @see http://thednp.github.io/kute.js/svgCubicMorph.html
 */
import { arcBox, cubicBox, polylineLength, quadBox } from '@antv/g-math';
import type { AbsoluteArray, ASegment } from '@antv/util';
import {
  clamp,
  getTotalLength,
  isNumberEqual,
  max,
  min,
  mod,
} from '@antv/util';
import { mat4, vec3 } from 'gl-matrix';
import type {
  Circle,
  Ellipse,
  Line,
  Path,
  PathArcParams,
  PathSegment,
  PathSegmentBBox,
  Polygon,
  Polyline,
  Rect,
} from '../display-objects';
import type { PointLike } from '../shapes';
import { Shape } from '../types';
import { deg2rad } from './math';

export function getOrCalculatePathTotalLength(path: Path) {
  if (path.parsedStyle.d.totalLength === 0) {
    path.parsedStyle.d.totalLength = getTotalLength(
      path.parsedStyle.d.absolutePath,
    );
  }
  return path.parsedStyle.d.totalLength;
}

export function getOrCalculatePolylineTotalLength(polyline: Polyline) {
  if (polyline.parsedStyle.points.totalLength === 0) {
    polyline.parsedStyle.points.totalLength = polylineLength(
      polyline.parsedStyle.points.points as [number, number][],
    );
  }
  return polyline.parsedStyle.points.totalLength;
}

export function removeRedundantMCommand(path: AbsoluteArray) {
  for (let i = 0; i < path.length; i++) {
    const prevSegment = path[i - 1];
    const segment = path[i];
    const cmd = segment[0];
    if (cmd === 'M') {
      if (prevSegment) {
        const prevCmd = prevSegment[0];
        const srcPoint = [segment[1], segment[2]];
        let destPoint: [number, number];

        if (prevCmd === 'L' || prevCmd === 'M') {
          destPoint = [prevSegment[1], prevSegment[2]];
        } else if (prevCmd === 'C' || prevCmd === 'A' || prevCmd === 'Q') {
          destPoint = [
            prevSegment[prevSegment.length - 2] as number,
            prevSegment[prevSegment.length - 1] as number,
          ];
        }

        if (destPoint && isSamePoint(srcPoint, destPoint)) {
          path.splice(i, 1);
          i--;
        }
      }
    }
  }
}

export function hasArcOrBezier(path: AbsoluteArray) {
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

export function extractPolygons(pathArray: AbsoluteArray) {
  const polygons: [number, number][][] = [];
  const polylines: [number, number][][] = [];
  let points: [number, number][] = []; // 防止第一个命令不是 'M'
  for (let i = 0; i < pathArray.length; i++) {
    const params = pathArray[i];
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

function isSamePoint(point1, point2) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

export function getPathBBox(segments: any[], lineWidth: number) {
  let xArr = [];
  let yArr = [];
  const segmentsWithAngle = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const { currentPoint, params, prePoint } = segment;
    let box: PathSegmentBBox;
    switch (segment.command) {
      case 'Q':
        box = quadBox(
          prePoint[0],
          prePoint[1],
          params[1],
          params[2],
          params[3],
          params[4],
        );
        break;
      case 'C':
        box = cubicBox(
          prePoint[0],
          prePoint[1],
          params[1],
          params[2],
          params[3],
          params[4],
          params[5],
          params[6],
        );
        break;
      case 'A':
        const { arcParams } = segment;
        box = arcBox(
          arcParams.cx,
          arcParams.cy,
          arcParams.rx,
          arcParams.ry,
          arcParams.xRotation,
          arcParams.startAngle,
          arcParams.endAngle,
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
    if (
      lineWidth &&
      (segment.command === 'L' || segment.command === 'M') &&
      segment.prePoint &&
      segment.nextPoint
    ) {
      segmentsWithAngle.push(segment);
    }
  }
  // bbox calculation should ignore NaN for path attribute
  // ref: https://github.com/antvis/g/issues/210
  // ref: https://github.com/antvis/G2/issues/3109
  xArr = xArr.filter(
    (item) => !Number.isNaN(item) && item !== Infinity && item !== -Infinity,
  );
  yArr = yArr.filter(
    (item) => !Number.isNaN(item) && item !== Infinity && item !== -Infinity,
  );
  let minX = min(xArr);
  let minY = min(yArr);
  let maxX = max(xArr);
  let maxY = max(yArr);
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
      minX -= extra.xExtra;
    } else if (currentPoint[0] === maxX) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      maxX += extra.xExtra;
    }
    if (currentPoint[1] === minY) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      minY -= extra.yExtra;
    } else if (currentPoint[1] === maxY) {
      extra = getExtraFromSegmentWithAngle(segment, lineWidth);
      maxY += extra.yExtra;
    }
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getExtraFromSegmentWithAngle(segment, lineWidth: number) {
  const { prePoint, currentPoint, nextPoint } = segment;
  const currentAndPre =
    (currentPoint[0] - prePoint[0]) ** 2 + (currentPoint[1] - prePoint[1]) ** 2;
  const currentAndNext =
    (currentPoint[0] - nextPoint[0]) ** 2 +
    (currentPoint[1] - nextPoint[1]) ** 2;
  const preAndNext =
    (prePoint[0] - nextPoint[0]) ** 2 + (prePoint[1] - nextPoint[1]) ** 2;
  // 以 currentPoint 为顶点的夹角
  const currentAngle = Math.acos(
    (currentAndPre + currentAndNext - preAndNext) /
      (2 * Math.sqrt(currentAndPre) * Math.sqrt(currentAndNext)),
  );
  // 夹角为空、 0 或 PI 时，不需要计算夹角处的额外宽度
  // 注意: 由于计算精度问题，夹角为 0 的情况计算出来的角度可能是一个很小的值，还需要判断其与 0 是否近似相等
  if (
    !currentAngle ||
    Math.sin(currentAngle) === 0 ||
    isNumberEqual(currentAngle, 0)
  ) {
    return {
      xExtra: 0,
      yExtra: 0,
    };
  }
  let xAngle = Math.abs(
    Math.atan2(nextPoint[1] - currentPoint[1], nextPoint[0] - currentPoint[0]),
  );
  let yAngle = Math.abs(
    Math.atan2(nextPoint[0] - currentPoint[0], nextPoint[1] - currentPoint[1]),
  );
  // 将夹角转为锐角
  xAngle = xAngle > Math.PI / 2 ? Math.PI - xAngle : xAngle;
  yAngle = yAngle > Math.PI / 2 ? Math.PI - yAngle : yAngle;
  // 这里不考虑在水平和垂直方向的投影，直接使用最大差值
  // 由于上层统一加减了二分之一线宽，这里需要进行弥补
  const extra = {
    // 水平方向投影
    xExtra:
      Math.cos(currentAngle / 2 - xAngle) *
        ((lineWidth / 2) * (1 / Math.sin(currentAngle / 2))) -
        lineWidth / 2 || 0,
    // 垂直方向投影
    yExtra:
      Math.cos(yAngle - currentAngle / 2) *
        ((lineWidth / 2) * (1 / Math.sin(currentAngle / 2))) -
        lineWidth / 2 || 0,
  };
  return extra;
}

// 点对称
function toSymmetry(point: number[], center: number[]) {
  return [
    center[0] + (center[0] - point[0]),
    center[1] + (center[1] - point[1]),
  ];
}

const angleBetween = (v0: PointLike, v1: PointLike) => {
  const p = v0.x * v1.x + v0.y * v1.y;
  const n = Math.sqrt((v0.x ** 2 + v0.y ** 2) * (v1.x ** 2 + v1.y ** 2));
  const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
  const angle = sign * Math.acos(p / n);

  return angle;
};
interface PointOnEllipticalArc {
  x: number;
  y: number;
  ellipticalArcAngle: number;
}
/**
 * @see https://github.com/rveciana/svg-path-properties/blob/b6bd9a322966f6ef7a311872d80c56e3718de861/src/arc.ts#L121
 */
const pointOnEllipticalArc = (
  p0: PointLike,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArcFlag: boolean,
  sweepFlag: boolean,
  p1: PointLike,
  t: number,
): PointOnEllipticalArc => {
  // In accordance to: http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  xAxisRotation = mod(xAxisRotation, 360);
  const xAxisRotationRadians = deg2rad(xAxisRotation);
  // If the endpoints are identical, then this is equivalent to omitting the elliptical arc segment entirely.
  if (p0.x === p1.x && p0.y === p1.y) {
    return { x: p0.x, y: p0.y, ellipticalArcAngle: 0 }; // Check if angle is correct
  }

  // If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.
  if (rx === 0 || ry === 0) {
    // return this.pointOnLine(p0, p1, t);
    return { x: 0, y: 0, ellipticalArcAngle: 0 }; // Check if angle is correct
  }

  // Following "Conversion from endpoint to center parameterization"
  // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter

  // Step #1: Compute transformedPoint
  const dx = (p0.x - p1.x) / 2;
  const dy = (p0.y - p1.y) / 2;
  const transformedPoint = {
    x:
      Math.cos(xAxisRotationRadians) * dx + Math.sin(xAxisRotationRadians) * dy,
    y:
      -Math.sin(xAxisRotationRadians) * dx +
      Math.cos(xAxisRotationRadians) * dy,
  };
  // Ensure radii are large enough
  const radiiCheck =
    transformedPoint.x ** 2 / rx ** 2 + transformedPoint.y ** 2 / ry ** 2;
  if (radiiCheck > 1) {
    rx *= Math.sqrt(radiiCheck);
    ry *= Math.sqrt(radiiCheck);
  }

  // Step #2: Compute transformedCenter
  const cSquareNumerator =
    rx ** 2 * ry ** 2 -
    rx ** 2 * transformedPoint.y ** 2 -
    ry ** 2 * transformedPoint.x ** 2;
  const cSquareRootDenom =
    rx ** 2 * transformedPoint.y ** 2 + ry ** 2 * transformedPoint.x ** 2;
  let cRadicand = cSquareNumerator / cSquareRootDenom;
  // Make sure this never drops below zero because of precision
  cRadicand = cRadicand < 0 ? 0 : cRadicand;
  const cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
  const transformedCenter = {
    x: cCoef * ((rx * transformedPoint.y) / ry),
    y: cCoef * (-(ry * transformedPoint.x) / rx),
  };

  // Step #3: Compute center
  const center = {
    x:
      Math.cos(xAxisRotationRadians) * transformedCenter.x -
      Math.sin(xAxisRotationRadians) * transformedCenter.y +
      (p0.x + p1.x) / 2,
    y:
      Math.sin(xAxisRotationRadians) * transformedCenter.x +
      Math.cos(xAxisRotationRadians) * transformedCenter.y +
      (p0.y + p1.y) / 2,
  };

  // Step #4: Compute start/sweep angles
  // Start angle of the elliptical arc prior to the stretch and rotate operations.
  // Difference between the start and end angles
  const startVector = {
    x: (transformedPoint.x - transformedCenter.x) / rx,
    y: (transformedPoint.y - transformedCenter.y) / ry,
  };
  const startAngle = angleBetween(
    {
      x: 1,
      y: 0,
    },
    startVector,
  );

  const endVector = {
    x: (-transformedPoint.x - transformedCenter.x) / rx,
    y: (-transformedPoint.y - transformedCenter.y) / ry,
  };
  let sweepAngle = angleBetween(startVector, endVector);

  if (!sweepFlag && sweepAngle > 0) {
    sweepAngle -= 2 * Math.PI;
  } else if (sweepFlag && sweepAngle < 0) {
    sweepAngle += 2 * Math.PI;
  }
  // We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
  sweepAngle %= 2 * Math.PI;

  // From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
  const angle = startAngle + sweepAngle * t;
  const ellipseComponentX = rx * Math.cos(angle);
  const ellipseComponentY = ry * Math.sin(angle);

  const point = {
    x:
      Math.cos(xAxisRotationRadians) * ellipseComponentX -
      Math.sin(xAxisRotationRadians) * ellipseComponentY +
      center.x,
    y:
      Math.sin(xAxisRotationRadians) * ellipseComponentX +
      Math.cos(xAxisRotationRadians) * ellipseComponentY +
      center.y,
    ellipticalArcStartAngle: startAngle,
    ellipticalArcEndAngle: startAngle + sweepAngle,
    ellipticalArcAngle: angle,
    ellipticalArcCenter: center,
    resultantRx: rx,
    resultantRy: ry,
  };

  return point;
};

export function path2Segments(path: AbsoluteArray): PathSegment[] {
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
    const segment: PathSegment = {
      command,
      prePoint: currentPoint,
      params,
      startTangent: null,
      endTangent: null,
      currentPoint: null,
      nextPoint: null,
      arcParams: null,
      box: null,
      cubicParams: null,
    };
    switch (command) {
      case 'M':
        startMovePoint = [params[1], params[2]];
        lastStartMovePointIndex = i;
        break;
      case 'A':
        const arcParams = getArcParams(currentPoint, params);
        segment.arcParams = arcParams;
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
    segment.currentPoint = currentPoint;
    // 如果当前点与最近一个 M 点相同，则最近一个 M 点的前一个点为当前点的前一个点
    if (
      segments[lastStartMovePointIndex] &&
      isSamePoint(currentPoint, segments[lastStartMovePointIndex].currentPoint)
    ) {
      segments[lastStartMovePointIndex].prePoint = segment.prePoint;
    }
    const nextPoint = nextParams
      ? [nextParams[nextParams.length - 2], nextParams[nextParams.length - 1]]
      : null;
    segment.nextPoint = nextPoint as [number, number];
    // Add startTangent and endTangent
    const { prePoint } = segment;
    if (['L', 'H', 'V'].includes(command)) {
      segment.startTangent = [
        prePoint[0] - currentPoint[0],
        prePoint[1] - currentPoint[1],
      ];
      segment.endTangent = [
        currentPoint[0] - prePoint[0],
        currentPoint[1] - prePoint[1],
      ];
    } else if (command === 'Q') {
      // 二次贝塞尔曲线只有一个控制点
      const cp = [params[1], params[2]];
      // 二次贝塞尔曲线的终点为 currentPoint
      segment.startTangent = [prePoint[0] - cp[0], prePoint[1] - cp[1]];
      segment.endTangent = [currentPoint[0] - cp[0], currentPoint[1] - cp[1]];
    } else if (command === 'T') {
      const preSegment = segments[i - 1];
      const cp = toSymmetry(preSegment.currentPoint, prePoint);
      if (preSegment.command === 'Q') {
        segment.command = 'Q';
        segment.startTangent = [prePoint[0] - cp[0], prePoint[1] - cp[1]];
        segment.endTangent = [currentPoint[0] - cp[0], currentPoint[1] - cp[1]];
      } else {
        // @ts-ignore
        segment.command = 'TL';
        segment.startTangent = [
          prePoint[0] - currentPoint[0],
          prePoint[1] - currentPoint[1],
        ];
        segment.endTangent = [
          currentPoint[0] - prePoint[0],
          currentPoint[1] - prePoint[1],
        ];
      }
    } else if (command === 'C') {
      // 三次贝塞尔曲线有两个控制点
      const cp1 = [params[1], params[2]];
      const cp2 = [params[3], params[4]];
      segment.startTangent = [prePoint[0] - cp1[0], prePoint[1] - cp1[1]];
      segment.endTangent = [currentPoint[0] - cp2[0], currentPoint[1] - cp2[1]];

      // horizontal line, eg. ['C', 100, 100, 100, 100, 200, 200]
      if (segment.startTangent[0] === 0 && segment.startTangent[1] === 0) {
        segment.startTangent = [cp1[0] - cp2[0], cp1[1] - cp2[1]];
      }
      if (segment.endTangent[0] === 0 && segment.endTangent[1] === 0) {
        segment.endTangent = [cp2[0] - cp1[0], cp2[1] - cp1[1]];
      }
    } else if (command === 'S') {
      const preSegment = segments[i - 1];
      const cp1 = toSymmetry(preSegment.currentPoint, prePoint);
      const cp2 = [params[1], params[2]];
      if (preSegment.command === 'C') {
        segment.command = 'C'; // 将 S 命令变换为 C 命令
        segment.startTangent = [prePoint[0] - cp1[0], prePoint[1] - cp1[1]];
        segment.endTangent = [
          currentPoint[0] - cp2[0],
          currentPoint[1] - cp2[1],
        ];
      } else {
        // @ts-ignore
        segment.command = 'SQ'; // 将 S 命令变换为 SQ 命令
        segment.startTangent = [prePoint[0] - cp2[0], prePoint[1] - cp2[1]];
        segment.endTangent = [
          currentPoint[0] - cp2[0],
          currentPoint[1] - cp2[1],
        ];
      }
    } else if (command === 'A') {
      const { x: dx1, y: dy1 } = getTangentAtRatio(segment, 0);
      const { x: dx2, y: dy2 } = getTangentAtRatio(segment, 1, false);

      segment.startTangent = [dx1, dy1];
      segment.endTangent = [dx2, dy2];
    }
    segments.push(segment);
  }
  return segments;
}

/**
 * Use length instead of ratio
 */
function getTangentAtRatio(segment: PathSegment, ratio: number, sign = true) {
  const { rx = 0, ry = 0, xRotation, arcFlag, sweepFlag } = segment.arcParams;
  const p1 = pointOnEllipticalArc(
    { x: segment.prePoint[0], y: segment.prePoint[1] },
    rx,
    ry,
    xRotation,
    !!arcFlag,
    !!sweepFlag,
    { x: segment.currentPoint[0], y: segment.currentPoint[1] },
    ratio,
  );

  const p2 = pointOnEllipticalArc(
    { x: segment.prePoint[0], y: segment.prePoint[1] },
    rx,
    ry,
    xRotation,
    !!arcFlag,
    !!sweepFlag,
    { x: segment.currentPoint[0], y: segment.currentPoint[1] },
    sign ? ratio + 0.005 : ratio - 0.005,
  );

  const xDist = p2.x - p1.x;
  const yDist = p2.y - p1.y;

  const dist = Math.sqrt(xDist * xDist + yDist * yDist);
  return { x: -xDist / dist, y: -yDist / dist };
}

// 向量长度
function vMag(v: number[]) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

// u.v/|u||v|，计算夹角的余弦值
function vRatio(u: number[], v: number[]) {
  // 当存在一个向量的长度为 0 时，夹角也为 0，即夹角的余弦值为 1
  return vMag(u) * vMag(v)
    ? (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v))
    : 1;
}

// 向量角度
function vAngle(u: number[], v: number[]) {
  return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
}

function getArcParams(
  startPoint: [number, number],
  params: ASegment,
): PathArcParams {
  let rx = params[1];
  let ry = params[2];
  const xRotation = mod(deg2rad(params[3]), Math.PI * 2);
  const arcFlag = params[4];
  const sweepFlag = params[5];
  // 弧形起点坐标
  const x1 = startPoint[0];
  const y1 = startPoint[1];
  // 弧形终点坐标
  const x2 = params[6];
  const y2 = params[7];
  const xp =
    (Math.cos(xRotation) * (x1 - x2)) / 2.0 +
    (Math.sin(xRotation) * (y1 - y2)) / 2.0;
  const yp =
    (-1 * Math.sin(xRotation) * (x1 - x2)) / 2.0 +
    (Math.cos(xRotation) * (y1 - y2)) / 2.0;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const diff = rx * rx * (yp * yp) + ry * ry * (xp * xp);

  let f = diff ? Math.sqrt((rx * rx * (ry * ry) - diff) / diff) : 1;

  if (arcFlag === sweepFlag) {
    f *= -1;
  }
  if (isNaN(f)) {
    f = 0;
  }

  // 旋转前的起点坐标，且当长半轴和短半轴的长度为 0 时，坐标按 (0, 0) 处理
  const cxp = ry ? (f * rx * yp) / ry : 0;
  const cyp = rx ? (f * -ry * xp) / rx : 0;

  // 椭圆圆心坐标
  const cx =
    (x1 + x2) / 2.0 + Math.cos(xRotation) * cxp - Math.sin(xRotation) * cyp;
  const cy =
    (y1 + y2) / 2.0 + Math.sin(xRotation) * cxp + Math.cos(xRotation) * cyp;

  // 起始点的单位向量
  const u = [(xp - cxp) / rx, (yp - cyp) / ry];
  // 终止点的单位向量
  const v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
  // 计算起始点和圆心的连线，与 x 轴正方向的夹角
  const theta = vAngle([1, 0], u);

  // 计算圆弧起始点和终止点与椭圆圆心连线的夹角
  let dTheta = vAngle(u, v);

  if (vRatio(u, v) <= -1) {
    dTheta = Math.PI;
  }
  if (vRatio(u, v) >= 1) {
    dTheta = 0;
  }
  if (sweepFlag === 0 && dTheta > 0) {
    dTheta -= 2 * Math.PI;
  }
  if (sweepFlag === 1 && dTheta < 0) {
    dTheta += 2 * Math.PI;
  }
  return {
    cx,
    cy,
    // 弧形的起点和终点相同时，长轴和短轴的长度按 0 处理
    rx: isSamePoint(startPoint, [x2, y2]) ? 0 : rx,
    ry: isSamePoint(startPoint, [x2, y2]) ? 0 : ry,
    startAngle: theta,
    endAngle: theta + dTheta,
    xRotation,
    arcFlag,
    sweepFlag,
  };
}

function commandsToPathString(
  commands: AbsoluteArray,
  object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
  transform?: mat4,
) {
  return commands.reduce((prev, cur) => {
    let path = '';
    if (cur[0] === 'M' || cur[0] === 'L') {
      const p = vec3.fromValues(cur[1], cur[2], 0);

      if (transform) {
        vec3.transformMat4(p, p, transform);
      }

      path = `${cur[0]}${p[0]},${p[1]}`;
    } else if (cur[0] === 'Z') {
      path = cur[0];
    } else if (cur[0] === 'C') {
      const p1 = vec3.fromValues(cur[1], cur[2], 0);
      const p2 = vec3.fromValues(cur[3], cur[4], 0);
      const p3 = vec3.fromValues(cur[5], cur[6], 0);

      if (transform) {
        vec3.transformMat4(p1, p1, transform);
        vec3.transformMat4(p2, p2, transform);
        vec3.transformMat4(p3, p3, transform);
      }

      path = `${cur[0]}${p1[0]},${p1[1]},${p2[0]},${p2[1]},${p3[0]},${p3[1]}`;
    } else if (cur[0] === 'A') {
      const c = vec3.fromValues(cur[6], cur[7], 0);
      if (transform) {
        vec3.transformMat4(c, c, transform);
      }
      path = `${cur[0]}${cur[1]},${cur[2]},${cur[3]},${cur[4]},${cur[5]},${c[0]},${c[1]}`;
    } else if (cur[0] === 'Q') {
      const p1 = vec3.fromValues(cur[1], cur[2], 0);
      const p2 = vec3.fromValues(cur[3], cur[4], 0);
      if (transform) {
        vec3.transformMat4(p1, p1, transform);
        vec3.transformMat4(p2, p2, transform);
      }
      path = `${cur[0]}${cur[1]},${cur[2]},${cur[3]},${cur[4]}}`;
    }

    return (prev += path);
  }, '');
}

function lineToCommands(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): AbsoluteArray {
  return [
    ['M', x1, y1],
    ['L', x2, y2],
  ];
}

function ellipseToCommands(
  rx: number,
  ry: number,
  cx: number,
  cy: number,
): AbsoluteArray {
  const factor = ((-1 + Math.sqrt(2)) / 3) * 4;
  const dx = rx * factor;
  const dy = ry * factor;
  const left = cx - rx;
  const right = cx + rx;
  const top = cy - ry;
  const bottom = cy + ry;

  return [
    ['M', left, cy],
    ['C', left, cy - dy, cx - dx, top, cx, top],
    ['C', cx + dx, top, right, cy - dy, right, cy],
    ['C', right, cy + dy, cx + dx, bottom, cx, bottom],
    ['C', cx - dx, bottom, left, cy + dy, left, cy],
    ['Z'],
  ];
}

function polygonToCommands(
  points: ([number, number] | [number, number, number])[],
  closed: boolean,
): AbsoluteArray {
  const result = points.map((point, i) => {
    return [i === 0 ? 'M' : 'L', point[0], point[1]];
  });

  if (closed) {
    result.push(['Z']);
  }

  return result as AbsoluteArray;
}

function rectToCommands(
  width: number,
  height: number,
  x: number,
  y: number,
  radius?: [number, number, number, number],
): AbsoluteArray {
  // @see https://gist.github.com/danielpquinn/dd966af424030d47e476
  if (radius) {
    const [tlr, trr, brr, blr] = radius;
    const signX = width > 0 ? 1 : -1;
    const signY = height > 0 ? 1 : -1;
    // sweep-flag @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths#arcs
    const sweepFlag = signX + signY !== 0 ? 1 : 0;
    return [
      ['M', signX * tlr + x, y],
      ['L', width - signX * trr + x, y],
      trr ? ['A', trr, trr, 0, 0, sweepFlag, width + x, signY * trr + y] : null,
      ['L', width + x, height - signY * brr + y],
      brr
        ? ['A', brr, brr, 0, 0, sweepFlag, width + x - signX * brr, height + y]
        : null,
      ['L', x + signX * blr, height + y],
      blr
        ? ['A', blr, blr, 0, 0, sweepFlag, x, height + y - signY * blr]
        : null,
      ['L', x, signY * tlr + y],
      tlr ? ['A', tlr, tlr, 0, 0, sweepFlag, signX * tlr + x, y] : null,
      ['Z'],
    ].filter((command) => command) as AbsoluteArray;
  }

  return [
    ['M', x, y],
    ['L', x + width, y],
    ['L', x + width, y + height],
    ['L', x, y + height],
    ['Z'],
  ];
}

/**
 * convert object to path, should account for:
 * * transform & origin
 * * lineWidth
 */
export function convertToPath(
  object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
  transform: mat4 = object.getLocalTransform(),
) {
  let commands: AbsoluteArray = [] as unknown as AbsoluteArray;
  switch (object.nodeName) {
    case Shape.LINE:
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = (object as Line).parsedStyle;
      commands = lineToCommands(x1, y1, x2, y2);
      break;
    case Shape.CIRCLE: {
      const { r = 0, cx = 0, cy = 0 } = (object as Circle).parsedStyle;
      commands = ellipseToCommands(r, r, cx, cy);
      break;
    }
    case Shape.ELLIPSE: {
      const {
        rx = 0,
        ry = 0,
        cx = 0,
        cy = 0,
      } = (object as Ellipse).parsedStyle;
      commands = ellipseToCommands(rx, ry, cx, cy);
      break;
    }
    case Shape.POLYLINE:
    case Shape.POLYGON:
      const { points } = (object as Polyline).parsedStyle;
      commands = polygonToCommands(
        points.points,
        object.nodeName === Shape.POLYGON,
      );
      break;
    case Shape.RECT:
      const {
        width = 0,
        height = 0,
        x = 0,
        y = 0,
        radius,
      } = (object as Rect).parsedStyle;

      const hasRadius = radius && radius.some((r) => r !== 0);
      commands = rectToCommands(
        width,
        height,
        x,
        y,
        hasRadius &&
          (radius.map((r) =>
            clamp(r, 0, Math.min(Math.abs(width) / 2, Math.abs(height) / 2)),
          ) as [number, number, number, number]),
      );
      break;
    case Shape.PATH:
      const { absolutePath } = (object as Path).parsedStyle.d;
      commands = [...absolutePath];
      break;
  }

  if (commands.length) {
    return commandsToPathString(commands, object, transform);
  }
}

export function translatePathToString(
  absolutePath: AbsoluteArray,
  startOffsetX = 0,
  startOffsetY = 0,
  endOffsetX = 0,
  endOffsetY = 0,
) {
  const newValue = absolutePath
    .map((params, i) => {
      const command = params[0];
      const nextSegment = absolutePath[i + 1];
      const useStartOffset =
        i === 0 && (startOffsetX !== 0 || startOffsetY !== 0);
      const useEndOffset =
        (i === absolutePath.length - 1 ||
          (nextSegment &&
            (nextSegment[0] === 'M' || nextSegment[0] === 'Z'))) &&
        endOffsetX !== 0 &&
        endOffsetY !== 0;
      const [startOffsetXTemp, startOffsetYTemp] = useStartOffset
        ? [startOffsetX, startOffsetY]
        : [0, 0];
      const [endOffsetXTemp, endOffsetYTemp] = useEndOffset
        ? [endOffsetX, endOffsetY]
        : [0, 0];

      switch (command) {
        case 'M':
          return `M ${params[1] + startOffsetXTemp},${params[2] + startOffsetYTemp}`;

        case 'L':
          return `L ${params[1] + endOffsetXTemp},${
            params[2] + endOffsetYTemp
          }`;

        case 'Q':
          return `Q ${params[1]} ${params[2]},${params[3] + endOffsetXTemp} ${params[4] + endOffsetYTemp}`;

        case 'C':
          return `C ${params[1]} ${params[2]},${params[3]} ${params[4]},${params[5] + endOffsetXTemp} ${params[6] + endOffsetYTemp}`;

        case 'A':
          return `A ${params[1]} ${params[2]} ${params[3]} ${params[4]} ${params[5]} ${params[6] + endOffsetXTemp} ${params[7] + endOffsetYTemp}`;

        case 'Z':
          return 'Z';

        default:
          return null;
      }
    })
    .filter((item) => item !== null)
    .join(' ');
  if (~newValue.indexOf('NaN')) {
    return '';
  }
  return newValue;
}
