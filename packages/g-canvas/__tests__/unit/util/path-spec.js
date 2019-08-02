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

  it('get segments', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2]];
    const p2 = [['M', 1, 1], ['Q', 2, 2, 3, 3]];
    // const p3 = [['M', 1, 1], ['L', 2, 2], ['C', 3, 3, 4, 4, 5, 5]];
    const p4 = [['M', 1, 1], ['L', 2, 2], ['A', 3, 3, 0, 1, 1, 8, 8], ['Z'], ['M', 20, 20], ['L', 30, 30]];
    const seg1 = PathUtil.getSegments(p1);
    expect(seg1.length).eqls(p1.length);
    expect(seg1[0].command).eqls('M');
    expect(seg1[1].command).eqls('L');
    expect(seg1[0].currentPoint).eqls([1, 1]);
    expect(seg1[1].prePoint).eqls([1, 1]);
    expect(seg1[1].currentPoint).eqls([2, 2]);

    const seg2 = PathUtil.getSegments(p2);
    expect(seg2[1].prePoint).eqls([1, 1]);
    expect(seg2[1].currentPoint).eqls([3, 3]);
    const seg4 = PathUtil.getSegments(p4);
    expect(seg4.length).eqls(p4.length);
    expect(seg4[3].command).eqls('Z');
    expect(seg4[3].prePoint).eqls([8, 8]);
    expect(seg4[3].currentPoint).eqls([1, 1]);
  });

  it('getPathBox', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2]];
    const p2 = [['M', 1, 1], ['Q', 2, 2, 3, 1]];
    const p3 = [['M', 1, 1], ['L', 2, 2], ['C', 3, 1, 4, 3, 5, 2]];
    const p4 = [['M', 1, 1], ['L', 2, 2], ['A', 2, 2, 0, 1, 1, 6, 2], ['Z'], ['M', 20, 20], ['L', 30, 30]];
    const seg1 = PathUtil.getSegments(p1);
    expect(PathUtil.getPathBox(seg1)).eqls({
      x: 1,
      y: 1,
      width: 1,
      height: 1,
    });

    const seg2 = PathUtil.getSegments(p2);
    expect(PathUtil.getPathBox(seg2)).eqls({ x: 1, y: 1, width: 2, height: 0.5 });

    const seg3 = PathUtil.getSegments(p3);

    expect(PathUtil.getPathBox(seg3)).eqls({
      x: 1,
      y: 1,
      width: 4,
      height: seg3[2].box.height / 2 + 1, // 一半 box 生效
    });
    const seg4 = PathUtil.getSegments(p4);
    expect(PathUtil.getPathBox(seg4)).eqls({ x: 1, y: 0, width: 29, height: 30 });
  });

  it('isInStroke line', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2]];
    const seg1 = PathUtil.getSegments(p1);
    expect(PathUtil.isPointInStroke(seg1, 1, 1, 1)).eqls(true);
    expect(PathUtil.isPointInStroke(seg1, 1, 2, 2)).eqls(true);
    expect(PathUtil.isPointInStroke(seg1, 1, 1.5, 1.5)).eqls(true);
    expect(PathUtil.isPointInStroke(seg1, 1, 3, 3)).eqls(false);
    expect(PathUtil.isPointInStroke(seg1, 1, 1, 2)).eqls(false);
    expect(PathUtil.isPointInStroke(seg1, 2, 1, 2)).eqls(true);
  });

  it('isInstroke Q', () => {
    const p2 = [['M', 1, 1], ['Q', 2, 2, 3, 1]];
    const seg2 = PathUtil.getSegments(p2);
    expect(PathUtil.isPointInStroke(seg2, 1, 2, 1.5)).eqls(true);

    expect(PathUtil.isPointInStroke(seg2, 1, 2, 2.1)).eqls(false);
  });

  it('isInstroke Z', () => {
    const p = [['M', 1, 1], ['L', 2, 1], ['L', 2, 2], ['Z']];
    const seg = PathUtil.getSegments(p);
    expect(PathUtil.isPointInStroke(seg, 1, 1.5, 1.5)).eqls(true);
  });

  it('isInstroke C', () => {
    const p3 = [['M', 1, 1], ['L', 2, 2], ['C', 3, 1, 4, 3, 5, 2]];
    const seg3 = PathUtil.getSegments(p3);
    expect(PathUtil.isPointInStroke(seg3, 1, 1.5, 1.5)).eqls(true);
    expect(PathUtil.isPointInStroke(seg3, 1, 3.5, 2)).eqls(true);
  });

  it('isInstroke A', () => {
    const p4 = [['M', 1, 1], ['L', 2, 2], ['A', 2, 2, 0, 0, 1, 6, 2]];
    const seg4 = PathUtil.getSegments(p4);
    expect(PathUtil.isPointInStroke(seg4, 1, 4, 0)).eqls(true);
  });

  it('extract Polygons', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2], ['L', 3, 3], ['L', 4, 4], ['M', 5, 5], ['L', 6, 6], ['L', 7, 7], ['Z']];
    const rst = PathUtil.extractPolygons(p1);
    expect(rst.polygons.length).eqls(1);
    expect(rst.polylines.length).eqls(1);
    expect(rst.polygons[0].length).eqls(3);
    expect(rst.polylines[0].length).eqls(4);

    const p2 = [['M', 1, 1], ['L', 2, 2], ['L', 3, 3]];
    const rst2 = PathUtil.extractPolygons(p2);
    expect(rst2.polylines.length).eqls(1);
    expect(rst2.polygons.length).eqls(0);

    const p3 = [['M', 1, 1], ['L', 2, 2], ['L', 3, 3], ['Z']];
    const rst3 = PathUtil.extractPolygons(p3);
    expect(rst3.polylines.length).eqls(0);
    expect(rst3.polygons.length).eqls(1);

    const p4 = [
      ['M', 10, 10],
      ['L', 30, 10],
      ['L', 30, 30],
      ['L', 10, 30],
      ['Z'],
      ['M', 100, 100],
      ['L', 120, 100],
      ['L', 120, 130],
      ['M', 200, 200],
      ['L', 220, 200],
      ['L', 200, 220],
      ['Z'],
    ];

    const rst4 = PathUtil.extractPolygons(p4);
    expect(rst4.polylines.length).eqls(1);
    expect(rst4.polygons.length).eqls(2);
  });

  it('not math m', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2], ['M', 3, 4], ['M', 5, 5], ['L', 6, 6], ['L', 7, 7], ['Z']];
    const rst = PathUtil.extractPolygons(p1);
    expect(rst.polygons.length).eqls(1);
    expect(rst.polylines.length).eqls(2);
  });
});
