import { isNumberEqual, isNil } from '../util';

function cubicAt(p0, p1, p2, p3, t) {
  const onet = 1 - t;
  return onet * onet * (onet * p3 + 3 * t * p2) + t * t * (t * p0 + 3 * onet * p1);
}

function cubicDerivativeAt(p0, p1, p2, p3, t) {
  const onet = 1 - t;
  return 3 * (((p1 - p0) * onet + 2 * (p2 - p1) * t) * onet + (p3 - p2) * t * t);
}

function vecDistance(v1, v2) {
  const deltX = v2[0] - v1[0];
  const deltY = v2[1] - v1[0];
  return Math.sqrt(deltX * deltX + deltY * deltY);
}

function cubicProjectPoint(x1, y1, x2, y2, x3, y3, x4, y4, x, y) {
  let t;
  let interval = 0.005;
  let d = Infinity;
  let _t;
  let v1;
  let d1;
  let d2;
  let v2;
  let prev;
  let next;
  const EPSILON = 0.0001;
  const v0 = [x, y];

  for (_t = 0; _t < 1; _t += 0.05) {
    v1 = [cubicAt(x1, x2, x3, x4, _t), cubicAt(y1, y2, y3, y4, _t)];

    d1 = vecDistance(v0, v1);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  for (let i = 0; i < 32; i++) {
    if (interval < EPSILON) {
      break;
    }

    prev = t - interval;
    next = t + interval;

    v1 = [cubicAt(x1, x2, x3, x4, prev), cubicAt(y1, y2, y3, y4, prev)];

    d1 = vecDistance(v0, v1);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      v2 = [cubicAt(x1, x2, x3, x4, next), cubicAt(y1, y2, y3, y4, next)];

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
    x: cubicAt(x1, x2, x3, x4, t),
    y: cubicAt(y1, y2, y3, y4, t),
  };
  return out;
}

function pointDistance(x1, y1, x2, y2, x3, y3, x4, y4, x, y) {
  const projectPoint = cubicProjectPoint(x1, y1, x2, y2, x3, y3, x4, y4, x, y);
  return vecDistance([projectPoint.x, projectPoint.y], [x, y]);
}

function cubicExtrema(p0, p1, p2, p3) {
  const a = 3 * p0 - 9 * p1 + 9 * p2 - 3 * p3;
  const b = 6 * p1 - 12 * p2 + 6 * p3;
  const c = 3 * p2 - 3 * p3;
  const extrema = [];
  let t1;
  let t2;
  let discSqrt;

  if (isNumberEqual(a, 0)) {
    if (!isNumberEqual(b, 0)) {
      t1 = -c / b;
      if (t1 >= 0 && t1 <= 1) {
        extrema.push(t1);
      }
    }
  } else {
    const disc = b * b - 4 * a * c;
    if (isNumberEqual(disc, 0)) {
      extrema.push(-b / (2 * a));
    } else if (disc > 0) {
      discSqrt = Math.sqrt(disc);
      t1 = (-b + discSqrt) / (2 * a);
      t2 = (-b - discSqrt) / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        extrema.push(t1);
      }
      if (t2 >= 0 && t2 <= 1) {
        extrema.push(t2);
      }
    }
  }
  return extrema;
}

function base3(t, p1, p2, p3, p4) {
  const t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4;
  const t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
}

export default {
  at: cubicAt,
  derivativeAt: cubicDerivativeAt,
  pointDistance,
  extrema: cubicExtrema,
};
