const expect = require('chai').expect;
import { distance } from '../../src/util';
import { nearestPoint, snapLength } from '../../src/bezier';
import quad from '../../src/quadratic';
import cubic from '../../src/cubic';

const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function equalPoint(obj1, obj2) {
  return distance(obj1.x, obj1.y, obj2.x, obj2.y) < 0.3;
}

// 由于曲线运算都是逼近算法，容忍度高一些
function snapEqual(v1, v2) {
  return Math.abs(v1 - v2) < 0.3;
}

const SPLIT_COUNT = 100;

// 通过分割法，计算近似长度
function splitQuadLength(x1, y1, x2, y2, x3, y3) {
  let prePoint = { x: x1, y: y1 };
  let totalLength = 0;
  for (let i = 1; i <= SPLIT_COUNT; i++) {
    const point = quad.pointAt(x1, y1, x2, y2, x3, y3, i / SPLIT_COUNT);
    totalLength += distance(prePoint.x, prePoint.y, point.x, point.y);
    prePoint = point;
  }
  return totalLength;
}

// 通过分割法，计算近似长度
function splitCubicLength(x1, y1, x2, y2, x3, y3, x4, y4) {
  let prePoint = { x: x1, y: y1 };
  let totalLength = 0;
  for (let i = 1; i <= SPLIT_COUNT; i++) {
    const point = cubic.pointAt(x1, y1, x2, y2, x3, y3, x4, y4, i / SPLIT_COUNT);
    totalLength += distance(prePoint.x, prePoint.y, point.x, point.y);
    prePoint = point;
  }
  return totalLength;
}

describe('bezier util test', () => {
  it('nearest point quadratic', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    const p1 = nearestPoint([x1, x2, x3], [y1, y2, y3], 50, 60, quad.interpolationAt);
    expect(equalPoint(p1, quad.pointAt(x1, y1, x2, y2, x3, y3, 0.5))).eqls(true);
    // 在外面
    const p2 = nearestPoint([x1, x2, x3], [y1, y2, y3], -10, -10, quad.interpolationAt);
    expect(p2).eqls({
      x: 0,
      y: 0,
    });
    // 同尾部对齐
    const p3 = nearestPoint([x1, x2, x3], [y1, y2, y3], 102, 0, quad.interpolationAt);
    expect(equalPoint(p3, { x: 100, y: 0 })).eqls(true);

    const p = quad.pointAt(x1, y1, x2, y2, x3, y3, 0.2);
    const p4 = nearestPoint([x1, x2, x3], [y1, y2, y3], p.x, p.y + 2, quad.interpolationAt);
    expect(distance(p.x, p.y + 2, p4.x, p4.y) <= 2).eqls(true);
  });

  it('draw quad', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(50, 50, 100, 0);
    ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      const p1 = quad.pointAt(x1, y1, x2, y2, x3, y3, 0.1 * i);
      const p2 = nearestPoint([x1, x2, x3], [y1, y2, y3], p1.x, p1.y + 10, quad.interpolationAt);
      expect(distance(p1.x, p1.y + 10, p2.x, p2.y) <= 10).eqls(true);
      ctx.moveTo(p1.x, p1.y + 10);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  });

  it('nearest point cubic', () => {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = [100, 100, 150, 50, 250, 150, 300, 100];
    const p1 = nearestPoint([x1, x2, x3, x4], [y1, y2, y3, y4], 200, 100, cubic.interpolationAt);
    expect(p1).eqls({ x: 200, y: 100 });

    const p2 = nearestPoint([x1, x2, x3, x4], [y1, y2, y3, y4], 90, 120, cubic.interpolationAt);
    expect(p2).eqls({ x: 100, y: 100 });
    const p3 = nearestPoint([x1, x2, x3, x4], [y1, y2, y3, y4], 400, 120, cubic.interpolationAt);
    expect(p3).eqls({ x: 300, y: 100 });
  });

  it('draw cubic', () => {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = [100, 100, 150, 50, 250, 150, 300, 100];
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
    ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      const p1 = cubic.pointAt(x1, y1, x2, y2, x3, y3, x4, y4, 0.1 * i);
      const p2 = nearestPoint([x1, x2, x3, x4], [y1, y2, y3, y4], p1.x, p1.y + 10, cubic.interpolationAt);
      expect(distance(p1.x, p1.y + 10, p2.x, p2.y) <= 10).eqls(true);
      ctx.moveTo(p1.x, p1.y + 10);
      ctx.lineTo(p1.x, p1.y);
    }
    ctx.stroke();
  });

  it('sanpLength', () => {
    // 只有一个点
    expect(snapLength([0], [0])).eqls(0);
    // 两个点
    expect(snapLength([0, 100], [0, 100])).eqls(distance(0, 0, 100, 100));

    // 三个点
    expect(snapLength([0, 50, 100], [0, 50, 0])).eqls(
      (distance(0, 0, 50, 50) + distance(50, 50, 100, 0) + distance(0, 0, 100, 0)) / 2
    );
  });
});

describe('quadratic test', () => {
  it('point at', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    expect(quad.pointAt(x1, y1, x2, y2, x3, y3, 0)).eqls({ x: 0, y: 0 });
    expect(quad.pointAt(x1, y1, x2, y2, x3, y3, 0.5)).eqls({ x: 50, y: 25 });
    expect(quad.pointAt(x1, y1, x2, y2, x3, y3, 1)).eqls({ x: 100, y: 0 });
  });
  it('box symetric', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    const box = quad.box(x1, y1, x2, y2, x3, y3);
    expect(box).eqls({
      x: 0,
      y: 0,
      width: 100,
      height: 25,
    });
  });

  it('box not symetric', () => {
    ctx.clearRect(0, 0, 200, 200);
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 10, 60, 100, 0];
    const box = quad.box(x1, y1, x2, y2, x3, y3);

    expect(box).eqls({
      x: 0,
      y: 0,
      width: 100,
      height: 30,
    });
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  });

  it('divide', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    const subs = quad.divide(x1, y1, x2, y2, x3, y3, 0.5);
    expect(subs[0]).eqls([0, 0, 25, 25, 50, 25]);
    expect(subs[1]).eqls([50, 25, 75, 25, 100, 0]);
  });

  it('line length', () => {
    expect(quad.length(0, 0, 50, 0, 100, 0)).eqls(100);
    expect(quad.length(100, 100, 100, 50, 100, 0)).eqls(100);
  });

  it('curve length symetric', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    expect(snapEqual(quad.length(x1, y1, x2, y2, x3, y3), splitQuadLength(x1, y1, x2, y2, x3, y3))).eqls(true);
  });

  it('curve length not symetric', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 10, 50, 100, 0];
    expect(snapEqual(quad.length(x1, y1, x2, y2, x3, y3), splitQuadLength(x1, y1, x2, y2, x3, y3))).eqls(true);
  });

  it('neareast point', () => {
    ctx.clearRect(0, 0, 200, 200);
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 10, 50, 100, 0];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const point = quad.pointAt(x1, y1, x2, y2, x3, y3, i / 10);
      const nearestPoint = quad.nearestPoint(x1, y1, x2, y2, x3, y3, point.x, point.y + 5);
      // 判定
      expect(distance(nearestPoint.x, nearestPoint.y, point.x, point.y + 5) <= 5).eqls(true);
      ctx.moveTo(point.x, point.y + 5);
      ctx.lineTo(nearestPoint.x, nearestPoint.y);
    }
    ctx.stroke();
  });

  it('point distance', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    expect(quad.pointDistance(x1, y1, x2, y2, x3, y3, 50, 70)).eqls(45);

    expect(quad.pointDistance(x1, y1, x2, y2, x3, y3, -10, 0)).eqls(10);
    expect(quad.pointDistance(x1, y1, x2, y2, x3, y3, 110, 0)).eqls(10);
  });

  it('angle', () => {
    const [x1, y1, x2, y2, x3, y3] = [0, 0, 50, 50, 100, 0];
    expect(quad.tangentAngle(x1, y1, x2, y2, x3, y3, 0)).eqls(Math.PI / 4);
    expect(quad.tangentAngle(x1, y1, x2, y2, x3, y3, 1)).eqls((Math.PI * 3) / 4 + Math.PI);
  });
});

function drawCubicBox(params, box) {
  ctx.beginPath();
  ctx.moveTo(params[0], params[1]);
  ctx.bezierCurveTo(params[2], params[3], params[4], params[5], params[6], params[7]);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

describe('cubic test', () => {
  const params1 = [0, 100, 25, 150, 75, 50, 100, 100];
  const params2 = [200, 200, 250, 200, 275, 300, 300, 300];
  const params3 = [100, 200, 80, 100, 160, 220, 200, 200];
  it('point at', () => {
    expect(cubic.pointAt(...params1, 0)).eqls({ x: 0, y: 100 });
    expect(cubic.pointAt(...params1, 1)).eqls({ x: 100, y: 100 });
    expect(cubic.pointAt(...params1, 0.5)).eqls({ x: 50, y: 100 });
    expect(cubic.pointAt(...params1, 0.25)).eqls({ x: 22.65625, y: 114.0625 });
  });
  it('box', () => {
    ctx.clearRect(0, 0, 200, 200);
    const box = cubic.box(...params1);
    drawCubicBox(params1, box);

    expect(box).eqls({ x: 0, y: 85.56624327025935, width: 100, height: 28.867513459481287 });
  });

  it('box 2', () => {
    const box = cubic.box(...params2);
    drawCubicBox(params2, box);
    expect(box).eqls({ x: 200, y: 200, width: 100, height: 100 });
  });

  it('box 3', () => {
    const box = cubic.box(...params3);
    drawCubicBox(params3, box);
    expect(box).eqls({
      x: 96.84283071987988,
      y: 159.6789265126258,
      width: 103.15716928012012,
      height: 42.617455616723674,
    });
  });

  it('length', () => {
    expect(cubic.length(0, 0, 50, 0, 100, 0, 150, 0)).eqls(150);
    expect(snapEqual(cubic.length(...params1), splitCubicLength(...params1))).eqls(true);
    expect(snapEqual(cubic.length(...params2), splitCubicLength(...params2))).eqls(true);
    expect(snapEqual(cubic.length(...params3), splitCubicLength(...params3))).eqls(true);
  });

  it('nearestPoint', () => {
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const point = cubic.pointAt(...params1, i / 10);
      const nearestPoint = cubic.nearestPoint(...params1, point.x, point.y + 5);
      // 判定
      expect(distance(nearestPoint.x, nearestPoint.y, point.x, point.y + 5) <= 5).eqls(true);
      ctx.moveTo(point.x, point.y + 5);
      ctx.lineTo(nearestPoint.x, nearestPoint.y);
    }
    ctx.stroke();
  });

  it('point distance', () => {
    expect(cubic.pointDistance(...params1, -10, 100)).eqls(10);
    expect(cubic.pointDistance(...params1, 110, 100)).eqls(10);
    expect(snapEqual(cubic.pointDistance(...params1, 20, 120), 5.598)).eqls(true);
  });

  it('angle', () => {
    const yarr = cubic.extrema(params1[1], params1[3], params1[5], params1[7]);
    expect(cubic.tangentAngle(...params1, yarr[0])).eqls(0);
    expect(cubic.tangentAngle(...params1, yarr[1])).eqls(0);
  });

  it('tangentAngle', () => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const angle = cubic.tangentAngle(...params1, t);
      const point = cubic.pointAt(...params1, t);
      const nextPoint = {
        x: point.x + Math.cos(angle) * 5,
        y: point.y + Math.sin(angle) * 5,
      };
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
    }
    ctx.stroke();
    ctx.restore();
  });

  it('divide', () => {
    ctx.clearRect(0, 0, 500, 500);
    const subs = cubic.divide(...params1, 0.5);
    expect(subs[0]).eqls([0, 100, 12.5, 125, 31.25, 112.5, 50, 100]);
    expect(subs[1]).eqls([50, 100, 68.75, 87.5, 87.5, 75, 100, 100]);
    drawCubicBox(subs[0], cubic.box(...subs[0]));
    drawCubicBox(subs[1], cubic.box(...subs[1]));
  });
});
