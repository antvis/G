const expect = require('chai').expect;
import PathUtil from '../../../src/util/path';

describe('test path util', () => {
  it('has arc', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2]];
    const p2 = [['M', 1, 1], ['Q', 2, 2, 3, 3]];
    const p3 = [['M', 1, 1], ['L', 2, 2], ['C', 3, 3, 4, 4, 5, 5]];
    const p4 = [['M', 1, 1], ['L', 2, 2], ['A', 3, 3, 0, 1, 1, 8, 8]];
    expect(PathUtil.hasArc(p1)).eqls(false);
    expect(PathUtil.hasArc(p2)).eqls(true);
    expect(PathUtil.hasArc(p3)).eqls(true);
    expect(PathUtil.hasArc(p4)).eqls(true);
  });

  it('extract Polygons', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2], ['L', 3, 3], ['L', 4, 4], ['M', 5, 5], ['L', 6, 6], ['L', 7, 7], ['Z']];
    const rst = PathUtil.extractPolygons(p1);
    expect(rst.polygons.length).eqls(1);
    expect(rst.polylines.length).eqls(1);
    expect(rst.polygons[0].length).eqls(3);
    expect(rst.polylines[0].length).eqls(4);
  });

  it('not math m', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2], ['M', 3, 4], ['M', 5, 5], ['L', 6, 6], ['L', 7, 7], ['Z']];
    const rst = PathUtil.extractPolygons(p1);
    expect(rst.polygons.length).eqls(1);
    expect(rst.polylines.length).eqls(2);
  });
});
