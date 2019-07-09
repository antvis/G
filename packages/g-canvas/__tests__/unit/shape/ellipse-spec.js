const expect = require('chai').expect;
import Ellipse from '../../../src/shape/ellipse';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('ellipse test', () => {
  const ellipse = new Ellipse({
    type: 'ellipse',
    attrs: {
      rx: 10,
      ry: 10,
      x: 10,
      y: 10,
      fill: 'red'
    }
  });
  it('init', () => {
    expect(ellipse.attr('rx')).equal(10);
    expect(ellipse.attr('ry')).equal(10);
  });

  it('draw circle', () => {
    ellipse.draw(ctx);
    expect(getColor(ctx, 10, 10)).equal('#ff0000');
    expect(getColor(ctx, 21, 10)).equal('#000000');
  });

  it('draw ellipse', () => {
    ctx.clearRect(0, 0, 500, 500);
    ellipse.attr('rx', 20);
    ellipse.draw(ctx);
    expect(getColor(ctx, 21, 10)).equal('#ff0000');
  });

  it('draw ellipse not use ctx.ellipse', () => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();
    ctx.ellipse = null;
    ellipse.draw(ctx);
    ctx.restore();
    expect(getColor(ctx, 21, 10)).equal('#ff0000');
  });

  it('bbox', () => {
    const bbox = ellipse.getBBox();
    expect(bbox.minX).equal(-10);
    expect(bbox.minY).equal(0);
    expect(bbox.maxX).equal(30);
    expect(bbox.maxY).equal(20);
  });

  it('isHit', () => {
    ellipse.attr({
      x: 10,
      y: 10,
      rx: 10,
      ry: 10,
      fill: 'red'
    });
    // only fill
    expect(ellipse.isHit(10, 10)).equal(true);
    expect(ellipse.isHit(10, 20)).equal(true);
    expect(ellipse.isHit(10, 20.5)).equal(false);

    // fill and stroke
    ellipse.attr({
      stroke: 'blue'
    });
    expect(ellipse.isHit(10, 20.5)).equal(true);
    expect(ellipse.isHit(10, 19)).equal(true);
  });

  it('isHit no fill', () => {
    ellipse.attr({
      fill: null
    });
    expect(ellipse.isHit(10, 20.5)).equal(true);
    expect(ellipse.isHit(10, 19)).equal(false);

    ellipse.attr({
      lineWidth: 4
    });
    expect(ellipse.isHit(10, 19)).equal(true);
  });

  it('clear', () => {
    ellipse.destroy();
    expect(ellipse.destroyed).eqls(true);
    canvas.parentNode.removeChild(canvas);
  })
});
