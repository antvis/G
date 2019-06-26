const expect = require('chai').expect;
import InStrokeUtil from '../../../src/util/in-stroke';

describe('test in stroke', () => {
  it('in line or not in line', () => {
    expect(InStrokeUtil.line(0, 0, 100, 100, 1, 50, 50)).eqls(true);
    // 错开 1px
    expect(InStrokeUtil.line(0, 0, 100, 100, 1, 50, 51)).eqls(false);
    // 线宽 +1
    expect(InStrokeUtil.line(0, 0, 100, 100, 2, 50, 51)).eqls(true);
    expect(InStrokeUtil.line(0, 0, 100, 100, 2, 50, 52)).eqls(false);

    expect(InStrokeUtil.line(10, 0, 100, 0, 2, 0, 0)).eqls(false);

    // 延长线上
    expect(InStrokeUtil.line(0, 0, 100, 100, 1, -1, -1)).eqls(false);
    expect(InStrokeUtil.line(0, 0, 0, 0, 1, 0, 0)).eqls(true);
  });

  it('in rect no radius', () => {
    expect(InStrokeUtil.rect(0, 0, 100, 100, 1, 50, 0)).eqls(true);
    expect(InStrokeUtil.rect(0, 0, 100, 100, 1, 50, 1)).eqls(false);
    expect(InStrokeUtil.rect(0, 0, 100, 100, 1, 50, 50)).eqls(false);

    expect(InStrokeUtil.rect(0, 0, 100, 100, 2, 50, 1)).eqls(true);
  });

  it('in rect with radius', () => {
    expect(InStrokeUtil.rectWithRadius(0, 0, 100, 100, 0, 1, 0, 0)).eqls(true);
    expect(InStrokeUtil.rectWithRadius(0, 0, 100, 100, 1, 1, 0, 0)).eqls(false);
    expect(InStrokeUtil.rectWithRadius(0, 0, 100, 100, 1, 3, 0, 0)).eqls(true);
  });

  it('in circle', () => {
    expect(InStrokeUtil.circle(100, 100, 10, 1, 100, 90)).eqls(true);
    expect(InStrokeUtil.circle(100, 100, 10, 1, 100, 89)).eqls(false);
    expect(InStrokeUtil.circle(100, 100, 10, 2, 100, 89)).eqls(true);
  });

  it('in polyline', () => {
    const points = [
      [ 0, 0 ],
      [ 10, 0 ],
      [ 10, 10 ],
      [ 0, 10 ]
    ];
    expect(InStrokeUtil.polyline(points, 1, 10, 1)).eqls(true);
    expect(InStrokeUtil.polyline(points, 1, 11, 1)).eqls(false);
    expect(InStrokeUtil.polyline(points, 2, 11, 1)).eqls(true);

    // 未闭合
    expect(InStrokeUtil.polyline(points, 1, 0, 1)).eqls(false);
    expect(InStrokeUtil.polyline(points, 2, 0, 2)).eqls(false);
  });

  it('in polygon', () => {
    const points = [
      [ 0, 0 ],
      [ 10, 0 ],
      [ 10, 10 ],
      [ 0, 10 ]
    ];
    expect(InStrokeUtil.polygon(points, 1, 10, 1)).eqls(true);
    expect(InStrokeUtil.polygon(points, 1, 11, 1)).eqls(false);
    expect(InStrokeUtil.polygon(points, 2, 11, 1)).eqls(true);
    // 闭合
    expect(InStrokeUtil.polygon(points, 1, 0, 1)).eqls(true);
    expect(InStrokeUtil.polygon(points, 1, 1, 1)).eqls(false);
    expect(InStrokeUtil.polygon(points, 2, 1, 1)).eqls(true);
  });

  it('in arc', () => {
    expect(InStrokeUtil.arc(10, 10, 10, 0, Math.PI / 2, 1, 20, 10)).eqls(true);
    expect(InStrokeUtil.arc(10, 10, 10, 0, Math.PI / 2, 1, 10, 20)).eqls(true);
    const x = Math.sin(1 / 4 * Math.PI) * 10 + 10;
    const y = Math.cos(1 / 4 * Math.PI) * 10 + 10;
    expect(InStrokeUtil.arc(10, 10, 10, 0, Math.PI / 2, 1, x, y)).eqls(true);

    expect(InStrokeUtil.arc(10, 10, 10, -Math.PI / 2, 0, 1, 20, 10)).eqls(true);
    expect(InStrokeUtil.arc(10, 10, 10, -Math.PI / 2, 0, 1, 10, 20)).eqls(false);
    expect(InStrokeUtil.arc(10, 10, 10, -Math.PI / 2, 0, 1, 10, 0)).eqls(true);
  });

});
