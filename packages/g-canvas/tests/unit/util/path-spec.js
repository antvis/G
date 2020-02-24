const expect = require('chai').expect;
import PathUtil from '../../../src/util/path';
import path2Segment from '@antv/path-util/lib/path-2-segments';

describe('test path util', () => {
  it('has arc', () => {
    const p1 = [
      ['M', 1, 1],
      ['L', 2, 2],
    ];
    const p2 = [
      ['M', 1, 1],
      ['Q', 2, 2, 3, 3],
    ];
    const p3 = [
      ['M', 1, 1],
      ['L', 2, 2],
      ['C', 3, 3, 4, 4, 5, 5],
    ];
    const p4 = [
      ['M', 1, 1],
      ['L', 2, 2],
      ['A', 3, 3, 0, 1, 1, 8, 8],
    ];
    expect(PathUtil.hasArc(p1)).eqls(false);
    expect(PathUtil.hasArc(p2)).eqls(true);
    expect(PathUtil.hasArc(p3)).eqls(true);
    expect(PathUtil.hasArc(p4)).eqls(true);
  });

  it('isInStroke line', () => {
    const p1 = [
      ['M', 1, 1],
      ['L', 2, 2],
    ];
    const seg1 = path2Segment(p1);
    expect(PathUtil.isPointInStroke(seg1, 1, 1, 1)).eqls(true);
    expect(PathUtil.isPointInStroke(seg1, 1, 2, 2)).eqls(true);
    expect(PathUtil.isPointInStroke(seg1, 1, 1.5, 1.5)).eqls(true);
    expect(PathUtil.isPointInStroke(seg1, 1, 3, 3)).eqls(false);
    expect(PathUtil.isPointInStroke(seg1, 1, 1, 2)).eqls(false);
    expect(PathUtil.isPointInStroke(seg1, 2, 1, 2)).eqls(true);
  });

  it('isInstroke Q', () => {
    const p2 = [
      ['M', 1, 1],
      ['Q', 2, 2, 3, 1],
    ];

    const seg2 = path2Segment(p2);
    // 函数存在副作用，严格说不应该有这种实现，但是为了延迟性能
    // PathUtil.getPathBox(seg2);
    // expect(seg2[1].box).eqls({
    //   x: 1,
    //   y: 1,
    //   width: 2,
    //   height: 0.5,
    // });
    expect(PathUtil.isPointInStroke(seg2, 1, 2, 1.5)).eqls(true);
    expect(PathUtil.isPointInStroke(seg2, 1, 2, 1.8)).eqls(true);

    expect(PathUtil.isPointInStroke(seg2, 1, 2, 2.1)).eqls(false);
  });

  it('isInstroke Z', () => {
    const p = [['M', 1, 1], ['L', 2, 1], ['L', 2, 2], ['Z']];
    const seg = path2Segment(p);
    expect(PathUtil.isPointInStroke(seg, 1, 1.5, 1.5)).eqls(true);
  });

  it('isInstroke C', () => {
    const p3 = [
      ['M', 1, 1],
      ['L', 2, 2],
      ['C', 3, 1, 4, 3, 5, 2],
    ];
    const seg3 = path2Segment(p3);
    expect(PathUtil.isPointInStroke(seg3, 1, 1.5, 1.5)).eqls(true);
    expect(PathUtil.isPointInStroke(seg3, 1, 3.5, 2)).eqls(true);
  });

  it('isInstroke A', () => {
    const p4 = [
      ['M', 1, 1],
      ['L', 2, 2],
      ['A', 2, 2, 0, 0, 1, 6, 2],
    ];
    const seg4 = path2Segment(p4);
    expect(PathUtil.isPointInStroke(seg4, 1, 4, 0)).eqls(true);
  });

  it('extract Polygons', () => {
    const p1 = [['M', 1, 1], ['L', 2, 2], ['L', 3, 3], ['L', 4, 4], ['M', 5, 5], ['L', 6, 6], ['L', 7, 7], ['Z']];
    const rst = PathUtil.extractPolygons(p1);
    expect(rst.polygons.length).eqls(1);
    expect(rst.polylines.length).eqls(1);
    expect(rst.polygons[0].length).eqls(3);
    expect(rst.polylines[0].length).eqls(4);

    const p2 = [
      ['M', 1, 1],
      ['L', 2, 2],
      ['L', 3, 3],
    ];
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
