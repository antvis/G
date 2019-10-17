import { expect } from 'chai';
import Circle from '../../../src/shape/circle';
import getCanvas from '../../get-canvas';

describe('SVG Cicle', () => {
  let canvas;
  let circle;

  before(() => {
    canvas = getCanvas('svg-circle');
    circle = new Circle({
      attrs: {
        x: 20,
        y: 20,
        r: 20,
        fill: 'red',
      },
    });
    canvas.add(circle);
  });

  it('init', () => {
    expect(circle.attr('x')).eql(20);
    expect(circle.attr('y')).eql(20);
    expect(circle.attr('r')).eql(20);
    expect(circle.attr('fill')).eql('red');
  });

  it('autoDraw', () => {
    expect(circle.get('el')).not.eql(undefined);
    expect(circle.get('el').getAttribute('fill')).eql('red');
  });

  it('bbox', () => {
    const bbox = circle.getBBox();
    expect(bbox.minX).eql(0);
    expect(bbox.minY).eql(0);
    expect(bbox.maxX).eql(40);
    expect(bbox.maxY).eql(40);
  });

  it('isHit', () => {
    expect(circle.isHit(20, 20)).eql(true);
    expect(circle.isHit(20, 39)).eql(true);
    expect(circle.isHit(10, 41)).eql(false);
  });

  it('change', () => {
    expect(circle.attr('r')).eql(20);
    circle.attr('r', 10);
    expect(circle.attr('r')).eql(10);
    const bbox = circle.getBBox();
    expect(bbox.minX).eql(10);
    expect(bbox.minY).eql(10);
    expect(bbox.maxX).eql(30);
    expect(bbox.maxY).eql(30);
    expect(circle.isHit(20, 20)).eql(true);
    expect(circle.isHit(20, 29)).eql(true);
    expect(circle.isHit(20, 31)).eql(false);
  });

  it('destroy', () => {
    expect(circle.destroyed).eql(false);
    circle.destroy();
    expect(circle.destroyed).eql(true);
  });
});
