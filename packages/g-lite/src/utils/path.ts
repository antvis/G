/**
 * implements morph animation with cubic splitting
 * @see http://thednp.github.io/kute.js/svgCubicMorph.html
 */
import type { AbsoluteArray, CurveArray } from '@antv/util';
import { getTotalLength, clamp } from '@antv/util';
import type { mat4 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import type { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from '../display-objects';
import { Shape } from '../types';

export function getOrCalculatePathTotalLength(path: Path) {
  if (path.parsedStyle.path.totalLength === 0) {
    path.parsedStyle.path.totalLength = getTotalLength(path.parsedStyle.path.absolutePath);
  }
  return path.parsedStyle.path.totalLength;
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

function isSamePoint(point1, point2) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

export function path2Segments(path: CurveArray) {
  const segments = [];
  let currentPoint = null; // 当前图形
  let nextParams = null; // 下一节点的 path 参数
  // let startMovePoint = null; // 开始 M 的点，可能会有多个
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
      startTangent: null,
      endTangent: null,
    };
    switch (command) {
      case 'M':
        // startMovePoint = [params[1], params[2]];
        lastStartMovePointIndex = i;
        break;
      default:
        break;
    }
    const len = params.length;
    currentPoint = [params[len - 2], params[len - 1]];
    // @ts-ignore
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
    // @ts-ignore
    segment.nextPoint = nextPoint;
    // Add startTangent and endTangent
    const { prePoint } = segment;
    if (command === 'C') {
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
    }
    segments.push(segment);
  }
  return segments;
}

function commandsToPathString(
  commands: AbsoluteArray,
  object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
  applyLocalTransform = true,
) {
  let transform: mat4;
  if (applyLocalTransform) {
    transform = object.getLocalTransform();
  }

  const { defX = 0, defY = 0 } = object.parsedStyle;
  return commands.reduce((prev, cur) => {
    let path = '';
    if (cur[0] === 'M' || cur[0] === 'L') {
      const p = vec3.fromValues(cur[1] - defX, cur[2] - defY, 0);

      if (applyLocalTransform) {
        vec3.transformMat4(p, p, transform);
      }

      path = `${cur[0]}${p[0]},${p[1]}`;
    } else if (cur[0] === 'Z') {
      path = cur[0];
    } else if (cur[0] === 'C') {
      const p1 = vec3.fromValues(cur[1] - defX, cur[2] - defY, 0);
      const p2 = vec3.fromValues(cur[3] - defX, cur[4] - defY, 0);
      const p3 = vec3.fromValues(cur[5] - defX, cur[6] - defY, 0);

      if (applyLocalTransform) {
        vec3.transformMat4(p1, p1, transform);
        vec3.transformMat4(p2, p2, transform);
        vec3.transformMat4(p3, p3, transform);
      }

      path = `${cur[0]}${p1[0]},${p1[1]},${p2[0]},${p2[1]},${p3[0]},${p3[1]}`;
    } else if (cur[0] === 'A') {
      const c = vec3.fromValues(cur[6] - defX, cur[7] - defY, 0);
      if (applyLocalTransform) {
        vec3.transformMat4(c, c, transform);
      }
      path = `${cur[0]}${cur[1]},${cur[2]},${cur[3]},${cur[4]},${cur[5]},${c[0]},${c[1]}`;
    }

    return (prev += path);
  }, '');
}

function lineToCommands(x1: number, y1: number, x2: number, y2: number): AbsoluteArray {
  return [
    ['M', x1, y1],
    ['L', x2, y2],
  ];
}

function ellipseToCommands(rx: number, ry: number, cx: number, cy: number): AbsoluteArray {
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

function polygonToCommands(points: [number, number][], closed: boolean): AbsoluteArray {
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
      brr ? ['A', brr, brr, 0, 0, sweepFlag, width + x - signX * brr, height + y] : null,
      ['L', x + signX * blr, height + y],
      blr ? ['A', blr, blr, 0, 0, sweepFlag, x, height + y - signY * blr] : null,
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
 * * anchor
 * * lineWidth
 */
export function convertToPath(
  object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
  applyLocalTransform = true,
) {
  let commands: AbsoluteArray = [] as unknown as AbsoluteArray;
  switch (object.nodeName) {
    case Shape.LINE:
      const { x1, y1, x2, y2 } = (object as Line).parsedStyle;
      commands = lineToCommands(x1, y1, x2, y2);
      break;
    case Shape.CIRCLE: {
      const { r, cx, cy } = (object as Circle).parsedStyle;
      commands = ellipseToCommands(r, r, cx, cy);
      break;
    }
    case Shape.ELLIPSE: {
      const { rx, ry, cx, cy } = (object as Ellipse).parsedStyle;
      commands = ellipseToCommands(rx, ry, cx, cy);
      break;
    }
    case Shape.POLYLINE:
    case Shape.POLYGON:
      const { points } = (object as Polyline).parsedStyle;
      commands = polygonToCommands(points.points, object.nodeName === Shape.POLYGON);
      break;
    case Shape.RECT:
      const { width, height, x, y, radius } = (object as Rect).parsedStyle;

      const hasRadius = radius && radius.some((r) => r !== 0);
      commands = rectToCommands(
        width,
        height,
        x,
        y,
        hasRadius &&
          (radius.map((r) => clamp(r, 0, Math.min(Math.abs(width) / 2, Math.abs(height) / 2))) as [
            number,
            number,
            number,
            number,
          ]),
      );
      break;
    case Shape.PATH:
      const { curve, zCommandIndexes } = (object as Path).parsedStyle.path;

      commands = [...curve];
      zCommandIndexes.forEach((zIndex, index) => {
        commands.splice(zIndex + index, 1, ['Z']);
      });

      break;
  }

  if (commands.length) {
    return commandsToPathString(commands, object, applyLocalTransform);
  }
}

export function translatePathToString(
  pathArray: AbsoluteArray,
  x: number,
  y: number,
  startOffsetX = 0,
  startOffsetY = 0,
  endOffsetX = 0,
  endOffsetY = 0,
) {
  const newValue = pathArray
    .map((params, i) => {
      const command = params[0];

      // @ts-ignore
      const isClosed = pathArray[pathArray.length - 1][0] === 'Z';

      const offsetX = i === pathArray.length - (isClosed ? 2 : 1) ? endOffsetX : 0;
      const offsetY = i === pathArray.length - (isClosed ? 2 : 1) ? endOffsetY : 0;

      switch (command) {
        case 'M':
          return `M ${params[1]! - x + startOffsetX},${params[2]! - y + startOffsetY}`;
        case 'L':
          return `L ${params[1]! - x + offsetX},${params[2]! - y + offsetY}`;
        case 'Q':
          return `Q ${params[1]! - x} ${params[2]! - y},${params[3]! - x + offsetX} ${
            params[4]! - y + offsetY
          }`;
        case 'C':
          return `C ${params[1]! - x} ${params[2]! - y},${params[3]! - x} ${params[4]! - y},${
            params[5]! - x + offsetX
          } ${params[6]! - y + offsetY}`;
        case 'A':
          return `A ${params[1]} ${params[2]} ${params[3]} ${params[4]} ${params[5]} ${
            params[6]! - x + offsetX
          } ${params[7]! - y + offsetY}`;
        case 'Z':
          return 'Z';
        default:
          break;
      }
    })
    .join(' ');
  if (~newValue.indexOf('NaN')) {
    return '';
  }
  return newValue;
}
