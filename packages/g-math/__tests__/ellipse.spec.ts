import circle from '../src/circle';
import ellipse from '../src/ellipse';
import { Point } from '../src/types';
import { distance, piMod } from '../src/util';

function equalPoint(obj1: Point, obj2: Point) {
  return distance(obj1.x, obj1.y, obj2.x, obj2.y) < 0.3;
}

function equal(v1: number, v2: number) {
  return Math.abs(v1 - v2) < 0.01;
}

describe('test ellipse', () => {
  it('box', () => {
    expect(ellipse.box(0, 0, 10, 10)).toBe({
      x: -10,
      y: -10,
      width: 20,
      height: 20,
    });
    expect(ellipse.box(0, 0, 5, 10)).toBe({
      x: -5,
      y: -10,
      width: 10,
      height: 20,
    });
  });

  it('length', () => {
    expect(equal(ellipse.length(0, 0, 10, 10), Math.PI * 2 * 10)).toBe(true);
    expect(equal(ellipse.length(0, 0, 5, 10), 48.442)).toBe(true);
  });

  it('point at, use circle', () => {
    expect(ellipse.pointAt(0, 0, 10, 10, 0)).toBe({ x: 10, y: 0 });
    expect(
      equalPoint(ellipse.pointAt(0, 0, 10, 10, 0.5), { x: -10, y: 0 }),
    ).toBe(true);
    expect(
      equalPoint(
        ellipse.pointAt(0, 0, 10, 10, 0.3),
        circle.pointAt(0, 0, 10, 0.3),
      ),
    ).toBe(true);

    expect(ellipse.pointAt(100, 100, 10, 10, 0)).toBe({ x: 110, y: 100 });
    expect(
      equalPoint(ellipse.pointAt(100, 100, 10, 10, 0.5), {
        x: 100 - 10,
        y: 100,
      }),
    ).toBe(true);
  });

  it('point at, use ellipse', () => {
    expect(ellipse.pointAt(0, 0, 10, 5, 0)).toBe({ x: 10, y: 0 });
    expect(
      equalPoint(ellipse.pointAt(0, 0, 10, 5, 0.5), { x: -10, y: 0 }),
    ).toBe(true);
    const point = circle.pointAt(0, 0, 10, 0.3);
    expect(
      equalPoint(ellipse.pointAt(0, 0, 10, 5, 0.3), {
        x: point.x,
        y: point.y / 2,
      }),
    ).toBe(true);

    expect(ellipse.pointAt(10, 10, 10, 5, 0)).toBe({ x: 20, y: 10 });
  });

  it('nearest point, use circle', () => {
    const p1 = ellipse.nearestPoint(0, 0, 10, 10, 20, 0);
    const p2 = ellipse.nearestPoint(0, 0, 10, 10, 0, 20);
    const p3 = ellipse.nearestPoint(0, 0, 10, 10, -20, 0);
    expect(equalPoint(p1, { x: 10, y: 0 })).toBe(true);
    expect(equalPoint(p2, { x: 0, y: 10 })).toBe(true);
    expect(equalPoint(p3, { x: -10, y: 0 })).toBe(true);
  });

  it('nearest point, use ellipse', () => {
    const p1 = ellipse.nearestPoint(0, 0, 10, 5, 20, 0);
    const p2 = ellipse.nearestPoint(0, 0, 10, 5, 0, 20);
    const p3 = ellipse.nearestPoint(0, 0, 10, 5, -20, 0);
    const p4 = ellipse.nearestPoint(0, 0, 10, 5, 0, -20);
    expect(equalPoint(p1, { x: 10, y: 0 })).toBe(true);
    expect(equalPoint(p2, { x: 0, y: 5 })).toBe(true);
    expect(equalPoint(p3, { x: -10, y: 0 })).toBe(true);
    expect(equalPoint(p4, { x: 0, y: -5 })).toBe(true);
  });

  it('nearest point, exception', () => {
    expect(ellipse.nearestPoint(100, 100, 0, 5, 20, 30)).toBe({
      x: 100,
      y: 100,
    });
    // 点在椭圆上
    expect(
      equalPoint(ellipse.nearestPoint(100, 100, 20, 10, 120, 100), {
        x: 120,
        y: 100,
      }),
    ).toBe(true);
  });

  it('pointDistance', () => {
    expect(ellipse.pointDistance(0, 0, 10, 5, 20, 0)).equal(10);
  });

  it('tangent angle, circle', () => {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      const tangentAngle = ellipse.tangentAngle(
        100,
        100,
        10,
        10,
        (1 / count) * i,
      );
      expect(equal(tangentAngle, (angle + Math.PI / 2) % (Math.PI * 2))).toBe(
        true,
      );
    }
  });

  it('tangent angle ellipse', () => {
    expect(equal(ellipse.tangentAngle(100, 100, 20, 10, 0), Math.PI / 2)).toBe(
      true,
    );
    expect(equal(ellipse.tangentAngle(100, 100, 20, 10, 1 / 4), Math.PI)).toBe(
      true,
    );
  });

  it('tangent angle all', () => {
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      const tangentAngle0 = piMod(
        Math.atan2(10 * Math.cos(angle), -20 * Math.sin(angle)),
      );
      const tangentAngle = ellipse.tangentAngle(
        100,
        100,
        20,
        10,
        (1 / count) * i,
      );
      expect(equal(tangentAngle, tangentAngle0)).toBe(true);
    }
  });
});
