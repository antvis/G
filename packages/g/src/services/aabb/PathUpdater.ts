/* eslint-disable no-plusplus */
import { vec3 } from 'gl-matrix';
import { Quad as QuadUtil, Cubic as CubicUtil, Arc as EllipseArcUtil } from '@antv/g-math';
import { path2Absolute, path2Segments } from '@antv/path-util';
import { isNumberEqual, max, min } from '@antv/util';
import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import { pathToCurve } from '../../utils/path';
import type { PathStyleProps } from '../../shapes-type';

interface ExtraPathAttrs {
  /**
   * @readonly
   */
  hasArc: boolean;
  /**
   * @readonly
   */
  segments: any[];
  polygons: any;
  polylines: any;
  curve: any;
  totalLength: any;
  curveSegments: any;
  anchor: any;
  x: number;
  y: number;
}

type UpdateProps = PathStyleProps & ExtraPathAttrs;

@injectable()
export class PathUpdater implements GeometryAABBUpdater<UpdateProps> {
  dependencies = ['path', 'lineWidth', 'anchor'];

  update(attributes: UpdateProps, aabb: AABB) {
    // format path and add some extra attributes for later use
    const path = path2Absolute(attributes.path);
    attributes.path = path;

    const { lineWidth = 1, anchor = [0, 0] } = attributes;

    attributes.hasArc = hasArc(path);
    attributes.segments = path2Segments(path);
    const { polygons, polylines } = extractPolygons(path);
    attributes.polygons = polygons;
    attributes.polylines = polylines;
    attributes.curve = pathToCurve(path);
    const { totalLength, curveSegments } = calcLength(attributes.curve);
    attributes.totalLength = totalLength;
    attributes.curveSegments = curveSegments;

    const { x: minX, y: minY, width, height } = getPathBox(attributes.segments, lineWidth);

    // anchor is left-top by default
    attributes.x = minX + anchor[0] * width;
    attributes.y = minY + anchor[1] * height;

    console.log(minX, minY, width, width);

    const halfExtents = vec3.fromValues(width / 2, height / 2, 0);
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0],
      (1 - anchor[1] * 2) * halfExtents[1],
      0,
    );

    vec3.add(halfExtents, halfExtents, vec3.fromValues(lineWidth, lineWidth, 0));
    aabb.update(center, halfExtents);
  }
}

function getPathBox(segments: any[], lineWidth: number) {
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
        box = CubicUtil.box(
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
        // eslint-disable-next-line no-case-declarations
        const { arcParams } = segment;
        box = EllipseArcUtil.box(
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
  xArr = xArr.filter((item) => !Number.isNaN(item));
  yArr = yArr.filter((item) => !Number.isNaN(item));
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

function getExtraFromSegmentWithAngle(segment: any, lineWidth: number) {
  const { prePoint, currentPoint, nextPoint } = segment;
  const currentAndPre =
    // eslint-disable-next-line no-restricted-properties
    Math.pow(currentPoint[0] - prePoint[0], 2) + Math.pow(currentPoint[1] - prePoint[1], 2);
  const currentAndNext =
    // eslint-disable-next-line no-restricted-properties
    Math.pow(currentPoint[0] - nextPoint[0], 2) + Math.pow(currentPoint[1] - nextPoint[1], 2);
  const preAndNext =
    // eslint-disable-next-line no-restricted-properties
    Math.pow(prePoint[0] - nextPoint[0], 2) + Math.pow(prePoint[1] - nextPoint[1], 2);
  // 以 currentPoint 为顶点的夹角
  const currentAngle = Math.acos(
    (currentAndPre + currentAndNext - preAndNext) /
    (2 * Math.sqrt(currentAndPre) * Math.sqrt(currentAndNext)),
  );
  // 夹角为空、 0 或 PI 时，不需要计算夹角处的额外宽度
  // 注意: 由于计算精度问题，夹角为 0 的情况计算出来的角度可能是一个很小的值，还需要判断其与 0 是否近似相等
  if (!currentAngle || Math.sin(currentAngle) === 0 || isNumberEqual(currentAngle, 0)) {
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
      Math.cos(currentAngle / 2 - xAngle) * ((lineWidth / 2) * (1 / Math.sin(currentAngle / 2))) -
      lineWidth / 2 || 0,
    // 垂直方向投影
    yExtra:
      Math.cos(yAngle - currentAngle / 2) * ((lineWidth / 2) * (1 / Math.sin(currentAngle / 2))) -
      lineWidth / 2 || 0,
  };
  return extra;
}

function hasArc(path: any[]) {
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

function extractPolygons(path: any[]) {
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

function calcLength(curve: any[]) {
  let totalLength = 0;
  let tempLength = 0;
  // 每段 curve 对应起止点的长度比例列表，形如: [[0, 0.25], [0.25, 0.6]. [0.6, 0.9], [0.9, 1]]
  const curveSegments: number[][] = [];
  let segmentT;
  let segmentL;
  let segmentN;
  let l;

  if (!curve) {
    return {
      curveSegments: [],
      totalLength,
    };
  }

  curve.forEach((segment, i) => {
    segmentN = curve[i + 1];
    l = segment.length;
    if (segmentN) {
      totalLength +=
        CubicUtil.length(
          segment[l - 2],
          segment[l - 1],
          segmentN[1],
          segmentN[2],
          segmentN[3],
          segmentN[4],
          segmentN[5],
          segmentN[6],
        ) || 0;
    }
  });

  if (totalLength === 0) {
    return {
      curveSegments: [],
      totalLength,
    };
  }

  curve.forEach((segment, i) => {
    segmentN = curve[i + 1];
    l = segment.length;
    if (segmentN) {
      segmentT = [];
      segmentT[0] = tempLength / totalLength;
      segmentL = CubicUtil.length(
        segment[l - 2],
        segment[l - 1],
        segmentN[1],
        segmentN[2],
        segmentN[3],
        segmentN[4],
        segmentN[5],
        segmentN[6],
      );
      // 当 path 不连续时，segmentL 可能为空，为空时需要作为 0 处理
      tempLength += segmentL || 0;
      segmentT[1] = tempLength / totalLength;
      curveSegments.push(segmentT);
    }
  });

  return {
    curveSegments,
    totalLength,
  };
}
