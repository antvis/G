const expect = require('chai').expect;
import Polyline from '../../../src/shape/polyline';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('polygon test', () => {
  const points1 = [
    [10, 10],
    [100, 10],
    [100, 100],
    [10, 100],
  ];
  const points2 = [
    [50, 50],
    [100, 50],
    [100, 100],
    [150, 100],
    [150, 150],
    [200, 150],
  ];
  const polyline = new Polyline({
    type: 'polyline',
    attrs: {
      points: points1,
      fill: 'red',
    },
  });
  it('init', () => {
    expect(polyline.attr('points').length).eqls(4);
    expect(polyline.attr('lineWidth')).eqls(1);
  });

  it('draw', () => {
    polyline.draw(ctx);
    // polyline 填充无效
    expect(getColor(ctx, 11, 10)).eqls('#000000');
    expect(getColor(ctx, 99, 99)).eqls('#000000');
    expect(getColor(ctx, 10, 50)).eqls('#000000');
    expect(getColor(ctx, 101, 50)).eqls('#000000');
    ctx.clearRect(0, 0, 101, 101);
    polyline.attr({ stroke: 'blue', lineWidth: 4 });
    polyline.draw(ctx);
    expect(getColor(ctx, 101, 50)).eqls('#0000ff');
    expect(getColor(ctx, 9.5, 50)).eqls('#000000');
  });

  it('getBBox', () => {
    polyline.attr('stroke', null);
    polyline.attr('lineWidth', 0);
    let bbox = polyline.getBBox();
    expect(bbox.minX).eqls(10);
    expect(bbox.minY).eqls(10);
    expect(bbox.maxX).eqls(100);
    expect(bbox.maxY).eqls(100);

    polyline.attr('stroke', 'blue');
    polyline.attr('lineWidth', 2);
    bbox = polyline.getBBox();
    expect(bbox.minX).eqls(9);
    expect(bbox.minY).eqls(9);
    expect(bbox.maxX).eqls(101);
    expect(bbox.maxY).eqls(101);
  });

  it('isHit', () => {
    ctx.clearRect(0, 0, 120, 120);
    // only stroke
    polyline.attr({
      stroke: 'blue',
      lineWidth: 2,
      fill: null,
    });
    polyline.draw(ctx);
    expect(polyline.isHit(12, 12)).eqls(false);
    expect(polyline.isHit(11, 11)).eqls(true);
    expect(polyline.isHit(9, 8)).eqls(false);

    expect(polyline.isHit(10, 50)).eqls(false);
    // only fill
    polyline.attr({
      stroke: null,
      fill: 'red',
    });

    expect(polyline.isHit(12, 12)).eqls(false);
  });

  it('getTotalLength', () => {
    polyline.attr('points', points1);
    expect(polyline.getTotalLength()).eqls(270);
    polyline.attr('points', points2);
    expect(polyline.getTotalLength()).eqls(250);
  });

  it('getPoint', () => {
    polyline.attr('points', points1);
    expect(polyline.getPoint(0)).eqls({
      x: 10,
      y: 10,
    });
    expect(polyline.getPoint(0.6)).eqls({
      x: 100,
      y: 82,
    });
    expect(polyline.getPoint(1)).eqls({
      x: 10,
      y: 100,
    });
    polyline.attr('points', points2);
    expect(polyline.getPoint(0)).eqls({
      x: 50,
      y: 50,
    });
    expect(polyline.getPoint(0.5)).eqls({
      x: 125,
      y: 100,
    });
    expect(polyline.getPoint(1)).eqls({
      x: 200,
      y: 150,
    });
  });

  it('getStartTangent', () => {
    polyline.attr('points', points1);
    expect(polyline.getStartTangent()).eqls([
      [100, 10],
      [10, 10],
    ]);
    polyline.attr('points', points2);
    expect(polyline.getStartTangent()).eqls([
      [100, 50],
      [50, 50],
    ]);
  });

  it('getEndTangent', () => {
    polyline.attr('points', points1);
    expect(polyline.getEndTangent()).eqls([
      [100, 100],
      [10, 100],
    ]);
    polyline.attr('points', points2);
    expect(polyline.getEndTangent()).eqls([
      [150, 150],
      [200, 150],
    ]);
  });
});
