import { expect } from 'chai';
import Line from '../../../src/shape/line';
import getCanvas from '../../get-canvas';

describe('SVG Line', () => {
  let canvas;
  let line;

  before(() => {
    canvas = getCanvas('svg-line');
    line = new Line({
      attrs: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'red',
      },
    });
    canvas.add(line);
  });

  it('init', () => {
    expect(line.attr('x1')).eql(0);
    expect(line.attr('y1')).eql(0);
    expect(line.attr('x2')).eql(100);
    expect(line.attr('y2')).eql(100);
  });

  it('autoDraw', () => {
    expect(line.get('el')).not.eql(undefined);
    expect(line.get('el').getAttribute('stroke')).eql('red');
  });

  it('bbox', () => {
    const bbox = line.getBBox();
    expect(bbox.minX).eql(-0.5);
    expect(bbox.minY).eql(-0.5);
    expect(bbox.maxX).eql(100.5);
    expect(bbox.maxY).eql(100.5);
  });

  it('isHit', () => {
    expect(line.isHit(0, 0)).eql(true);
    expect(line.isHit(50, 50)).eql(true);
    expect(line.isHit(100, 100)).eql(true);
    expect(line.isHit(100, 0)).eql(false);
  });

  it('change', () => {
    expect(line.attr('x1')).eql(0);
    expect(line.attr('y1')).eql(0);
    line.attr('x1', 10);
    line.attr('y1', 10);
    expect(line.attr('x1')).eql(10);
    expect(line.attr('y1')).eql(10);
    const bbox = line.getBBox();
    expect(bbox.minX).eql(9.5);
    expect(bbox.minY).eql(9.5);
    expect(bbox.maxX).eql(100.5);
    expect(bbox.maxY).eql(100.5);
    expect(line.isHit(0, 0)).eql(false);
    expect(line.isHit(50, 50)).eql(true);
    expect(line.isHit(100, 100)).eql(true);
    expect(line.isHit(100, 0)).eql(false);
  });

  it('destroy', () => {
    expect(line.destroyed).eql(false);
    line.destroy();
    expect(line.destroyed).eql(true);
  });
});
