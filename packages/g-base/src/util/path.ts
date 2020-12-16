import { each, isArray } from '@antv/util';
import { PathCommand } from '../types';

const SPACES =
  '\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029';
const PATH_COMMAND = new RegExp(
  `([a-z])[${SPACES},]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[${SPACES}]*,?[${SPACES}]*)+)`,
  'ig'
);
const PATH_VALUES = new RegExp(`(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[${SPACES}]*,?[${SPACES}]*`, 'ig');
// Parse given path string into an array of arrays of path segments
const parsePathString = function (pathString: string): PathCommand[] {
  if (!pathString) {
    return null;
  }

  if (isArray(pathString)) {
    return (pathString as unknown) as PathCommand[];
  }
  const paramCounts = {
    a: 7,
    c: 6,
    o: 2,
    h: 1,
    l: 2,
    m: 2,
    r: 4,
    q: 4,
    s: 4,
    t: 2,
    v: 1,
    u: 3,
    z: 0,
  };
  const data = [];

  String(pathString).replace(PATH_COMMAND, (a, b, c) => {
    const params = [];
    let name = b.toLowerCase();
    c.replace(PATH_VALUES, (a, b) => {
      b && params.push(+b);
    });
    if (name === 'm' && params.length > 2) {
      data.push([b].concat(params.splice(0, 2)));
      name = 'l';
      b = b === 'm' ? 'l' : 'L';
    }
    if (name === 'o' && params.length === 1) {
      data.push([b, params[0]]);
    }
    if (name === 'r') {
      data.push([b].concat(params));
    } else {
      while (params.length >= paramCounts[name]) {
        data.push([b].concat(params.splice(0, paramCounts[name])));
        if (!paramCounts[name]) {
          break;
        }
      }
    }
    return pathString;
  });

  return data;
};

// http://schepers.cc/getting-to-the-point
const catmullRomToBezier = function (crp, z) {
  const d = [];
  // @ts-ignore
  for (let i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
    const p = [
      {
        x: +crp[i - 2],
        y: +crp[i - 1],
      },
      {
        x: +crp[i],
        y: +crp[i + 1],
      },
      {
        x: +crp[i + 2],
        y: +crp[i + 3],
      },
      {
        x: +crp[i + 4],
        y: +crp[i + 5],
      },
    ];
    if (z) {
      if (!i) {
        p[0] = {
          x: +crp[iLen - 2],
          y: +crp[iLen - 1],
        };
      } else if (iLen - 4 === i) {
        p[3] = {
          x: +crp[0],
          y: +crp[1],
        };
      } else if (iLen - 2 === i) {
        p[2] = {
          x: +crp[0],
          y: +crp[1],
        };
        p[3] = {
          x: +crp[2],
          y: +crp[3],
        };
      }
    } else {
      if (iLen - 4 === i) {
        p[3] = p[2];
      } else if (!i) {
        p[0] = {
          x: +crp[i],
          y: +crp[i + 1],
        };
      }
    }
    d.push([
      'C',
      (-p[0].x + 6 * p[1].x + p[2].x) / 6,
      (-p[0].y + 6 * p[1].y + p[2].y) / 6,
      (p[1].x + 6 * p[2].x - p[3].x) / 6,
      (p[1].y + 6 * p[2].y - p[3].y) / 6,
      p[2].x,
      p[2].y,
    ]);
  }

  return d;
};

const ellipsePath = function (x, y, rx, ry, a?) {
  let res = [];
  if (a === null && ry === null) {
    ry = rx;
  }
  x = +x;
  y = +y;
  rx = +rx;
  ry = +ry;
  if (a !== null) {
    const rad = Math.PI / 180;
    const x1 = x + rx * Math.cos(-ry * rad);
    const x2 = x + rx * Math.cos(-a * rad);
    const y1 = y + rx * Math.sin(-ry * rad);
    const y2 = y + rx * Math.sin(-a * rad);
    res = [
      ['M', x1, y1],
      ['A', rx, rx, 0, +(a - ry > 180), 0, x2, y2],
    ];
  } else {
    res = [['M', x, y], ['m', 0, -ry], ['a', rx, ry, 0, 1, 1, 0, 2 * ry], ['a', rx, ry, 0, 1, 1, 0, -2 * ry], ['z']];
  }
  return res;
};

const pathToAbsolute = function (pathArray) {
  pathArray = parsePathString(pathArray);

  if (!pathArray || !pathArray.length) {
    return [['M', 0, 0]];
  }
  let res = [];
  let x = 0;
  let y = 0;
  let mx = 0;
  let my = 0;
  let start = 0;
  let pa0;
  let dots;
  if (pathArray[0][0] === 'M') {
    x = +pathArray[0][1];
    y = +pathArray[0][2];
    mx = x;
    my = y;
    start++;
    res[0] = ['M', x, y];
  }
  const crz =
    pathArray.length === 3 &&
    pathArray[0][0] === 'M' &&
    pathArray[1][0].toUpperCase() === 'R' &&
    pathArray[2][0].toUpperCase() === 'Z';
  for (let r, pa, i = start, ii = pathArray.length; i < ii; i++) {
    res.push((r = []));
    pa = pathArray[i];
    pa0 = pa[0];
    if (pa0 !== pa0.toUpperCase()) {
      r[0] = pa0.toUpperCase();
      switch (r[0]) {
        case 'A':
          r[1] = pa[1];
          r[2] = pa[2];
          r[3] = pa[3];
          r[4] = pa[4];
          r[5] = pa[5];
          r[6] = +pa[6] + x;
          r[7] = +pa[7] + y;
          break;
        case 'V':
          r[1] = +pa[1] + y;
          break;
        case 'H':
          r[1] = +pa[1] + x;
          break;
        case 'R':
          dots = [x, y].concat(pa.slice(1));
          for (let j = 2, jj = dots.length; j < jj; j++) {
            dots[j] = +dots[j] + x;
            dots[++j] = +dots[j] + y;
          }
          res.pop();
          res = res.concat(catmullRomToBezier(dots, crz));
          break;
        case 'O':
          res.pop();
          dots = ellipsePath(x, y, pa[1], pa[2]);
          dots.push(dots[0]);
          res = res.concat(dots);
          break;
        case 'U':
          res.pop();
          res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
          r = ['U'].concat(res[res.length - 1].slice(-2));
          break;
        case 'M':
          mx = +pa[1] + x;
          my = +pa[2] + y;
          break; // for lint
        default:
          for (let j = 1, jj = pa.length; j < jj; j++) {
            r[j] = +pa[j] + (j % 2 ? x : y);
          }
      }
    } else if (pa0 === 'R') {
      dots = [x, y].concat(pa.slice(1));
      res.pop();
      res = res.concat(catmullRomToBezier(dots, crz));
      r = ['R'].concat(pa.slice(-2));
    } else if (pa0 === 'O') {
      res.pop();
      dots = ellipsePath(x, y, pa[1], pa[2]);
      dots.push(dots[0]);
      res = res.concat(dots);
    } else if (pa0 === 'U') {
      res.pop();
      res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
      r = ['U'].concat(res[res.length - 1].slice(-2));
    } else {
      for (let k = 0, kk = pa.length; k < kk; k++) {
        r[k] = pa[k];
      }
    }
    pa0 = pa0.toUpperCase();
    if (pa0 !== 'O') {
      switch (r[0]) {
        case 'Z':
          x = +mx;
          y = +my;
          break;
        case 'H':
          x = r[1];
          break;
        case 'V':
          y = r[1];
          break;
        case 'M':
          mx = r[r.length - 2];
          my = r[r.length - 1];
          break; // for lint
        default:
          x = r[r.length - 2];
          y = r[r.length - 1];
      }
    }
  }

  return res;
};

const l2c = function (x1, y1, x2, y2) {
  return [x1, y1, x2, y2, x2, y2];
};

const q2c = function (x1, y1, ax, ay, x2, y2) {
  const _13 = 1 / 3;
  const _23 = 2 / 3;
  return [_13 * x1 + _23 * ax, _13 * y1 + _23 * ay, _13 * x2 + _23 * ax, _13 * y2 + _23 * ay, x2, y2];
};

const a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
  // for more information of where this math came from visit:
  // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
  if (rx === ry) {
    rx += 1;
  }

  const _120 = (Math.PI * 120) / 180;
  const rad = (Math.PI / 180) * (+angle || 0);
  let res = [];
  let xy;
  let f1;
  let f2;
  let cx;
  let cy;
  const rotate = function (x, y, rad) {
    const X = x * Math.cos(rad) - y * Math.sin(rad);
    const Y = x * Math.sin(rad) + y * Math.cos(rad);
    return {
      x: X,
      y: Y,
    };
  };
  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
    if (x1 === x2 && y1 === y2) {
      // 若弧的起始点和终点重叠则错开一点
      x2 += 1;
      y2 += 1;
    }
    // const cos = Math.cos(Math.PI / 180 * angle);
    // const sin = Math.sin(Math.PI / 180 * angle);
    const x = (x1 - x2) / 2;
    const y = (y1 - y2) / 2;
    let h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (h > 1) {
      h = Math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    const k =
      (large_arc_flag === sweep_flag ? -1 : 1) *
      Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));
    cx = (k * rx * y) / ry + (x1 + x2) / 2;
    cy = (k * -ry * x) / rx + (y1 + y2) / 2;
    // @ts-ignore
    f1 = Math.asin(((y1 - cy) / ry).toFixed(9));
    // @ts-ignore
    f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? Math.PI - f1 : f1;
    f2 = x2 < cx ? Math.PI - f2 : f2;
    f1 < 0 && (f1 = Math.PI * 2 + f1);
    f2 < 0 && (f2 = Math.PI * 2 + f2);
    if (sweep_flag && f1 > f2) {
      f1 = f1 - Math.PI * 2;
    }
    if (!sweep_flag && f2 > f1) {
      f2 = f2 - Math.PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  let df = f2 - f1;
  if (Math.abs(df) > _120) {
    const f2old = f2;
    const x2old = x2;
    const y2old = y2;
    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * Math.cos(f2);
    y2 = cy + ry * Math.sin(f2);
    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
  }
  df = f2 - f1;
  const c1 = Math.cos(f1);
  const s1 = Math.sin(f1);
  const c2 = Math.cos(f2);
  const s2 = Math.sin(f2);
  const t = Math.tan(df / 4);
  const hx = (4 / 3) * rx * t;
  const hy = (4 / 3) * ry * t;
  const m1 = [x1, y1];
  const m2 = [x1 + hx * s1, y1 - hy * c1];
  const m3 = [x2 + hx * s2, y2 - hy * c2];
  const m4 = [x2, y2];
  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if (recursive) {
    return [m2, m3, m4].concat(res);
  }
  res = [m2, m3, m4].concat(res).join().split(',');
  const newres = [];
  for (let i = 0, ii = res.length; i < ii; i++) {
    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
  }
  return newres;
};

const pathToCurve = function (path, path2?) {
  const p = pathToAbsolute(path);
  const p2 = path2 && pathToAbsolute(path2);
  const attrs = {
    x: 0,
    y: 0,
    bx: 0,
    by: 0,
    X: 0,
    Y: 0,
    qx: null,
    qy: null,
  };
  const attrs2 = {
    x: 0,
    y: 0,
    bx: 0,
    by: 0,
    X: 0,
    Y: 0,
    qx: null,
    qy: null,
  };
  const pcoms1 = []; // path commands of original path p
  const pcoms2 = []; // path commands of original path p2
  let pfirst = ''; // temporary holder for original path command
  let pcom = ''; // holder for previous path command of original path
  let ii;
  const processPath = function (path, d, pcom) {
    let nx;
    let ny;
    if (!path) {
      return ['C', d.x, d.y, d.x, d.y, d.x, d.y];
    }
    !(
      path[0] in
      {
        T: 1,
        Q: 1,
      }
    ) && (d.qx = d.qy = null);
    switch (path[0]) {
      case 'M':
        d.X = path[1];
        d.Y = path[2];
        break;
      case 'A':
        path = ['C'].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
        break;
      case 'S':
        if (pcom === 'C' || pcom === 'S') {
          // In "S" case we have to take into account, if the previous command is C/S.
          nx = d.x * 2 - d.bx; // And reflect the previous
          ny = d.y * 2 - d.by; // command's control point relative to the current point.
        } else {
          // or some else or nothing
          nx = d.x;
          ny = d.y;
        }
        path = ['C', nx, ny].concat(path.slice(1));
        break;
      case 'T':
        if (pcom === 'Q' || pcom === 'T') {
          // In "T" case we have to take into account, if the previous command is Q/T.
          d.qx = d.x * 2 - d.qx; // And make a reflection similar
          d.qy = d.y * 2 - d.qy; // to case "S".
        } else {
          // or something else or nothing
          d.qx = d.x;
          d.qy = d.y;
        }
        path = ['C'].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
        break;
      case 'Q':
        d.qx = path[1];
        d.qy = path[2];
        path = ['C'].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
        break;
      case 'L':
        path = ['C'].concat(l2c(d.x, d.y, path[1], path[2]));
        break;
      case 'H':
        path = ['C'].concat(l2c(d.x, d.y, path[1], d.y));
        break;
      case 'V':
        path = ['C'].concat(l2c(d.x, d.y, d.x, path[1]));
        break;
      case 'Z':
        path = ['C'].concat(l2c(d.x, d.y, d.X, d.Y));
        break;
      default:
        break;
    }
    return path;
  };
  const fixArc = function (pp, i) {
    if (pp[i].length > 7) {
      pp[i].shift();
      const pi = pp[i];
      while (pi.length) {
        pcoms1[i] = 'A'; // if created multiple C:s, their original seg is saved
        p2 && (pcoms2[i] = 'A'); // the same as above
        pp.splice(i++, 0, ['C'].concat(pi.splice(0, 6)));
      }
      pp.splice(i, 1);
      ii = Math.max(p.length, (p2 && p2.length) || 0);
    }
  };
  const fixM = function (path1, path2, a1, a2, i) {
    if (path1 && path2 && path1[i][0] === 'M' && path2[i][0] !== 'M') {
      path2.splice(i, 0, ['M', a2.x, a2.y]);
      a1.bx = 0;
      a1.by = 0;
      a1.x = path1[i][1];
      a1.y = path1[i][2];
      ii = Math.max(p.length, (p2 && p2.length) || 0);
    }
  };
  ii = Math.max(p.length, (p2 && p2.length) || 0);
  for (let i = 0; i < ii; i++) {
    p[i] && (pfirst = p[i][0]); // save current path command

    if (pfirst !== 'C') {
      // C is not saved yet, because it may be result of conversion
      pcoms1[i] = pfirst; // Save current path command
      i && (pcom = pcoms1[i - 1]); // Get previous path command pcom
    }
    p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

    if (pcoms1[i] !== 'A' && pfirst === 'C') pcoms1[i] = 'C'; // A is the only command
    // which may produce multiple C:s
    // so we have to make sure that C is also C in original path

    fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

    if (p2) {
      // the same procedures is done to p2
      p2[i] && (pfirst = p2[i][0]);
      if (pfirst !== 'C') {
        pcoms2[i] = pfirst;
        i && (pcom = pcoms2[i - 1]);
      }
      p2[i] = processPath(p2[i], attrs2, pcom);

      if (pcoms2[i] !== 'A' && pfirst === 'C') {
        pcoms2[i] = 'C';
      }

      fixArc(p2, i);
    }
    fixM(p, p2, attrs, attrs2, i);
    fixM(p2, p, attrs2, attrs, i);
    const seg = p[i];
    const seg2 = p2 && p2[i];
    const seglen = seg.length;
    const seg2len = p2 && seg2.length;
    attrs.x = seg[seglen - 2];
    attrs.y = seg[seglen - 1];
    attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
    attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
    attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
    attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
    attrs2.x = p2 && seg2[seg2len - 2];
    attrs2.y = p2 && seg2[seg2len - 1];
  }

  return p2 ? [p, p2] : p;
};

const p2s = /,?([a-z]),?/gi;
const parsePathArray = function (path) {
  return path.join(',').replace(p2s, '$1');
};

const base3 = function (t, p1, p2, p3, p4) {
  const t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4;
  const t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
};

const bezlen = function (x1, y1, x2, y2, x3, y3, x4, y4, z) {
  if (z === null) {
    z = 1;
  }
  z = z > 1 ? 1 : z < 0 ? 0 : z;
  const z2 = z / 2;
  const n = 12;
  const Tvalues = [
    -0.1252,
    0.1252,
    -0.3678,
    0.3678,
    -0.5873,
    0.5873,
    -0.7699,
    0.7699,
    -0.9041,
    0.9041,
    -0.9816,
    0.9816,
  ];
  const Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const ct = z2 * Tvalues[i] + z2;
    const xbase = base3(ct, x1, x2, x3, x4);
    const ybase = base3(ct, y1, y2, y3, y4);
    const comb = xbase * xbase + ybase * ybase;
    sum += Cvalues[i] * Math.sqrt(comb);
  }
  return z2 * sum;
};

const curveDim = function (x0, y0, x1, y1, x2, y2, x3, y3) {
  const tvalues = [];
  const bounds = [[], []];
  let a;
  let b;
  let c;
  let t;

  for (let i = 0; i < 2; ++i) {
    if (i === 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        continue;
      }
      t = -c / b;
      if (t > 0 && t < 1) {
        tvalues.push(t);
      }
      continue;
    }
    const b2ac = b * b - 4 * c * a;
    const sqrtb2ac = Math.sqrt(b2ac);
    if (b2ac < 0) {
      continue;
    }
    const t1 = (-b + sqrtb2ac) / (2 * a);
    if (t1 > 0 && t1 < 1) {
      tvalues.push(t1);
    }
    const t2 = (-b - sqrtb2ac) / (2 * a);
    if (t2 > 0 && t2 < 1) {
      tvalues.push(t2);
    }
  }

  let j = tvalues.length;
  const jlen = j;
  let mt;
  while (j--) {
    t = tvalues[j];
    mt = 1 - t;
    bounds[0][j] = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
    bounds[1][j] = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
  }

  bounds[0][jlen] = x0;
  bounds[1][jlen] = y0;
  bounds[0][jlen + 1] = x3;
  bounds[1][jlen + 1] = y3;
  bounds[0].length = bounds[1].length = jlen + 2;

  return {
    min: {
      x: Math.min.apply(0, bounds[0]),
      y: Math.min.apply(0, bounds[1]),
    },
    max: {
      x: Math.max.apply(0, bounds[0]),
      y: Math.max.apply(0, bounds[1]),
    },
  };
};

const intersect = function (x1, y1, x2, y2, x3, y3, x4, y4) {
  if (
    Math.max(x1, x2) < Math.min(x3, x4) ||
    Math.min(x1, x2) > Math.max(x3, x4) ||
    Math.max(y1, y2) < Math.min(y3, y4) ||
    Math.min(y1, y2) > Math.max(y3, y4)
  ) {
    return;
  }
  const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (!denominator) {
    return;
  }
  const px = nx / denominator;
  const py = ny / denominator;
  const px2 = +px.toFixed(2);
  const py2 = +py.toFixed(2);
  if (
    px2 < +Math.min(x1, x2).toFixed(2) ||
    px2 > +Math.max(x1, x2).toFixed(2) ||
    px2 < +Math.min(x3, x4).toFixed(2) ||
    px2 > +Math.max(x3, x4).toFixed(2) ||
    py2 < +Math.min(y1, y2).toFixed(2) ||
    py2 > +Math.max(y1, y2).toFixed(2) ||
    py2 < +Math.min(y3, y4).toFixed(2) ||
    py2 > +Math.max(y3, y4).toFixed(2)
  ) {
    return;
  }
  return {
    x: px,
    y: py,
  };
};

const isPointInsideBBox = function (bbox, x, y) {
  return x >= bbox.x && x <= bbox.x + bbox.width && y >= bbox.y && y <= bbox.y + bbox.height;
};

const rectPath = function (x, y, w, h, r?) {
  if (r) {
    return [
      ['M', +x + +r, y],
      ['l', w - r * 2, 0],
      ['a', r, r, 0, 0, 1, r, r],
      ['l', 0, h - r * 2],
      ['a', r, r, 0, 0, 1, -r, r],
      ['l', r * 2 - w, 0],
      ['a', r, r, 0, 0, 1, -r, -r],
      ['l', 0, r * 2 - h],
      ['a', r, r, 0, 0, 1, r, -r],
      ['z'],
    ];
  }
  const res = [['M', x, y], ['l', w, 0], ['l', 0, h], ['l', -w, 0], ['z']];
  // @ts-ignore
  res.parsePathArray = parsePathArray;
  return res;
};

const box = function (x?, y?, width?, height?) {
  if (x === null) {
    x = y = width = height = 0;
  }
  if (y === null) {
    y = x.y;
    width = x.width;
    height = x.height;
    x = x.x;
  }
  return {
    x,
    y,
    width,
    w: width,
    height,
    h: height,
    x2: x + width,
    y2: y + height,
    cx: x + width / 2,
    cy: y + height / 2,
    r1: Math.min(width, height) / 2,
    r2: Math.max(width, height) / 2,
    r0: Math.sqrt(width * width + height * height) / 2,
    path: rectPath(x, y, width, height),
    vb: [x, y, width, height].join(' '),
  };
};

const isBBoxIntersect = function (bbox1, bbox2) {
  bbox1 = box(bbox1);
  bbox2 = box(bbox2);
  return (
    isPointInsideBBox(bbox2, bbox1.x, bbox1.y) ||
    isPointInsideBBox(bbox2, bbox1.x2, bbox1.y) ||
    isPointInsideBBox(bbox2, bbox1.x, bbox1.y2) ||
    isPointInsideBBox(bbox2, bbox1.x2, bbox1.y2) ||
    isPointInsideBBox(bbox1, bbox2.x, bbox2.y) ||
    isPointInsideBBox(bbox1, bbox2.x2, bbox2.y) ||
    isPointInsideBBox(bbox1, bbox2.x, bbox2.y2) ||
    isPointInsideBBox(bbox1, bbox2.x2, bbox2.y2) ||
    (((bbox1.x < bbox2.x2 && bbox1.x > bbox2.x) || (bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)) &&
      ((bbox1.y < bbox2.y2 && bbox1.y > bbox2.y) || (bbox2.y < bbox1.y2 && bbox2.y > bbox1.y)))
  );
};

const bezierBBox = function (p1x, p1y?, c1x?, c1y?, c2x?, c2y?, p2x?, p2y?) {
  if (!isArray(p1x)) {
    p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
  }
  const bbox = curveDim.apply(null, p1x);
  return box(bbox.min.x, bbox.min.y, bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y);
};

const findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
  const t1 = 1 - t;
  const t13 = Math.pow(t1, 3);
  const t12 = Math.pow(t1, 2);
  const t2 = t * t;
  const t3 = t2 * t;
  const x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x;
  const y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y;
  const mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x);
  const my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y);
  const nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x);
  const ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y);
  const ax = t1 * p1x + t * c1x;
  const ay = t1 * p1y + t * c1y;
  const cx = t1 * c2x + t * p2x;
  const cy = t1 * c2y + t * p2y;
  const alpha = 90 - (Math.atan2(mx - nx, my - ny) * 180) / Math.PI;
  // (mx > nx || my < ny) && (alpha += 180);
  return {
    x,
    y,
    m: {
      x: mx,
      y: my,
    },
    n: {
      x: nx,
      y: ny,
    },
    start: {
      x: ax,
      y: ay,
    },
    end: {
      x: cx,
      y: cy,
    },
    alpha,
  };
};

const interHelper = function (bez1, bez2, justCount) {
  const bbox1 = bezierBBox(bez1);
  const bbox2 = bezierBBox(bez2);
  if (!isBBoxIntersect(bbox1, bbox2)) {
    return justCount ? 0 : [];
  }
  const l1 = bezlen.apply(0, bez1);
  const l2 = bezlen.apply(0, bez2);
  const n1 = ~~(l1 / 8);
  const n2 = ~~(l2 / 8);
  const dots1 = [];
  const dots2 = [];
  const xy = {};
  let res = justCount ? 0 : [];
  for (let i = 0; i < n1 + 1; i++) {
    const d = findDotsAtSegment.apply(0, bez1.concat(i / n1));
    dots1.push({
      x: d.x,
      y: d.y,
      t: i / n1,
    });
  }
  for (let i = 0; i < n2 + 1; i++) {
    const d = findDotsAtSegment.apply(0, bez2.concat(i / n2));
    dots2.push({
      x: d.x,
      y: d.y,
      t: i / n2,
    });
  }
  for (let i = 0; i < n1; i++) {
    for (let j = 0; j < n2; j++) {
      const di = dots1[i];
      const di1 = dots1[i + 1];
      const dj = dots2[j];
      const dj1 = dots2[j + 1];
      const ci = Math.abs(di1.x - di.x) < 0.001 ? 'y' : 'x';
      const cj = Math.abs(dj1.x - dj.x) < 0.001 ? 'y' : 'x';
      const is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
      if (is) {
        if (xy[is.x.toFixed(4)] === is.y.toFixed(4)) {
          continue;
        }
        xy[is.x.toFixed(4)] = is.y.toFixed(4);
        const t1 = di.t + Math.abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t);
        const t2 = dj.t + Math.abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
        if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
          if (justCount) {
            // @ts-ignore
            res += 1;
          } else {
            // @ts-ignore
            res.push({
              x: is.x,
              y: is.y,
              t1,
              t2,
            });
          }
        }
      }
    }
  }
  return res;
};

const interPathHelper = function (path1, path2, justCount?) {
  path1 = pathToCurve(path1);
  path2 = pathToCurve(path2);
  let x1;
  let y1;
  let x2;
  let y2;
  let x1m;
  let y1m;
  let x2m;
  let y2m;
  let bez1;
  let bez2;
  let res = justCount ? 0 : [];
  for (let i = 0, ii = path1.length; i < ii; i++) {
    const pi = path1[i];
    if (pi[0] === 'M') {
      x1 = x1m = pi[1];
      y1 = y1m = pi[2];
    } else {
      if (pi[0] === 'C') {
        bez1 = [x1, y1].concat(pi.slice(1));
        x1 = bez1[6];
        y1 = bez1[7];
      } else {
        bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
        x1 = x1m;
        y1 = y1m;
      }
      for (let j = 0, jj = path2.length; j < jj; j++) {
        const pj = path2[j];
        if (pj[0] === 'M') {
          x2 = x2m = pj[1];
          y2 = y2m = pj[2];
        } else {
          if (pj[0] === 'C') {
            bez2 = [x2, y2].concat(pj.slice(1));
            x2 = bez2[6];
            y2 = bez2[7];
          } else {
            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
            x2 = x2m;
            y2 = y2m;
          }
          const intr = interHelper(bez1, bez2, justCount);
          if (justCount) {
            // @ts-ignore
            res += intr;
          } else {
            // @ts-ignore
            for (let k = 0, kk = intr.length; k < kk; k++) {
              intr[k].segment1 = i;
              intr[k].segment2 = j;
              intr[k].bez1 = bez1;
              intr[k].bez2 = bez2;
            }
            // @ts-ignore
            res = res.concat(intr);
          }
        }
      }
    }
  }
  return res;
};

const intersection = function (path1, path2) {
  return interPathHelper(path1, path2);
};

function decasteljau(points, t) {
  const left = [];
  const right = [];

  function recurse(points, t) {
    if (points.length === 1) {
      left.push(points[0]);
      right.push(points[0]);
    } else {
      const middlePoints = [];
      for (let i = 0; i < points.length - 1; i++) {
        if (i === 0) {
          left.push(points[0]);
        }
        if (i === points.length - 2) {
          right.push(points[i + 1]);
        }
        middlePoints[i] = [
          (1 - t) * points[i][0] + t * points[i + 1][0],
          (1 - t) * points[i][1] + t * points[i + 1][1],
        ];
      }
      recurse(middlePoints, t);
    }
  }
  if (points.length) {
    recurse(points, t);
  }
  return { left, right: right.reverse() };
}

function splitCurve(start, end, count) {
  const points = [[start[1], start[2]]];
  count = count || 2;
  const segments = [];
  if (end[0] === 'A') {
    points.push(end[6]);
    points.push(end[7]);
  } else if (end[0] === 'C') {
    points.push([end[1], end[2]]);
    points.push([end[3], end[4]]);
    points.push([end[5], end[6]]);
  } else if (end[0] === 'S' || end[0] === 'Q') {
    points.push([end[1], end[2]]);
    points.push([end[3], end[4]]);
  } else {
    points.push([end[1], end[2]]);
  }

  let leftSegments = points;
  const t = 1 / count;

  for (let i = 0; i < count - 1; i++) {
    const rt = t / (1 - t * i);
    const split = decasteljau(leftSegments, rt);
    segments.push(split.left);
    leftSegments = split.right;
  }
  segments.push(leftSegments);
  const result = segments.map((segment) => {
    let cmd = [];
    if (segment.length === 4) {
      cmd.push('C');
      cmd = cmd.concat(segment[2]);
    }
    if (segment.length >= 3) {
      if (segment.length === 3) {
        cmd.push('Q');
      }
      cmd = cmd.concat(segment[1]);
    }
    if (segment.length === 2) {
      cmd.push('L');
    }
    cmd = cmd.concat(segment[segment.length - 1]);
    return cmd;
  });
  return result;
}

const splitSegment = function (start, end, count) {
  if (count === 1) {
    return [[].concat(start)];
  }
  let segments = [];
  if (end[0] === 'L' || end[0] === 'C' || end[0] === 'Q') {
    segments = segments.concat(splitCurve(start, end, count));
  } else {
    const temp = [].concat(start);
    if (temp[0] === 'M') {
      temp[0] = 'L';
    }
    for (let i = 0; i <= count - 1; i++) {
      segments.push(temp);
    }
  }
  return segments;
};

const fillPath = function (source, target) {
  if (source.length === 1) {
    return source;
  }
  const sourceLen = source.length - 1;
  const targetLen = target.length - 1;
  const ratio = sourceLen / targetLen;
  const segmentsToFill = [];
  if (source.length === 1 && source[0][0] === 'M') {
    for (let i = 0; i < targetLen - sourceLen; i++) {
      source.push(source[0]);
    }
    return source;
  }
  for (let i = 0; i < targetLen; i++) {
    const index = Math.floor(ratio * i);
    segmentsToFill[index] = (segmentsToFill[index] || 0) + 1;
  }
  const filled = segmentsToFill.reduce((filled, count, i) => {
    if (i === sourceLen) {
      return filled.concat(source[sourceLen]);
    }
    return filled.concat(splitSegment(source[i], source[i + 1], count));
  }, []);
  filled.unshift(source[0]);
  if (target[targetLen] === 'Z' || target[targetLen] === 'z') {
    filled.push('Z');
  }
  return filled;
};

const isEqual = function (obj1, obj2) {
  if (obj1.length !== obj2.length) {
    return false;
  }
  let result = true;
  each(obj1, (item, i) => {
    if (item !== obj2[i]) {
      result = false;
      return false;
    }
  });
  return result;
};
function getMinDiff(del, add, modify) {
  let type = null;
  let min = modify;
  if (add < min) {
    min = add;
    type = 'add';
  }
  if (del < min) {
    min = del;
    type = 'del';
  }
  return {
    type,
    min,
  };
}

/*
 * https://en.wikipedia.org/wiki/Levenshtein_distance
 * 计算两条path的编辑距离
 */
const levenshteinDistance = function (source, target) {
  const sourceLen = source.length;
  const targetLen = target.length;
  let sourceSegment;
  let targetSegment;
  let temp = 0;
  if (sourceLen === 0 || targetLen === 0) {
    return null;
  }
  const dist = [];
  for (let i = 0; i <= sourceLen; i++) {
    dist[i] = [];
    dist[i][0] = { min: i };
  }
  for (let j = 0; j <= targetLen; j++) {
    dist[0][j] = { min: j };
  }

  for (let i = 1; i <= sourceLen; i++) {
    sourceSegment = source[i - 1];
    for (let j = 1; j <= targetLen; j++) {
      targetSegment = target[j - 1];
      if (isEqual(sourceSegment, targetSegment)) {
        temp = 0;
      } else {
        temp = 1;
      }
      const del = dist[i - 1][j].min + 1;
      const add = dist[i][j - 1].min + 1;
      const modify = dist[i - 1][j - 1].min + temp;
      dist[i][j] = getMinDiff(del, add, modify);
    }
  }
  return dist;
};

const fillPathByDiff = function (source, target) {
  const diffMatrix = levenshteinDistance(source, target);
  let sourceLen = source.length;
  const targetLen = target.length;
  const changes = [];
  let index = 1;
  let minPos = 1;
  // 如果source和target不是完全不相等
  if (diffMatrix[sourceLen][targetLen].min !== sourceLen) {
    // 获取从source到target所需改动
    for (let i = 1; i <= sourceLen; i++) {
      let min = diffMatrix[i][i].min;
      minPos = i;
      for (let j = index; j <= targetLen; j++) {
        if (diffMatrix[i][j].min < min) {
          min = diffMatrix[i][j].min;
          minPos = j;
        }
      }
      index = minPos;
      if (diffMatrix[i][index].type) {
        changes.push({ index: i - 1, type: diffMatrix[i][index].type });
      }
    }
    // 对source进行增删path
    for (let i = changes.length - 1; i >= 0; i--) {
      index = changes[i].index;
      if (changes[i].type === 'add') {
        source.splice(index, 0, [].concat(source[index]));
      } else {
        source.splice(index, 1);
      }
    }
  }
  // source尾部补齐
  sourceLen = source.length;
  const diff = targetLen - sourceLen;
  if (sourceLen < targetLen) {
    for (let i = 0; i < diff; i++) {
      if (source[sourceLen - 1][0] === 'z' || source[sourceLen - 1][0] === 'Z') {
        source.splice(sourceLen - 2, 0, source[sourceLen - 2]);
      } else {
        source.push(source[sourceLen - 1]);
      }
      sourceLen += 1;
    }
  }
  return source;
};

// 将两个点均分成count个点
function _splitPoints(points, former, count) {
  const result = [].concat(points);
  let index;
  let t = 1 / (count + 1);
  const formerEnd = _getSegmentPoints(former)[0];
  for (let i = 1; i <= count; i++) {
    t *= i;
    index = Math.floor(points.length * t);
    if (index === 0) {
      result.unshift([formerEnd[0] * t + points[index][0] * (1 - t), formerEnd[1] * t + points[index][1] * (1 - t)]);
    } else {
      result.splice(index, 0, [
        formerEnd[0] * t + points[index][0] * (1 - t),
        formerEnd[1] * t + points[index][1] * (1 - t),
      ]);
    }
  }
  return result;
}

/*
 * 抽取pathSegment中的关键点
 * M,L,A,Q,H,V一个端点
 * Q, S抽取一个端点，一个控制点
 * C抽取一个端点，两个控制点
 */
function _getSegmentPoints(segment) {
  const points = [];
  switch (segment[0]) {
    case 'M':
      points.push([segment[1], segment[2]]);
      break;
    case 'L':
      points.push([segment[1], segment[2]]);
      break;
    case 'A':
      points.push([segment[6], segment[7]]);
      break;
    case 'Q':
      points.push([segment[3], segment[4]]);
      points.push([segment[1], segment[2]]);
      break;
    case 'T':
      points.push([segment[1], segment[2]]);
      break;
    case 'C':
      points.push([segment[5], segment[6]]);
      points.push([segment[1], segment[2]]);
      points.push([segment[3], segment[4]]);
      break;
    case 'S':
      points.push([segment[3], segment[4]]);
      points.push([segment[1], segment[2]]);
      break;
    case 'H':
      points.push([segment[1], segment[1]]);
      break;
    case 'V':
      points.push([segment[1], segment[1]]);
      break;
    default:
  }
  return points;
}

const formatPath = function (fromPath, toPath) {
  if (fromPath.length <= 1) {
    return fromPath;
  }
  let points;
  for (let i = 0; i < toPath.length; i++) {
    if (fromPath[i][0] !== toPath[i][0]) {
      // 获取fromPath的pathSegment的端点，根据toPath的指令对其改造
      points = _getSegmentPoints(fromPath[i]);
      switch (toPath[i][0]) {
        case 'M':
          fromPath[i] = ['M'].concat(points[0]);
          break;
        case 'L':
          fromPath[i] = ['L'].concat(points[0]);
          break;
        case 'A':
          fromPath[i] = [].concat(toPath[i]);
          fromPath[i][6] = points[0][0];
          fromPath[i][7] = points[0][1];
          break;
        case 'Q':
          if (points.length < 2) {
            if (i > 0) {
              points = _splitPoints(points, fromPath[i - 1], 1);
            } else {
              fromPath[i] = toPath[i];
              break;
            }
          }
          fromPath[i] = ['Q'].concat(
            points.reduce((arr, i) => {
              return arr.concat(i);
            }, [])
          );
          break;
        case 'T':
          fromPath[i] = ['T'].concat(points[0]);
          break;
        case 'C':
          if (points.length < 3) {
            if (i > 0) {
              points = _splitPoints(points, fromPath[i - 1], 2);
            } else {
              fromPath[i] = toPath[i];
              break;
            }
          }
          fromPath[i] = ['C'].concat(
            points.reduce((arr, i) => {
              return arr.concat(i);
            }, [])
          );
          break;
        case 'S':
          if (points.length < 2) {
            if (i > 0) {
              points = _splitPoints(points, fromPath[i - 1], 1);
            } else {
              fromPath[i] = toPath[i];
              break;
            }
          }
          fromPath[i] = ['S'].concat(
            points.reduce((arr, i) => {
              return arr.concat(i);
            }, [])
          );
          break;
        default:
          fromPath[i] = toPath[i];
      }
    }
  }
  return fromPath;
};

export {
  catmullRomToBezier,
  fillPath,
  fillPathByDiff,
  formatPath,
  intersection,
  parsePathArray,
  parsePathString,
  pathToAbsolute,
  pathToCurve,
  rectPath,
};
