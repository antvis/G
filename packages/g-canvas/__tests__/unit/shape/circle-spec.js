const expect = require('chai').expect;
import Circle from '../../../src/shape/circle';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('circle test', () => {
  const circle = new Circle({
    type: 'circle',
    attrs: {
      r: 10,
      x: 10,
      y: 10,
      fill: 'red',
    },
  });
  it('init', () => {
    expect(circle.attr('r')).equal(10);
    expect(circle.attr('lineWidth')).equal(1);
  });

  it('draw', () => {
    circle.draw(ctx);
    expect(getColor(ctx, 10, 10)).equal('#ff0000');
  });

  it('update', () => {
    ctx.clearRect(0, 0, 500, 500);
    circle.attr({
      r: 10,
      x: 30,
      y: 30,
      fill: null,
      stroke: 'blue',
    });
    circle.draw(ctx);
    expect(getColor(ctx, 30, 20)).equal('#0000ff');
    expect(getColor(ctx, 30, 30)).equal('#000000');
  });

  it('getBBox', () => {
    const bbox = circle.getBBox();
    expect(bbox.minX).equal(19.5);
    expect(bbox.minY).equal(19.5);
    expect(bbox.maxX).equal(40.5);
    expect(bbox.maxY).equal(40.5);

    circle.attr('stroke', null);
    const bbox1 = circle.getBBox();
    expect(bbox).not.eqls(bbox1);
  });

  it('isHit', () => {
    // only fill
    circle.attr({
      r: 10,
      x: 30,
      y: 30,
      fill: 'red',
      stroke: null,
    });
    const point = {
      x: 30 + Math.cos(Math.PI / 4) * 10,
      y: 30 + Math.sin(Math.PI / 4) * 10,
    };

    expect(circle.isHit(30, 30)).eqls(true);
    expect(circle.isHit(30, 20)).eqls(true);
    expect(circle.isHit(30, 19.5)).eqls(false);
    expect(circle.isHit(point.x, point.y)).eqls(true);
    expect(circle.isHit(point.x + 0.5, point.y)).eqls(false);

    circle.attr('stroke', 'blue');
    expect(circle.isHit(30, 19.5)).eqls(true);
    expect(circle.isHit(point.x + 0.5, point.y)).eqls(true);
    expect(circle.isHit(point.x + 1, point.y)).eqls(false);
  });

  it('clip', () => {
    ctx.clearRect(0, 0, 500, 500);
    // 因为 clip 需要父元素存在才能设置
    circle.set(
      'clipShape',
      new Circle({
        type: 'circle',
        isClipShape: true,
        attrs: {
          x: 10,
          y: 10,
          r: 5,
        },
      })
    );
    circle.attr({
      x: 10,
      y: 10,
      fill: 'red',
    });
    circle.draw(ctx);
    expect(getColor(ctx, 10, 10)).eqls('#ff0000');
    expect(getColor(ctx, 10, 6)).eqls('#ff0000');
    expect(getColor(ctx, 10, 4)).eqls('#000000');

    expect(circle.isHit(10, 10)).eqls(true);
    expect(circle.isHit(10, 4)).eqls(false);
  });

  it('destroy', () => {
    circle.destroy();
    expect(circle.destroyed).eqls(true);
    canvas.parentNode.removeChild(canvas);
  });
});
