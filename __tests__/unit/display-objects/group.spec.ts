import { Group, Circle, CSS, CSSRGB } from '../../../packages/g/src';

describe('Group', () => {
  it("should calc Circle's GeometryBounds, RenderBounds, Bounds and LocalBounds correctly", () => {
    const group = new Group({
      style: {
        transform: 'translate(100, 100)',
      },
    });
    const group2 = new Group({
      style: {
        transform: 'translate(100, 100)',
      },
    });
    group.appendChild(group2);

    let bounds = group.getBounds();
    const localBounds = group.getLocalBounds();
    let geometryBounds = group.getGeometryBounds();
    const renderBounds = group.getRenderBounds();
    const bbox = group.getBBox();

    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(0);
    expect(bbox.width).toBe(0);
    expect(bbox.height).toBe(0);

    if (bounds) {
      expect(bounds.center).toStrictEqual([0, 0, 0]);
      expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);
    }
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([0, 0, 0]);
      expect(localBounds.halfExtents).toStrictEqual([0, 0, 0]);
    }
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([0, 0, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([0, 0, 0]);
    }
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([0, 0, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([0, 0, 0]);
    }

    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });
    group2.appendChild(circle);
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([300, 300, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    circle.remove();
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([0, 0, 0]);
      expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);
    }
  });
});
