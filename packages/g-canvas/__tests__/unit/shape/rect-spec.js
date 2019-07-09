const expect = require('chai').expect;
import Rect from '../../../src/shape/rect';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('rect test', () => {
  const rect = new Rect({
    type: 'rect',
    attrs: {
      x: 10,
      y: 10,
      width: 20,
      height: 10,
      fill: 'red',
    },
  });

  it('init', () => {
    expect(rect.attr('x')).eql(10);
    expect(rect.attr('radius')).eql(0);
  });

  it('draw', () => {
    rect.draw(ctx);
    expect(getColor(ctx, 11, 11)).eql('#ff0000');
  });

  it('bbox', () => {
    const bbox = rect.getBBox();
    expect(bbox.minX).eql(10);
    expect(bbox.maxX).eql(30);
  });

  it('change', () => {
    rect.attr('width', 10);
    const bbox = rect.getBBox();
    expect(bbox.maxX).eql(20);
  });

  it('radius', () => {
    ctx.clearRect(10, 10, 20, 20);
    rect.attr({
      x: 10,
      y: 10,
      width: 30,
      height: 10,
      radius: 4,
    });
    rect.draw(ctx);
    expect(getColor(ctx, 11, 11)).eql('#ff0000');
    expect(getColor(ctx, 10, 10)).eql('#000000');
  });

  it('isHit', () => {
    rect.attr({
      x: 10,
      y: 10,
      width: 30,
      height: 10,
      radius: 0,
      fill: 'red',
    });
    // 填充
    expect(rect.isHit(10, 10)).eql(true);
    expect(rect.isHit(11, 11)).eql(true);
    expect(rect.isHit(9.5, 9.5)).eql(false);

    // 仅边框
    rect.attr({
      fill: null,
      stroke: 'red',
    });
    expect(rect.isHit(10, 10)).eql(true);
    expect(rect.isHit(11, 11)).eql(false);
    expect(rect.isHit(9.5, 9.5)).eql(true);
    // 加大边框
    rect.attr('lineWidth', 2);
    expect(rect.isHit(11, 11)).eql(true);
  });

  it('isHit with radius', () => {
    // 设置圆角
    rect.attr({
      x: 10,
      y: 10,
      width: 30,
      height: 10,
      radius: 4,
      stroke: null,
      fill: 'red',
    });
    expect(rect.isHit(10, 10)).eql(false);
    expect(rect.isHit(12, 12)).eql(true);

    rect.attr({
      fill: null,
      stroke: 'blue',
      radius: 2,
    });

    expect(rect.isHit(10, 10)).eql(false);
    rect.attr('lineWidth', 6);
    rect.draw(ctx);
    expect(rect.isHit(10, 10)).eql(true);
  });

  it('destroy', () => {
    rect.destroy();
    expect(rect.destroyed).eql(true);
    canvas.parentNode.removeChild(canvas);
  });
});
