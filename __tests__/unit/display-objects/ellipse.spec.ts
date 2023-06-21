import { Ellipse } from '../../../packages/g/src';

describe('Ellipse', () => {
  it('should calc global bounds correctly', () => {
    const ellipse = new Ellipse({
      style: {
        cx: 100,
        cy: 100,
        rx: 100,
        ry: 100,
      },
    });

    let bounds = ellipse.getBounds();
    let geometryBounds = ellipse.getGeometryBounds();

    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    ellipse.setAttribute('rx', 10);
    ellipse.setAttribute('ry', 10);
    bounds = ellipse.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }

    // change anchor from center to left-top corner, r = 10
    ellipse.style.anchor = [0, 0];
    expect(ellipse.getLocalPosition()).toStrictEqual([100, 100, 0]);
    bounds = ellipse.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([110, 110, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    ellipse.style.anchor = [1, 1];
    expect(ellipse.getLocalPosition()).toStrictEqual([100, 100, 0]);
    bounds = ellipse.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([90, 90, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    geometryBounds = ellipse.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([-10, -10, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
  });
});
