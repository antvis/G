import { Polygon, Circle } from '@antv/g';
import { expect } from 'chai';

describe('Polygon', () => {
  it('should calc global bounds correctly', () => {
    const points: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ];

    const polygon = new Polygon({
      style: {
        points,
      },
    });

    // get local position, left top corner
    expect(polygon.getLocalPosition()).eqls([0, 0, 0]);

    // get bounds
    const bounds = polygon.getBounds();
    if (bounds) {
      expect(bounds.center).eqls([50, 50, 0]);
      expect(bounds.halfExtents).eqls([50, 50, 0]);
    }
  });

  it('should append marker correctly', () => {
    const circle = new Circle({
      style: {
        r: 50,
      },
    });
    const points: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ];

    const polygon = new Polygon({
      style: {
        points,
        markerStart: circle,
        markerEnd: circle,
        markerMid: circle,
      },
    });
    expect(polygon.childNodes.length).eqls(5);

    polygon.style.markerStart = null;
    expect(polygon.childNodes.length).eqls(4);

    polygon.style.markerEnd = null;
    expect(polygon.childNodes.length).eqls(3);

    polygon.style.markerMid = null;
    expect(polygon.childNodes.length).eqls(0);

    polygon.style.markerStart = circle;
    polygon.style.markerStartOffset = 10;
    expect(polygon.childNodes.length).eqls(1);

    polygon.style.markerEnd = circle;
    polygon.style.markerEndOffset = 10;
    expect(polygon.childNodes.length).eqls(2);

    polygon.style.markerMid = circle;
    expect(polygon.childNodes.length).eqls(5);
  });
});
