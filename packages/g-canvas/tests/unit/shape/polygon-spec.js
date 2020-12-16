const expect = require('chai').expect;
import Polygon from '../../../src/shape/polygon';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('polygon test', () => {
  const polygon = new Polygon({
    type: 'polygon',
    attrs: {
      points: [
        [10, 10],
        [100, 10],
        [100, 100],
        [10, 100],
      ],
      fill: 'red',
    },
  });
  it('init', () => {
    expect(polygon.attr('points').length).eqls(4);
    expect(polygon.attr('lineWidth')).eqls(1);
  });

  it('draw', () => {
    polygon.draw(ctx);
    expect(getColor(ctx, 10, 11)).eqls('#ff0000');
    expect(getColor(ctx, 99, 99)).eqls('#ff0000');
    expect(getColor(ctx, 10, 50)).eqls('#ff0000');
    expect(getColor(ctx, 101, 50)).eqls('#000000');
    ctx.clearRect(0, 0, 101, 101);
    polygon.attr({ stroke: 'blue', lineWidth: 4 });
    polygon.draw(ctx);
    expect(getColor(ctx, 101, 50)).eqls('#0000ff');
    expect(getColor(ctx, 9.5, 50)).eqls('#0000ff');
  });

  it('getBBox', () => {
    polygon.attr('stroke', null);
    let bbox = polygon.getBBox();
    expect(bbox.minX).eqls(10);
    expect(bbox.minY).eqls(10);
    expect(bbox.maxX).eqls(100);
    expect(bbox.maxY).eqls(100);

    polygon.attr('stroke', 'blue');
    polygon.attr('lineWidth', 2);
    bbox = polygon.getBBox();
    expect(bbox.minX).eqls(9);
    expect(bbox.minY).eqls(9);
    expect(bbox.maxX).eqls(101);
    expect(bbox.maxY).eqls(101);
  });

  it('isHit', () => {
    ctx.clearRect(0, 0, 120, 120);
    // only stroke
    polygon.attr({
      stroke: 'blue',
      lineWidth: 2,
      fill: null,
    });
    polygon.draw(ctx);
    expect(polygon.isHit(12, 12)).eqls(false);
    expect(polygon.isHit(11, 11)).eqls(true);
    expect(polygon.isHit(9, 10)).eqls(true);
    // 距离大于 1
    expect(polygon.isHit(9, 8)).eqls(false);

    // only fill
    polygon.attr({
      stroke: null,
      fill: 'red',
    });

    expect(polygon.isHit(12, 12)).eqls(true);
  });
});
