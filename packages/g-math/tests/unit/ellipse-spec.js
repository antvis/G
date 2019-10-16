const expect = require('chai').expect;
import ellipse from '../../src/ellipse';
import circle from '../../src/circle';
import { distance, piMod } from '../../src/util';

function equalPoint(obj1, obj2) {
  return distance(obj1.x, obj1.y, obj2.x, obj2.y) < 0.3;
}

function equal(v1, v2) {
  return Math.abs(v1 - v2) < 0.01;
}

const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('test ellipse', () => {
  it('box', () => {
    expect(ellipse.box(0, 0, 10, 10)).eqls({
      x: -10,
      y: -10,
      width: 20,
      height: 20,
    });
    expect(ellipse.box(0, 0, 5, 10)).eqls({
      x: -5,
      y: -10,
      width: 10,
      height: 20,
    });
  });

  it('length', () => {
    expect(equal(ellipse.length(0, 0, 10, 10), Math.PI * 2 * 10)).eqls(true);
    expect(equal(ellipse.length(0, 0, 5, 10), 48.442)).eqls(true);
  });

  it('point at, use circle', () => {
    expect(ellipse.pointAt(0, 0, 10, 10, 0)).eqls({ x: 10, y: 0 });
    expect(equalPoint(ellipse.pointAt(0, 0, 10, 10, 0.5), { x: -10, y: 0 })).eqls(true);
    expect(equalPoint(ellipse.pointAt(0, 0, 10, 10, 0.3), circle.pointAt(0, 0, 10, 0.3))).eqls(true);

    expect(ellipse.pointAt(100, 100, 10, 10, 0)).eqls({ x: 110, y: 100 });
    expect(equalPoint(ellipse.pointAt(100, 100, 10, 10, 0.5), { x: 100 - 10, y: 100 })).eqls(true);
  });

  it('point at, use ellipse', () => {
    expect(ellipse.pointAt(0, 0, 10, 5, 0)).eqls({ x: 10, y: 0 });
    expect(equalPoint(ellipse.pointAt(0, 0, 10, 5, 0.5), { x: -10, y: 0 })).eqls(true);
    const point = circle.pointAt(0, 0, 10, 0.3);
    expect(equalPoint(ellipse.pointAt(0, 0, 10, 5, 0.3), { x: point.x, y: point.y / 2 })).eqls(true);

    expect(ellipse.pointAt(10, 10, 10, 5, 0)).eqls({ x: 20, y: 10 });
  });

  it('nearest point, use circle', () => {
    const p1 = ellipse.nearestPoint(0, 0, 10, 10, 20, 0);
    const p2 = ellipse.nearestPoint(0, 0, 10, 10, 0, 20);
    const p3 = ellipse.nearestPoint(0, 0, 10, 10, -20, 0);
    expect(equalPoint(p1, { x: 10, y: 0 })).eqls(true);
    expect(equalPoint(p2, { x: 0, y: 10 })).eqls(true);
    expect(equalPoint(p3, { x: -10, y: 0 })).eqls(true);
  });

  it('nearest point, use ellipse', () => {
    const p1 = ellipse.nearestPoint(0, 0, 10, 5, 20, 0);
    const p2 = ellipse.nearestPoint(0, 0, 10, 5, 0, 20);
    const p3 = ellipse.nearestPoint(0, 0, 10, 5, -20, 0);
    const p4 = ellipse.nearestPoint(0, 0, 10, 5, 0, -20);
    expect(equalPoint(p1, { x: 10, y: 0 })).eqls(true);
    expect(equalPoint(p2, { x: 0, y: 5 })).eqls(true);
    expect(equalPoint(p3, { x: -10, y: 0 })).eqls(true);
    expect(equalPoint(p4, { x: 0, y: -5 })).eqls(true);
  });

  it('nearest point, exception', () => {
    expect(ellipse.nearestPoint(100, 100, 0, 5, 20, 30)).eqls({ x: 100, y: 100 });
    // 点在椭圆上
    expect(equalPoint(ellipse.nearestPoint(100, 100, 20, 10, 120, 100), { x: 120, y: 100 })).eqls(true);
  });

  it('pointDistance', () => {
    expect(ellipse.pointDistance(0, 0, 10, 5, 20, 0)).equal(10);
  });

  it('tangent angle, circle', () => {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      const tangentAngle = ellipse.tangentAngle(100, 100, 10, 10, (1 / count) * i);
      expect(equal(tangentAngle, (angle + Math.PI / 2) % (Math.PI * 2))).eqls(true);
    }
  });

  it('tangent angle ellipse', () => {
    expect(equal(ellipse.tangentAngle(100, 100, 20, 10, 0), Math.PI / 2)).eqls(true);
    expect(equal(ellipse.tangentAngle(100, 100, 20, 10, 1 / 4), Math.PI)).eqls(true);
  });

  it('tangent angle all', () => {
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      const tangentAngle0 = piMod(Math.atan2(10 * Math.cos(angle), -20 * Math.sin(angle)));
      const tangentAngle = ellipse.tangentAngle(100, 100, 20, 10, (1 / count) * i);
      expect(equal(tangentAngle, tangentAngle0)).eqls(true);
    }
  });

  it('draw ellipse', () => {
    ctx.ellipse(100, 100, 20, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      const point = {
        x: 100 + 40 * Math.cos(angle),
        y: 100 + 40 * Math.sin(angle),
      };
      const near = ellipse.nearestPoint(100, 100, 20, 10, point.x, point.y);
      ctx.moveTo(near.x, near.y);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  });
});
