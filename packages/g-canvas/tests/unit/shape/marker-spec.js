const expect = require('chai').expect;
import Marker from '../../../src/shape/marker';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
canvas.id = 'marker';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('marker test', () => {
  const marker = new Marker({
    type: 'marker',
    attrs: {
      x: 10,
      y: 10,
      r: 5,
      symbol: 'square',
      fill: 'red',
    },
  });

  it('init', () => {
    expect(marker.attr('symbol')).eqls('square');
  });

  it('draw', () => {
    marker.draw(ctx);
    expect(getColor(ctx, 10, 10)).eqls('#ff0000');
    expect(getColor(ctx, 15, 15)).eqls('#000000');
  });

  it('change symbol', () => {
    marker.attr({
      x: 30,
      y: 30,
      symbol: 'circle',
    });

    marker.draw(ctx);
    expect(getColor(ctx, 30, 30)).eqls('#ff0000');
    expect(getColor(ctx, 35, 35)).eqls('#000000');
    expect(marker.get('paramsCache')).not.eqls({});
    ctx.clearRect(20, 20, 20, 20);
    marker.draw(ctx);
    expect(getColor(ctx, 30, 30)).eqls('#ff0000');
    expect(getColor(ctx, 35, 35)).eqls('#000000');
  });

  it('no symbol', () => {
    marker.attr('symbol', null);
    marker.attr('x', 50);
    marker.draw(ctx);
    expect(getColor(ctx, 50, 30)).eqls('#ff0000');
    expect(getColor(ctx, 54.5, 34.5)).eqls('#000000');
  });

  it('other symbol', () => {
    marker.attr({
      symbol: 'diamond',
      x: 70,
    });
    marker.draw(ctx);
    expect(getColor(ctx, 70, 30)).eqls('#ff0000');
    expect(getColor(ctx, 70, 34.5)).eqls('#ff0000');
    expect(getColor(ctx, 71, 34.5)).eqls('#000000');

    marker.attr({
      symbol: 'triangle',
      x: 90,
    });
    marker.draw(ctx);
    expect(getColor(ctx, 90, 26.5)).eqls('#ff0000');
    expect(getColor(ctx, 92, 34.5)).eqls('#ff0000');
    expect(getColor(ctx, 92, 26.5)).eqls('#000000');

    marker.attr({
      symbol: 'triangle-down',
      x: 110,
    });
    marker.draw(ctx);
    expect(getColor(ctx, 110, 26.5)).eqls('#ff0000');
    expect(getColor(ctx, 110, 34.5)).eqls('#000000');
  });

  it('symbol callback', () => {
    marker.attr({
      symbol(x, y, r) {
        return [['M', x - r, y], ['L', x + r, y]];
      },
      x: 130,
      fill: null,
      stroke: 'blue',
    });
    marker.draw(ctx);
    expect(getColor(ctx, 126, 30)).eqls('#0000ff');
    expect(getColor(ctx, 124, 30)).eqls('#000000');
    expect(getColor(ctx, 130, 31)).eqls('#000000');
  });

  it('bbox', () => {
    marker.attr({
      x: 10,
      y: 10,
      symbol: 'circle',
    });
    const bbox = marker.getBBox();
    expect(bbox.x).eqls(4.5);
    expect(bbox.y).eqls(4.5);
    expect(bbox.width).eqls(11);

    marker.attr('stroke', null);
    expect(marker.getBBox().width).eqls(10);
  });

  it('isHit', () => {
    marker.attr({
      x: 10,
      y: 10,
      symbol: 'circle',
    });
    expect(marker.isHit(10, 10)).eqls(true);
    expect(marker.isHit(15.5, 15.5)).eqls(false);

    marker.attr('stroke', 'blue');
    expect(marker.isHit(15.5, 15.5)).eqls(true);
  });

  it('clear', () => {
    marker.destroy();
    expect(marker.destroyed).eqls(true);
    canvas.parentNode.removeChild(canvas);
  });
});
