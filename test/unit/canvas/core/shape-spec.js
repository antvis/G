const expect = require('chai').expect;
const Shape = require('../../../../src/core/shape');

describe('Shape', function() {
  it('clone shape', () => {
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
});
