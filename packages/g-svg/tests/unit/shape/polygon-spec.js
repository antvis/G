import { expect } from 'chai';
import Polygon from '../../../src/shape/polygon';
import getCanvas from '../../get-canvas';

describe('SVG polygon', () => {
  let canvas;
  let polygon;

  before(() => {
    canvas = getCanvas('svg-polygon');
    polygon = new Polygon({
      attrs: {
        points: [[50, 50], [100, 100], [50, 150], [100, 200], [50, 250], [100, 300], [50, 350], [100, 400]],
        stroke: 'red',
        lineWidth: 1,
      },
    });
    canvas.add(polygon);
  });

  it('init', () => {
    expect(polygon.attr('points')).eql([
      [50, 50],
      [100, 100],
      [50, 150],
      [100, 200],
      [50, 250],
      [100, 300],
      [50, 350],
      [100, 400],
    ]);
    expect(polygon.attr('stroke')).eql('red');
    expect(polygon.attr('lineWidth')).eql(1);
  });

  it('autoDraw', () => {
    expect(polygon.get('el')).not.eql(undefined);
    expect(polygon.get('el').getAttribute('stroke-width')).eq('1');
  });

  it('bbox', () => {
    const bbox = polygon.getBBox();
    expect(bbox.minX).eql(49.5);
    expect(bbox.minY).eql(49.5);
    expect(bbox.maxX).eql(100.5);
    expect(bbox.maxY).eql(400.5);
  });

  it('isHit', () => {
    expect(polygon.isHit(50, 50)).eql(true);
    expect(polygon.isHit(100, 100)).eql(true);
    expect(polygon.isHit(75, 100)).eql(false);
    expect(polygon.isHit(50, 100)).eql(false);
  });

  it('change', () => {
    expect(polygon.attr('fill')).eql(undefined);
    expect(polygon.attr('lineWidth')).eql(1);
    polygon.attr('fill', 'blue');
    polygon.attr('lineWidth', 2);
    expect(polygon.attr('fill')).eql('blue');
    expect(polygon.attr('lineWidth')).eql(2);
    const bbox = polygon.getBBox();
    expect(bbox.minX).eql(49);
    expect(bbox.minY).eql(49);
    expect(bbox.maxX).eql(101);
    expect(bbox.maxY).eql(401);
    expect(polygon.isHit(50, 50)).eql(true);
    expect(polygon.isHit(100, 100)).eql(true);
    expect(polygon.isHit(75, 100)).eql(true);
    expect(polygon.isHit(50, 100)).eql(false);
  });

  it('destroy', () => {
    expect(polygon.destroyed).eql(false);
    polygon.destroy();
    expect(polygon.destroyed).eql(true);
  });
});
