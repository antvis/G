import { expect } from 'chai';
import { Group, Shapes } from '../../../../src/index';

describe('Shape', function() {
  it('clone path', () => {
    const path = new Shapes.Path({
      attrs: {
        path: [['M', 5, 5], ['L', 50, 50]],
        stroke: '#666',
        lineDash: [1, 2, 3],
        lineWidth: 4,
      },
    });
    expect(path).not.to.be.undefined;
    const clone = path.clone();
    expect(path.attrs.matrix[0]).to.equal(1);
    expect(clone.attrs.matrix[0]).to.equal(1);
    path.attrs.matrix[0] = 2;
    expect(path.attrs.matrix[0]).to.equal(2);
    expect(clone.attrs.matrix[0]).to.equal(1);

    expect(path.attrs.path[0][1]).to.equal(5);
    expect(clone.attrs.path[0][1]).to.equal(5);
    path.attrs.path[0][1] = 10;
    expect(path.attrs.path[0][1]).to.equal(10);
    expect(clone.attrs.path[0][1]).to.equal(5);
  });
  it('clone shape with parent', () => {
    const group = new Group();
    const polygon = group.addShape('polygon', {
      attrs: {
        points: [[10, 10], [20, 20], [50, 50]],
      },
    });
    expect(polygon.cfg.parent).not.to.be.null;
    const clone = polygon.clone();
    expect(polygon.cfg.parent).not.to.be.null;
    expect(clone.cfg.parent).to.be.null;
    expect(polygon.attrs.points[0][0]).to.equal(10);
    expect(clone.attrs.points[0][0]).to.equal(10);
    polygon.attrs.points[0][0] = 20;
    expect(polygon.attrs.points[0][0]).to.equal(20);
    expect(clone.attrs.points[0][0]).to.equal(10);
  });
});
