import { Cubic as CubicUtil } from '@antv/g-math';
import { path2Absolute, path2Curve, path2Segments } from '@antv/util';
import type { DisplayObject, ParsedPathStyleProps } from '../../display-objects';
import type { IElement } from '../../dom';
import { Rectangle } from '../../shapes';
import type { PathCommand } from '../../types';
import {
  clonePath,
  equalizeSegments,
  getDrawDirection,
  getRotatedCurve,
  reverseCurve,
} from '../../utils/path';

export function parsePath(path: string, object: DisplayObject): ParsedPathStyleProps['path'] {
  const absolutePath = path2Absolute(path) as PathCommand[];
  const hasArc = hasArcOrBezier(absolutePath);

  const clonedAbsolutePath = absolutePath.slice();
  const { polygons, polylines } = extractPolygons(clonedAbsolutePath);

  // convert to curves to do morphing & picking later
  // @see http://thednp.github.io/kute.js/svgCubicMorph.html
  const [curve, zCommandIndexes] = path2Curve(clonedAbsolutePath, true) as [
    PathCommand[],
    number[],
  ];
  const segments = path2Segments(clonedAbsolutePath);
  const { totalLength, curveSegments } = calcLength(curve);
  const rect = getPathBBox(curve);

  if (object) {
    object.parsedStyle.defX = rect.x;
    object.parsedStyle.defY = rect.y;
  }

  return {
    absolutePath,
    hasArc,
    segments,
    polygons,
    polylines,
    curve,
    totalLength,
    curveSegments,
    zCommandIndexes,
    rect,
  };
}

function hasArcOrBezier(path: PathCommand[]) {
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

function extractPolygons(pathArray: PathCommand[]) {
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
      points.push([params[1] as number, params[2] as number]);
    } else if (cmd === 'Z') {
      if (points.length) {
        // 存在点
        polygons.push(points);
        points = []; // 开始新的点集合
      }
      // 如果不存在点，同时 'Z'，则说明是错误，不处理
    } else {
      points.push([params[1] as number, params[2] as number]);
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

function getPathBBox(segments: PathCommand[]): Rectangle {
  let x = 0;
  let y = 0;
  let X: number[] = [];
  let Y: number[] = [];

  segments.forEach((segment) => {
    const [s1, s2] = segment.slice(-2);
    if (segment[0] === 'M') {
      x = s1 as number;
      y = s2 as number;
      X.push(s1 as number);
      Y.push(s2 as number);
    } else if (segment[0] === 'C') {
      // @ts-ignore
      const dim = CubicUtil.box(...[x, y].concat(segment.slice(1)));
      X = X.concat(dim.x, dim.x + dim.width);
      Y = Y.concat(dim.y, dim.y + dim.height);
      x = s1 as number;
      y = s2 as number;
    }
  });

  const xTop = Math.min.apply(0, X);
  const yTop = Math.min.apply(0, Y);
  const xBot = Math.max.apply(0, X);
  const yBot = Math.max.apply(0, Y);
  const width = xBot - xTop;
  const height = yBot - yTop;

  return new Rectangle(xTop, yTop, width, height);
}

export function mergePaths(
  left: ParsedPathStyleProps['path'],
  right: ParsedPathStyleProps['path'],
  object: IElement,
): [PathCommand[], PathCommand[], (b: PathCommand[]) => PathCommand[]] {
  const curve1 = left.curve;
  const curve2 = right.curve;
  let curves = [curve1, curve2];
  if (curve1.length !== curve2.length) {
    curves = equalizeSegments(curve1, curve2);
  }

  const curve0 =
    getDrawDirection(curves[0]) !== getDrawDirection(curves[1])
      ? reverseCurve(curves[0])
      : clonePath(curves[0]);

  return [
    curve0,
    getRotatedCurve(curves[1], curve0) as PathCommand[],
    (pathArray: PathCommand[]) => {
      // need converting to path string?
      return pathArray;
    },
  ];
}
