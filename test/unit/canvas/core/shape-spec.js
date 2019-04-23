const expect = require('chai').expect;
const Shape = require('../../../../src/core/shape');
const Group = require('../../../../src/core/group');

describe('Shape', function() {
  it('clone path', () => {
    const path = new Shape.Path({
      attrs: {
        path: [
          [ 'M', 5, 5 ],
          [ 'L', 50, 50 ]
        ],
        stroke: '#666',
        lineDash: [ 1, 2, 3 ],
        lineWidth: 4
      }
    });
    expect(path).not.to.be.undefined;
    const clone = path.clone();
    expect(path._attrs.matrix[0]).to.equal(1);
    expect(clone._attrs.matrix[0]).to.equal(1);
    path._attrs.matrix[0] = 2;
    expect(path._attrs.matrix[0]).to.equal(2);
    expect(clone._attrs.matrix[0]).to.equal(1);

    expect(path._attrs.path[0][1]).to.equal(5);
    expect(clone._attrs.path[0][1]).to.equal(5);
    path._attrs.path[0][1] = 10;
    expect(path._attrs.path[0][1]).to.equal(10);
    expect(clone._attrs.path[0][1]).to.equal(5);
  });
  it('clone shape with parent', () => {
    const group = new Group();
    const polygon = group.addShape('polygon', {
      attrs: {
        points: [
          [ 10, 10 ], [ 20, 20 ], [ 50, 50 ]
        ]
      },
      zIndex: 11
    });
    expect(polygon._cfg.parent).not.to.be.undefined;
    const clone = polygon.clone();
    expect(polygon._cfg.parent).not.to.be.undefined;
    expect(clone._cfg.parent).to.be.undefined;
    expect(polygon._attrs.points[0][0]).to.equal(10);
    expect(clone._attrs.points[0][0]).to.equal(10);
    polygon._attrs.points[0][0] = 20;
    expect(polygon._attrs.points[0][0]).to.equal(20);
    expect(clone._attrs.points[0][0]).to.equal(10);
    expect(clone._cfg.zIndex).to.equal(11);
  });
});
