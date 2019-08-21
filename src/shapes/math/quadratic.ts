import * as Util from '@antv/util';
import { PointType } from '../../interface';

const vec2 = Util.vec2;
const EPSILON = 0.0001;

export function at(p0: number, p1: number, p2: number, t: number): number {
  const onet = 1 - t;
  return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

export function pointDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x: number,
  y: number,
  out?: boolean
): PointType | number {
  let t;
  let interval = 0.005;
  let d = Infinity;
  let d1;
  let v1;
  let v2;
  let _t;
  let d2;
  let i;

  const v0 = [x, y];
  for (_t = 0; _t < 1; _t += 0.05) {
    v1 = [at(x1, x2, x3, _t), at(y1, y2, y3, _t)];

    d1 = vec2.squaredDistance(v0, v1);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  for (i = 0; i < 32; i++) {
    if (interval < EPSILON) {
      break;
    }

    const prev = t - interval;
    const next = t + interval;

    v1 = [at(x1, x2, x3, prev), at(y1, y2, y3, prev)];

    d1 = vec2.squaredDistance(v0, v1);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      v2 = [at(x1, x2, x3, next), at(y1, y2, y3, next)];

      d2 = vec2.squaredDistance(v0, v2);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }

  if (out) {
    return {
      x: at(x1, x2, x3, t),
      y: at(y1, y2, y3, t),
    };
  }

  return Math.sqrt(d);
}

export function extrema(p0: number, p1: number, p2: number): number[] {
  const a = p0 + p2 - 2 * p1;
  if (Util.isNumberEqual(a, 0)) {
    return [0.5];
  }
  const rst = (p0 - p1) / a;
  if (rst <= 1 && rst >= 0) {
    return [rst];
  }
  return [];
}

export function projectPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x: number,
  y: number
): PointType {
  return pointDistance(x1, y1, x2, y2, x3, y3, x, y, true) as PointType;
}
