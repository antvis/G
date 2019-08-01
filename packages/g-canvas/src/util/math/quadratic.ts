import { isNumberEqual } from '../util';

function quadraticAt(p0, p1, p2, t) {
  const onet = 1 - t;
  return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

function vecDistance(v1, v2) {
  const deltX = v2[0] - v1[0];
  const deltY = v2[1] - v1[0];
  return Math.sqrt(deltX * deltX + deltY * deltY);
}

function quadraticProjectPoint(x1, y1, x2, y2, x3, y3, x, y) {
  let t;
  let interval = 0.005;
  let d = Infinity;
  let d1;
  let v1;
  let v2;
  let _t;
  let d2;
  let i;
  const EPSILON = 0.0001;
  const v0 = [x, y];

  for (_t = 0; _t < 1; _t += 0.05) {
    v1 = [quadraticAt(x1, x2, x3, _t), quadraticAt(y1, y2, y3, _t)];

    d1 = vecDistance(v0, v1);
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

    v1 = [quadraticAt(x1, x2, x3, prev), quadraticAt(y1, y2, y3, prev)];

    d1 = vecDistance(v0, v1);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      v2 = [quadraticAt(x1, x2, x3, next), quadraticAt(y1, y2, y3, next)];

      d2 = vecDistance(v0, v2);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }

  const out = {
    x: quadraticAt(x1, x2, x3, t),
    y: quadraticAt(y1, y2, y3, t),
  };
  return out;
}

function pointDistance(x1, y1, x2, y2, x3, y3, x, y) {
  const projectPoint = quadraticProjectPoint(x1, y1, x2, y2, x3, y3, x, y);
  return vecDistance([projectPoint.x, projectPoint.y], [x, y]);
}

function quadraticExtrema(p0, p1, p2) {
  const a = p0 + p2 - 2 * p1;
  if (isNumberEqual(a, 0)) {
    return [0.5];
  }
  const rst = (p0 - p1) / a;
  if (rst <= 1 && rst >= 0) {
    return [rst];
  }
  return [];
}

export default {
  at: quadraticAt,
  pointDistance,
  extrema: quadraticExtrema,
};
