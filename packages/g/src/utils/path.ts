import { Cubic as CubicUtil } from '@antv/g-math';
import type { PathCommand } from '../types';

function midPoint(a: [number, number], b: [number, number], t: number) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  return [ax + (bx - ax) * t, ay + (by - ay) * t];
}

function splitCubic(pts: number[], t = 0.5) {
  const p0 = pts.slice(0, 2);
  const p1 = pts.slice(2, 4);
  const p2 = pts.slice(4, 6);
  const p3 = pts.slice(6, 8);
  const p4 = midPoint(p0, p1, t);
  const p5 = midPoint(p1, p2, t);
  const p6 = midPoint(p2, p3, t);
  const p7 = midPoint(p4, p5, t);
  const p8 = midPoint(p5, p6, t);
  const p9 = midPoint(p7, p8, t);

  return [['C'].concat(p4, p7, p9), ['C'].concat(p8, p6, p3)];
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
