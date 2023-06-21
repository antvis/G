import { Point } from '../../../packages/g-lite/src';

describe('Point', () => {
  test('should create Point correctly.', () => {
    const point = new Point();
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);

    const point2 = new Point(1, 1);
    expect(point2.x).toBe(1);
    expect(point2.y).toBe(1);
  });

  test('should clone Point correctly.', () => {
    const point = new Point(1, 1);
    expect(point.x).toBe(1);
    expect(point.y).toBe(1);

    const point2 = point.clone();
    expect(point2.x).toBe(1);
    expect(point2.y).toBe(1);
  });

  test('should copy from Point correctly.', () => {
    const point = new Point(1, 1);
    expect(point.x).toBe(1);
    expect(point.y).toBe(1);

    const point2 = new Point(2, 2);
    point.copyFrom(point2);
    expect(point.x).toBe(2);
    expect(point.y).toBe(2);
  });
});
