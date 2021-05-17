const expect = require('chai').expect;
import Line from '../../../src/shape/line';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('line test', () => {
  const line = new Line({
    type: 'line',
    attrs: {
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 100,
      stroke: 'red',
    },
  });

  it('init', () => {
    expect(line.attr('x1')).eqls(0);
    expect(line.attr('x2')).eqls(100);
    expect(line.attr('lineWidth')).eqls(1);
  });

  it('draw', () => {
    line.draw(ctx);
    expect(getColor(ctx, 10, 10)).eqls('#ff0000');
    expect(getColor(ctx, 12, 10)).eqls('#000000');
  });

  it('getBBox', () => {
    const bbox = line.getBBox();
    expect(bbox.minX).eqls(-0.5);
    expect(bbox.minY).eqls(-0.5);
    expect(bbox.maxX).eqls(100.5);
    expect(bbox.maxY).eqls(100.5);
  });

  it('isHit', () => {
    expect(line.isHit(0, 0)).eqls(true);
    expect(line.isHit(-1, -1)).eqls(false);
    expect(line.isHit(10, 11)).eqls(false);
    line.attr({
      lineAppendWidth: 2,
    });
    expect(line.isHit(10, 11)).eqls(true);
  });

  it('getTotalLength', () => {
    expect(line.getTotalLength()).eqls(Math.sqrt(Math.pow(100 - 0, 2) + Math.pow(100 - 0, 2)));
  });

  it('getPoint', () => {
    expect(line.getPoint(0)).eqls({
      x: 0,
      y: 0,
    });
    expect(line.getPoint(0.5)).eqls({
      x: 50,
      y: 50,
    });
    expect(line.getPoint(1)).eqls({
      x: 100,
      y: 100,
    });
  });

  it('clear', () => {
    line.destroy();
    expect(line.destroyed).eqls(true);
    canvas.parentNode.removeChild(canvas);
  });
});
