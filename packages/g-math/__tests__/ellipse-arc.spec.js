import { expect } from 'chai';
import arc from '../src/arc';
import { distance } from '../src/util';

function equal(v1, v2) {
  return Math.abs(v1 - v2) < 0.01;
}

function equalPoint(obj1, obj2) {
  return distance(obj1.x, obj1.y, obj2.x, obj2.y) < 0.3;
}

function equalBox(box1, box2) {
  return (
    equal(box1.x, box2.x) && equal(box1.y, box2.y) && equal(box1.width, box2.width) && equal(box1.height, box2.height)
  );
}

function rotation(center, p, angle) {
  const relativeX = p.x - center.x;
  const relativeY = p.y - center.y;
  return {
    x: relativeX * Math.cos(angle) - relativeY * Math.sin(angle) + center.x,
    y: relativeX * Math.sin(angle) + relativeY * Math.cos(angle) + center.y,
  };
}

describe('ellipse arc test', () => {
  it('point at, circle', () => {
    // 1/2 圆弧，未旋转
    expect(equalPoint(arc.pointAt(0, 0, 10, 10, 0, 0, Math.PI, 0), { x: 10, y: 0 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 10, 10, 0, 0, Math.PI, 1), { x: -10, y: 0 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 10, 10, 0, 0, Math.PI, 0.5), { x: 0, y: 10 })).eqls(true);

    // 1/2 圆弧，旋转90度
    expect(equalPoint(arc.pointAt(0, 0, 10, 10, Math.PI / 2, 0, Math.PI, 0), { x: 0, y: 10 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 10, 10, Math.PI / 2, 0, Math.PI, 1), { x: 0, y: -10 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 10, 10, Math.PI / 2, 0, Math.PI, 0.5), { x: -10, y: 0 })).eqls(true);
  });

  it('point at, ellipse', () => {
    // 1/2 椭圆圆弧，未旋转
    expect(equalPoint(arc.pointAt(0, 0, 20, 10, 0, 0, Math.PI, 0), { x: 20, y: 0 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 20, 10, 0, 0, Math.PI, 1), { x: -20, y: 0 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 20, 10, 0, 0, Math.PI, 0.5), { x: 0, y: 10 })).eqls(true);

    // 1/2 椭圆圆弧，旋转90度
    expect(equalPoint(arc.pointAt(0, 0, 20, 10, Math.PI / 2, 0, Math.PI, 0), { x: 0, y: 20 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 20, 10, Math.PI / 2, 0, Math.PI, 1), { x: 0, y: -20 })).eqls(true);
    expect(equalPoint(arc.pointAt(0, 0, 20, 10, Math.PI / 2, 0, Math.PI, 0.5), { x: -10, y: 0 })).eqls(true);
  });

  it('box, circle', () => {
    // 1/2 圆弧，未旋转
    expect(arc.box(0, 0, 10, 10, 0, 0, Math.PI)).eqls({
      x: -10,
      y: 0,
      width: 20,
      height: 10,
    });
    // 1/2 圆弧，旋转 90
    expect(arc.box(0, 0, 10, 10, Math.PI / 2, 0, Math.PI)).eqls({
      x: -10,
      y: -10,
      width: 10,
      height: 20,
    });

    const box = arc.box(0, 0, 10, 10, Math.PI / 2, 0, Math.PI / 2);
    // 1 / 4 圆弧，旋转 90
    expect(
      equalBox(box, {
        x: -10,
        y: 0,
        width: 10,
        height: 10,
      })
    ).eqls(true);
  });
  it('box circle 45', () => {
    // 1 / 4 圆弧，旋转 45
    const xRotation = Math.PI / 4;
    const box1 = arc.box(0, 0, 10, 10, xRotation, 0, Math.PI / 2);
    expect(
      equalBox(box1, {
        x: 0 - Math.cos(xRotation) * 10,
        y: Math.sin(xRotation) * 10,
        width: Math.cos(xRotation) * 10 * 2,
        height: 10 - Math.sin(xRotation) * 10,
      })
    ).eqls(true);
  });
  it('box, ellipse', () => {
    // 1/2 圆弧，未旋转
    expect(arc.box(0, 0, 20, 10, 0, 0, Math.PI)).eqls({
      x: -20,
      y: 0,
      width: 40,
      height: 10,
    });
    // 1/2 圆弧，旋转 90
    expect(
      equalBox(arc.box(0, 0, 20, 10, Math.PI / 2, 0, Math.PI), {
        x: -10,
        y: -20,
        width: 10,
        height: 40,
      })
    ).eqls(true);
  });

  it('box, ellipse 45', () => {
    // 1 / 4 圆弧，旋转 45
    const xRotation = Math.PI / 4;
    const box = arc.box(100, 100, 20, 10, xRotation, 0, Math.PI / 2);
    const p1 = arc.pointAt(100, 100, 20, 10, 0, 0, Math.PI / 2, 0);
    const p2 = arc.pointAt(100, 100, 20, 10, 0, 0, Math.PI / 2, 1);
    const p11 = rotation({ x: 100, y: 100 }, p1, xRotation);
    const p21 = rotation({ x: 100, y: 100 }, p2, xRotation);

    // ctx.beginPath();
    // ctx.ellipse(100, 100, 20, 10, xRotation, 0, Math.PI);
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.strokeRect(box.x, box.y, box.width, box.height);
    expect(box.x).eqls(p21.x);
    expect(box.y).eqls(p21.y);
    expect(box.width).eqls(p11.x - p21.x);
  });

  it('box, ellipse 0 when startAngle > endAngle', () => {
    // 1 / 2 圆弧，旋转 0
    const xRotation = 0;
    const box = arc.box(100, 100, 20, 10, xRotation, Math.PI, 0);
    const p1 = arc.pointAt(100, 100, 20, 10, 0, Math.PI, 0, 0);
    const p2 = arc.pointAt(100, 100, 20, 10, 0, Math.PI, 0, 1);
    const p11 = rotation({ x: 100, y: 100 }, p1, xRotation);
    const p21 = rotation({ x: 100, y: 100 }, p2, xRotation);

    // ctx.beginPath();
    // ctx.ellipse(100, 100, 20, 10, xRotation, 0, Math.PI);
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.strokeRect(box.x, box.y, box.width, box.height);
    expect(box.x).eqls(p11.x);
    expect(box.y).eqls(p11.y);
    expect(box.width).eqls(p21.x - p11.x);
    expect(box.height).eqls(10);
  });

  it('box, ellipse 90 when startAngle > endAngle', () => {
    // 1 / 2 圆弧，旋转 90
    const xRotation = Math.PI / 2;
    const box = arc.box(100, 100, 20, 10, xRotation, Math.PI, 0);
    const p1 = arc.pointAt(100, 100, 20, 10, 0, Math.PI, 0, 0);
    const p2 = arc.pointAt(100, 100, 20, 10, 0, Math.PI, 0, 1);
    const p11 = rotation({ x: 100, y: 100 }, p1, xRotation);
    const p21 = rotation({ x: 100, y: 100 }, p2, xRotation);

    // ctx.beginPath();
    // ctx.ellipse(100, 100, 20, 10, xRotation, 0, Math.PI);
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.strokeRect(box.x, box.y, box.width, box.height);
    expect(box.x).eqls(p21.x - 10);
    expect(box.y).eqls(p11.y);
    expect(box.width).eqls(10);
    expect(box.height).eqls(40);
  });

  it('tangent angle', () => {
    expect(arc.tangentAngle(0, 0, 10, 10, 0, 0, Math.PI, 0)).eqls(Math.PI / 2);
    expect(arc.tangentAngle(0, 0, 10, 10, 0, 0, Math.PI, 1)).eqls(Math.PI / 2 + Math.PI);
    expect(arc.tangentAngle(0, 0, 10, 10, 0, 0, Math.PI, 0.5)).eqls(Math.PI);
  });

  it('nearestPoint, in range', () => {});

  it('nearestPoint, not in range', () => {});
  // 不再圆弧范围内，但是椭圆上最近点的对称点在圆弧内，需要进行判定
  it('nearestPoint, not in range 2', () => {});

  it('length', () => {
    // to do
  });
});
