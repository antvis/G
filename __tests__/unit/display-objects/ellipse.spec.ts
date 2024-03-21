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
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    ellipse.setAttribute('rx', 10);
    ellipse.setAttribute('ry', 10);
    bounds = ellipse.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
  });
});
