import { expect } from 'chai';
import Ellipse from '../../../src/shape/ellipse';
import getCanvas from '../../get-canvas';

describe('SVG Ellipse', () => {
  let canvas;
  let ellipse;

  before(() => {
    canvas = getCanvas('svg-ellipse');
    ellipse = new Ellipse({
      attrs: {
        x: 50,
        y: 50,
        rx: 20,
        ry: 30,
        stroke: 'red',
      },
    });
    canvas.add(ellipse);
  });

  it('init', () => {
    expect(ellipse.attr('x')).eql(50);
    expect(ellipse.attr('y')).eql(50);
    expect(ellipse.attr('rx')).eql(20);
    expect(ellipse.attr('ry')).eql(30);
  });

  it('autoDraw', () => {
    expect(ellipse.get('el')).not.eql(undefined);
    expect(ellipse.get('el').getAttribute('stroke')).eql('red');
  });

  it('bbox', () => {
    const bbox = ellipse.getBBox();
    expect(bbox.minX).eql(29.5);
    expect(bbox.minY).eql(19.5);
    expect(bbox.maxX).eql(70.5);
    expect(bbox.maxY).eql(80.5);
  });

  it('isHit', () => {
    expect(ellipse.isHit(50, 50)).eql(false);
    expect(ellipse.isHit(70.5, 50)).eql(true);
  });

  it('change', () => {
    expect(ellipse.attr('rx')).eql(20);
    ellipse.attr('rx', 30);
    expect(ellipse.attr('rx')).eql(30);
    const bbox = ellipse.getBBox();
    expect(bbox.minX).eql(19.5);
    expect(bbox.minY).eql(19.5);
    expect(bbox.maxX).eql(80.5);
    expect(bbox.maxY).eql(80.5);
    expect(ellipse.isHit(50, 50)).eql(false);
    expect(ellipse.isHit(80.5, 50)).eql(true);
  });

  it('destroy', () => {
    expect(ellipse.destroyed).eql(false);
    ellipse.destroy();
    expect(ellipse.destroyed).eql(true);
  });
});
