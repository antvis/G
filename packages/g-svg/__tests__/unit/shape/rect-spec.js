import { expect } from 'chai';
import Rect from '../../../src/shape/rect';
import getCanvas from '../../get-canvas';

describe('SVG Rect', () => {
  let canvas;
  let rect;

  before(() => {
    canvas = getCanvas('svg-rect');
    rect = new Rect({
      attrs: {
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        fill: 'red',
      },
    });
    canvas.add(rect);
  });

  it('init', () => {
    expect(rect.attr('x')).eql(10);
    expect(rect.attr('y')).eql(10);
    expect(rect.attr('width')).eql(20);
    expect(rect.attr('height')).eql(20);
    expect(rect.attr('radius')).eql(0);
  });

  it('autoDraw', () => {
    expect(rect.get('el')).not.eql(undefined);
    expect(rect.get('el').getAttribute('fill')).eql('red');
  });

  it('bbox', () => {
    const bbox = rect.getBBox();
    expect(bbox.minX).eql(10);
    expect(bbox.minY).eql(10);
    expect(bbox.maxX).eql(30);
    expect(bbox.maxY).eql(30);
  });

  it('isHit', () => {
    expect(rect.isHit(10, 10)).eql(true);
    expect(rect.isHit(20, 20)).eql(true);
    expect(rect.isHit(40, 40)).eql(false);
  });

  it('change', () => {
    expect(rect.attr('radius')).eql(0);
    rect.attr('radius', 5);
    expect(rect.attr('radius')).eql(5);
    const bbox = rect.getBBox();
    expect(bbox.minX).eql(10);
    expect(bbox.minY).eql(10);
    expect(bbox.maxX).eql(30);
    expect(bbox.maxY).eql(30);
    expect(rect.isHit(10, 10)).eql(false);
    expect(rect.isHit(20, 20)).eql(true);
    expect(rect.isHit(40, 40)).eql(false);
  });

  it('destroy', () => {
    expect(rect.destroyed).eql(false);
    rect.destroy();
    expect(rect.destroyed).eql(true);
  });
});
