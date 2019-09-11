import { expect } from 'chai';
import { resolve } from 'path';
import Image from '../../../src/shape/image';
import getCanvas from '../../get-canvas';

describe('SVG Image', () => {
  let canvas;
  let image;

  before(() => {
    canvas = getCanvas('svg-image');
    image = new Image({
      attrs: {
        x: 0,
        y: 0,
      },
    });
    canvas.add(image);
  });

  it('init', () => {
    expect(image.attr('x')).eql(0);
    expect(image.attr('y')).eql(0);
  });

  it('autoDraw', () => {
    expect(image.get('el')).not.eql(undefined);
    expect(image.get('el').getAttribute('x')).eql('0');
  });

  it('image', (done) => {
    const img = new window.Image();
    img.onload = () => {
      image.attr('img', img);
      const bbox = image.getBBox();
      expect(bbox.minX).to.equal(0);
      expect(bbox.minY).to.equal(0);
      expect(bbox.maxX).to.equal(768);
      expect(bbox.maxY).to.equal(1024);
      done();
    };
    img.src = resolve(process.cwd(), './__tests__/fixtures/test1.jpg');
  });

  it('bbox', () => {
    const bbox = image.getBBox();
    expect(bbox.minX).eql(0);
    expect(bbox.minY).eql(0);
    expect(bbox.maxX).eql(768);
    expect(bbox.maxY).eql(1024);
  });

  it('isHit', () => {
    expect(image.isHit(0, 0)).eql(true);
    expect(image.isHit(100, 100)).eql(true);
    expect(image.isHit(1000, 1000)).eql(false);
  });

  it('change', () => {
    expect(image.attr('width')).eql(768);
    expect(image.attr('height')).eql(1024);
    image.attr('width', 600);
    image.attr('height', 800);
    expect(image.attr('width')).eql(600);
    expect(image.attr('height')).eql(800);
    const bbox = image.getBBox();
    expect(bbox.minX).eql(0);
    expect(bbox.minY).eql(0);
    expect(bbox.maxX).eql(600);
    expect(bbox.maxY).eql(800);
    expect(image.isHit(0, 0)).eql(true);
    expect(image.isHit(100, 100)).eql(true);
    expect(image.isHit(1000, 1000)).eql(false);
  });

  it('destroy', () => {
    expect(image.destroyed).eql(false);
    image.destroy();
    expect(image.destroyed).eql(true);
  });
});
