const expect = require('chai').expect;
import Circle from '../../../src/shape/circle';
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function pixelToColor(r, g, b) {
  return '#' + fixWidth(r.toString(16)) + fixWidth(g.toString(16)) + fixWidth(b.toString(16));
}

function fixWidth(str) {
  if (str.length < 2) {
    return '0' + str;
  }
  return str;
}

function getColor(x, y) {
  const data = ctx.getImageData(x, y, 1, 1).data;
  return pixelToColor(data[0], data[1], data[2]);
}

describe('circle test', () => {
  const circle = new Circle({
    type: 'circle',
    attrs: {
      r: 10,
      x: 10,
      y: 10,
      fill: 'red'
    }
  });
  it('init', () => {
    expect(circle.attr('r')).equal(10);
    expect(circle.attr('lineWidth')).equal(1);
  });

  it('draw', () => {
    circle.draw(ctx);
    expect(getColor(10, 10)).equal('#ff0000');
  });

  it('update', () => {
    ctx.clearRect(0, 0, 500, 500);
    circle.attr({
      r: 10,
      x: 30,
      y: 30,
      fill: null,
      stroke: 'blue'
    });
    circle.draw(ctx);
    expect(getColor(30, 20)).equal('#0000ff');
    expect(getColor(30, 30)).equal('#000000');
  });

  it('getBBox', () => {
    const bbox = circle.getBBox();
    expect(bbox).eqls({
      height: 21,
      maxX: 40.5,
      maxY: 40.5,
      minX: 19.5,
      minY: 19.5,
      width: 21
    });
  });

  it('isHit', () => {

  });

  it('clip', () => {
    ctx.clearRect(0, 0, 500, 500);
    // 因为 clip 需要父元素存在才能设置
    circle.set('clipShape', new Circle({
      attrs: {
        x: 10,
        y: 10,
        r: 5
      }
    }));
    circle.attr({
      x: 10,
      y: 10,
      fill: 'red'
    });
    circle.draw(ctx);
    expect(getColor(10, 10)).eqls('#ff0000');
    expect(getColor(10, 6)).eqls('#ff0000');
    expect(getColor(10, 4)).eqls('#000000');
  });

  it('destroy', () => {
    circle.destroy();
    expect(circle.destroyed).eqls(true);
  });

});
