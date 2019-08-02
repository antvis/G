import { mod, toRadian} from './util';

// 向量长度
function vMag(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

// u.v/|u||v|
function vRatio(u, v) {
  return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
}

// 向量角度
function vAngle(u, v) {
  return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
}

// A 0:rx 1:ry 2:x-axis-rotation 3:large-arc-flag 4:sweep-flag 5: x 6: y
export default function getArcParams(startPoint, params) {
  let rx = params[1];
  let ry = params[2];
  const xRotation = mod(toRadian(params[3]), Math.PI * 2);
  const arcFlag = params[4];
  const sweepFlag = params[5];
  const x1 = startPoint[0];
  const y1 = startPoint[1];
  const x2 = params[6];
  const y2 = params[7];
  const xp = Math.cos(xRotation) * (x1 - x2) / 2.0 + Math.sin(xRotation) * (y1 - y2) / 2.0;
  const yp = -1 * Math.sin(xRotation) * (x1 - x2) / 2.0 + Math.cos(xRotation) * (y1 - y2) / 2.0;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const diff = (rx * rx) * (yp * yp) + (ry * ry) * (xp * xp);
  let f = Math.sqrt((((rx * rx) * (ry * ry)) - diff) / diff);

  if (arcFlag === sweepFlag) {
    f *= -1;
  }
  if (isNaN(f)) {
    f = 0;
  }

  const cxp = f * rx * yp / ry;
  const cyp = f * -ry * xp / rx;

  const cx = (x1 + x2) / 2.0 + Math.cos(xRotation) * cxp - Math.sin(xRotation) * cyp;
  const cy = (y1 + y2) / 2.0 + Math.sin(xRotation) * cxp + Math.cos(xRotation) * cyp;

  const theta = vAngle([ 1, 0 ], [ (xp - cxp) / rx, (yp - cyp) / ry ]);
  const u = [ (xp - cxp) / rx, (yp - cyp) / ry ];
  const v = [ (-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry ];
  let dTheta = vAngle(u, v);

  if (vRatio(u, v) <= -1) {
    dTheta = Math.PI;
  }
  if (vRatio(u, v) >= 1) {
    dTheta = 0;
  }
  if (sweepFlag === 0 && dTheta > 0) {
    dTheta = dTheta - 2 * Math.PI;
  }
  if (sweepFlag === 1 && dTheta < 0) {
    dTheta = dTheta + 2 * Math.PI;
  }
  return {
    cx,
    cy,
    rx,
    ry,
    startAngle: theta,
    endAngle: theta + dTheta,
    xRotation,
    arcFlag,
    sweepFlag,
  };
}