/**
 * implements morph animation with cubic splitting
 * @see http://thednp.github.io/kute.js/svgCubicMorph.html
 */
import { Cubic as CubicUtil } from '@antv/g-math';
import { mat4, vec3 } from 'gl-matrix';
import type { Circle, Ellipse, Line, Path, Polyline, Rect } from '../display-objects';
import type { DisplayObject } from '../DisplayObject';
import { PathCommand, SHAPE } from '../types';

function midPoint(a: [number, number], b: [number, number], t: number): [number, number] {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  return [ax + (bx - ax) * t, ay + (by - ay) * t];
}

function splitCubic(
  pts: [number, number, number, number, number, number, number, number],
  t = 0.5,
): [PathCommand, PathCommand] {
  const p0 = pts.slice(0, 2) as [number, number];
  const p1 = pts.slice(2, 4) as [number, number];
  const p2 = pts.slice(4, 6) as [number, number];
  const p3 = pts.slice(6, 8) as [number, number];
  const p4 = midPoint(p0, p1, t);
  const p5 = midPoint(p1, p2, t);
  const p6 = midPoint(p2, p3, t);
  const p7 = midPoint(p4, p5, t);
  const p8 = midPoint(p5, p6, t);
  const p9 = midPoint(p7, p8, t);

  return [['C'].concat(p4, p7, p9) as PathCommand, ['C'].concat(p8, p6, p3) as PathCommand];
}

function getCurveArray(segments: PathCommand[]) {
  return segments.map((segment, i, pathArray) => {
    const segmentData = i && pathArray[i - 1].slice(-2).concat(segment.slice(1));
    const curveLength = i ? CubicUtil.length(...segmentData) : 0;

    let subsegs;
    if (i) {
      // must be [segment,segment]
      subsegs = curveLength ? splitCubic(segmentData) : [segment, segment];
    } else {
      subsegs = [segment];
    }

    return {
      s: segment,
      ss: subsegs,
      l: curveLength,
    };
  });
}

export function equalizeSegments(
  path1: PathCommand[],
  path2: PathCommand[],
  TL?: number,
): PathCommand[][] {
  const c1 = getCurveArray(path1);
  const c2 = getCurveArray(path2);
  const L1 = c1.length;
  const L2 = c2.length;
  const l1 = c1.filter((x) => x.l).length;
  const l2 = c2.filter((x) => x.l).length;
  const m1 = c1.filter((x) => x.l).reduce((a, { l }) => a + l, 0) / l1 || 0;
  const m2 = c2.filter((x) => x.l).reduce((a, { l }) => a + l, 0) / l2 || 0;
  const tl = TL || Math.max(L1, L2);
  const mm = [m1, m2];
  const dif = [tl - L1, tl - L2];
  let canSplit: number | boolean = 0;
  const result = [c1, c2].map((x, i) =>
    x.l === tl
      ? x.map((y) => y.s)
      : x
          .map((y, j) => {
            canSplit = j && dif[i] && y.l >= mm[i];
            dif[i] -= canSplit ? 1 : 0;
            return canSplit ? y.ss : [y.s];
          })
          .flat(),
  );

  return result[0].length === result[1].length
    ? result
    : equalizeSegments(result[0], result[1], tl);
}

export function getDrawDirection(pathArray: PathCommand[]) {
  return getPathArea(pathArray) >= 0;
}

function getCubicSegArea(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) {
  // https://stackoverflow.com/a/15845996
  return (
    (3 *
      ((y3 - y0) * (x1 + x2) -
        (x3 - x0) * (y1 + y2) +
        y1 * (x0 - x2) -
        x1 * (y0 - y2) +
        y3 * (x2 + x0 / 3) -
        x3 * (y2 + y0 / 3))) /
    20
  );
}

export function getPathArea(pathArray: PathCommand[]) {
  let x = 0;
  let y = 0;
  let mx = 0;
  let my = 0;
  let len = 0;
  return pathArray
    .map((seg) => {
      switch (seg[0]) {
        case 'M':
        case 'Z':
          mx = seg[0] === 'M' ? seg[1] : mx;
          my = seg[0] === 'M' ? seg[2] : my;
          x = mx;
          y = my;
          return 0;
        default:
          len = getCubicSegArea.apply(0, [x, y].concat(seg.slice(1)));
          [x, y] = seg.slice(-2) as [number, number];
          return len;
      }
    })
    .reduce((a, b) => a + b, 0);
}

// reverse CURVE based pathArray segments only
export function reverseCurve(pathArray: PathCommand[]): PathCommand[] {
  const rotatedCurve = pathArray
    .slice(1)
    .map((x, i, curveOnly) =>
      !i ? pathArray[0].slice(1).concat(x.slice(1)) : curveOnly[i - 1].slice(-2).concat(x.slice(1)),
    )
    .map((x) => x.map((y, i) => x[x.length - i - 2 * (1 - (i % 2))]))
    .reverse();

  return [['M'].concat(rotatedCurve[0].slice(0, 2))].concat(
    rotatedCurve.map((x) => ['C'].concat(x.slice(2))),
  );
}

export function clonePath(pathArray: PathCommand[]): PathCommand[] {
  return pathArray.map((x) => {
    if (Array.isArray(x)) {
      return clonePath(x);
    }
    return !Number.isNaN(+x) ? +x : x;
  });
}

function getRotations(a: PathCommand[]) {
  const segCount = a.length;
  const pointCount = segCount - 1;

  return a.map((f, idx) =>
    a.map((p, i) => {
      let oldSegIdx = idx + i;
      let seg;

      if (i === 0 || (a[oldSegIdx] && a[oldSegIdx][0] === 'M')) {
        seg = a[oldSegIdx];
        return ['M'].concat(seg.slice(-2));
      }
      if (oldSegIdx >= segCount) oldSegIdx -= pointCount;
      return a[oldSegIdx];
    }),
  );
}

function distanceSquareRoot(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}

export function getRotatedCurve(a: PathCommand[], b: PathCommand[]) {
  const segCount = a.length - 1;
  const lineLengths: number[] = [];
  let computedIndex = 0;
  let sumLensSqrd = 0;
  const rotations = getRotations(a);

  rotations.forEach((r, i) => {
    a.slice(1).forEach((s, j) => {
      sumLensSqrd += distanceSquareRoot(a[(i + j) % segCount].slice(-2), b[j % segCount].slice(-2));
    });
    lineLengths[i] = sumLensSqrd;
    sumLensSqrd = 0;
  });

  computedIndex = lineLengths.indexOf(Math.min.apply(null, lineLengths));

  return rotations[computedIndex];
}

function commandsToPathString(
  commands: PathCommand[],
  localTransform: mat4,
  anchor: [number, number],
  parsedStyle: any,
) {
  const { x, y, width, height } = parsedStyle;
  return commands.reduce((prev, cur) => {
    let path = '';
    if (cur[0] === 'M' || cur[0] === 'L') {
      const p = vec3.fromValues(cur[1] - x, cur[2] - y, 0);
      vec3.transformMat4(p, p, localTransform);

      path = `${cur[0]}${p[0]},${p[1]}`;
    } else if (cur[0] === 'Z') {
      path = cur[0];
    } else if (cur[0] === 'C') {
      const p1 = vec3.fromValues(cur[1] - x, cur[2] - y, 0);
      const p2 = vec3.fromValues(cur[3] - x, cur[4] - y, 0);
      const p3 = vec3.fromValues(cur[5] - x, cur[6] - y, 0);
      vec3.transformMat4(p1, p1, localTransform);
      vec3.transformMat4(p2, p2, localTransform);
      vec3.transformMat4(p3, p3, localTransform);

      path = `${cur[0]}${p1[0]},${p1[1]},${p2[0]},${p2[1]},${p3[0]},${p3[1]}`;
    }

    return (prev += path);
  }, '');
}

function lineToCommands(x1: number, y1: number, x2: number, y2: number): PathCommand[] {
  return [
    ['M', x1, y1],
    ['L', x2, y2],
  ];
}

function ellipseToCommands(rx: number, ry: number, cx: number, cy: number): PathCommand[] {
  const factor = ((-1 + Math.sqrt(2)) / 3) * 4;
  let dx = rx * factor;
  let dy = ry * factor;
  let left = cx - rx;
  let right = cx + rx;
  let top = cy - ry;
  let bottom = cy + ry;

  return [
    ['M', left, cy],
    ['C', left, cy - dy, cx - dx, top, cx, top],
    ['C', cx + dx, top, right, cy - dy, right, cy],
    ['C', right, cy + dy, cx + dx, bottom, cx, bottom],
    ['C', cx - dx, bottom, left, cy + dy, left, cy],
    ['Z'],
  ];
}

function polygonToCommands(points: [number, number][]): PathCommand[] {
  return points.map((point, i) => {
    return [i === 0 ? 'M' : 'L', point[0], point[1]];
  });
}

function rectToCommands(
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number,
): PathCommand[] {
  // FIXME: account for radius
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
export function convertToPath(object: DisplayObject) {
  const localTransform = object.getLocalTransform();
  const anchor = object.style.anchor;
  let commands: PathCommand[] = [];
  switch (object.nodeName) {
    case SHAPE.Line:
      const { x1, y1, x2, y2 } = (object as Line).parsedStyle;
      commands = lineToCommands(x1, y1, x2, y2);
      break;
    case SHAPE.Circle: {
      const { r, x, y } = (object as Circle).parsedStyle;
      commands = ellipseToCommands(r, r, x, y);
      break;
    }
    case SHAPE.Ellipse: {
      const { rx, ry, x, y } = (object as Ellipse).parsedStyle;
      commands = ellipseToCommands(rx, ry, x, y);
      break;
    }
    case SHAPE.Polyline:
    case SHAPE.Polygon:
      const { points } = (object as Polyline).parsedStyle;
      commands = polygonToCommands(points.points);
      break;
    case SHAPE.Rect:
      const { width, height, x, y, radius } = (object as Rect).parsedStyle;
      commands = rectToCommands(width, height, x, y, radius);
      break;
    case SHAPE.Path:
      commands = (object as Path).parsedStyle.path.curve;
      break;
  }

  if (commands.length) {
    return commandsToPathString(commands, localTransform, anchor, object.parsedStyle);
  }
}
