const expect = require('chai').expect;
import Image from '../../../src/shape/image';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const canvas1 = document.createElement('canvas');
canvas1.width = 200;
canvas1.height = 200;
const ctx1 = canvas1.getContext('2d');

describe('image test', () => {
  let image;
  it('init', (done) => {
    image = new Image({
      type: 'image',
      attrs: {
        x: 10,
        y: 10,
        img: 'https://cdn.nlark.com/yuque/0/2019/png/89796/1562740493639-f14dfc89-a6b2-4bd9-a784-80bee48f5b7b.png',
      },
    });
    expect(image.attr('x')).eqls(10);
    expect(image.get('loading')).eqls(true);
    expect(image.attr('width')).eqls(undefined);
    setTimeout(function() {
      expect(image.get('loading')).eqls(false);
      expect(image.attr('width')).eqls(50);
      expect(image.attr('height')).eqls(50);
      done();
    }, 100);
  });

  it('draw image by src', () => {
    image.draw(ctx);
    expect(getColor(ctx, 1, 1)).eqls('#000000');
    expect(getColor(ctx, 11, 11)).eqls('#ff0000');
    expect(getColor(ctx, 61, 61)).eqls('#000000');
  });

  it('draw image by canvas', () => {
    ctx1.fillStyle = 'blue';
    ctx1.fillRect(0, 0, 100, 100);

    image.attr({
      x: 100,
      y: 100,
      width: 100,
      img: canvas1,
      height: 100,
    });
    expect(image.get('loading')).eqls(false);
    expect(image.attr('height')).eqls(100);
    image.draw(ctx);
    expect(getColor(ctx, 101, 101)).eqls('#0000ff');
    expect(getColor(ctx, 151, 151)).eqls('#000000');
  });

  it('draw image by sx, sy', () => {
    image.attr({
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      sx: 0,
      sy: 0,
      swidth: 100,
      sheight: 100,
      img: canvas1,
    });

    expect(image.get('loading')).eqls(false);
    expect(image.attr('height')).eqls(100);
    image.draw(ctx);
    expect(getColor(ctx, 201, 201)).eqls('#0000ff');
    expect(getColor(ctx, 260, 260)).eqls('#0000ff');
  });

  it('bbox', () => {
    image.attr({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    const bbox = image.getBBox();
    expect(bbox.x).eqls(0);
    expect(bbox.y).eqls(0);
    expect(bbox.width).eqls(100);
  });

  it('hit', () => {
    expect(image.isHit(0, 0)).eqls(true);
    expect(image.isHit(-1, -1)).eqls(false);
    expect(image.isHit(101, 101)).eqls(false);
    expect(image.isHit(99, 99)).eqls(true);
  });

  it('clear', () => {
    image.attr(
      'img',
      'https://cdn.nlark.com/yuque/0/2019/png/89796/1562740493639-f14dfc89-a6b2-4bd9-a784-80bee48f5b7b.png'
    );
    image.destroy();
    expect(image.destroyed).eqls(true);
    expect(image.attr('img')).eqls(undefined);
    canvas.parentNode.removeChild(canvas);
  });
});
