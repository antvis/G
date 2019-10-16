import { expect } from 'chai';
import Polyline from '../../../src/shape/polyline';
import getCanvas from '../../get-canvas';

describe('SVG polyline', () => {
  let canvas;
  let polyline;

  before(() => {
    canvas = getCanvas('svg-polyline');
    polyline = new Polyline({
      attrs: {
        points: [[50, 50], [100, 100], [50, 150], [100, 200], [50, 250], [100, 300], [50, 350], [100, 400]],
        stroke: 'red',
        lineWidth: 1,
      },
    });
    canvas.add(polyline);
  });

  it('init', () => {
    expect(polyline.attr('points')).eql([
      [50, 50],
      [100, 100],
      [50, 150],
      [100, 200],
      [50, 250],
      [100, 300],
      [50, 350],
      [100, 400],
    ]);
    expect(polyline.attr('stroke')).eql('red');
    expect(polyline.attr('lineWidth')).eql(1);
  });

  it('autoDraw', () => {
    expect(polyline.get('el')).not.eql(undefined);
    expect(polyline.get('el').getAttribute('stroke-width')).eq('1');
  });

  it('bbox', () => {
    const bbox = polyline.getBBox();
    expect(bbox.minX).eql(49.5);
    expect(bbox.minY).eql(49.5);
    expect(bbox.maxX).eql(100.5);
    expect(bbox.maxY).eql(400.5);
  });

  it('isHit', () => {
    expect(polyline.isHit(50, 50)).eql(true);
    expect(polyline.isHit(75, 75)).eql(true);
    expect(polyline.isHit(75, 77)).eql(false);
    expect(polyline.isHit(50, 100)).eql(false);
  });

  it('change', () => {
    expect(polyline.attr('lineWidth')).eql(1);
    polyline.attr('lineWidth', 4);
    expect(polyline.attr('lineWidth')).eql(4);
    polyline.draw(context);
    const bbox = polyline.getBBox();
    expect(bbox.minX).eql(48);
    expect(bbox.minY).eql(48);
    expect(bbox.maxX).eql(102);
    expect(bbox.maxY).eql(402);
    expect(polyline.isHit(50, 50)).eql(true);
    expect(polyline.isHit(100, 100)).eql(true);
    expect(polyline.isHit(75, 77)).eql(true);
    expect(polyline.isHit(50, 100)).eql(false);
  });

  it('destroy', () => {
    expect(polyline.destroyed).eql(false);
    polyline.destroy();
    expect(polyline.destroyed).eql(true);
  });
});
