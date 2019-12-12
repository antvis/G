import { expect } from 'chai';
import Polyline from '../../../src/shape/polyline';
import getCanvas from '../../get-canvas';

describe('SVG polyline', () => {
  let canvas;
  let polyline;
  const points1 = [
    [10, 10],
    [100, 10],
    [100, 100],
    [10, 100],
  ];
  const points2 = [
    [50, 50],
    [100, 50],
    [100, 100],
    [150, 100],
    [150, 150],
    [200, 150],
  ];

  before(() => {
    canvas = getCanvas('svg-polyline');
    polyline = new Polyline({
      attrs: {
        points: points1,
        stroke: 'red',
        lineWidth: 1,
      },
    });
    canvas.add(polyline);
  });

  it('init', () => {
    expect(polyline.attr('points')).eql(points1);
    expect(polyline.attr('stroke')).eql('red');
    expect(polyline.attr('lineWidth')).eql(1);
  });

  it('autoDraw', () => {
    expect(polyline.get('el')).not.eql(undefined);
    expect(polyline.get('el').getAttribute('stroke-width')).eq('1');
  });

  it('bbox', () => {
    const bbox = polyline.getBBox();
    expect(bbox.minX).eql(9.5);
    expect(bbox.minY).eql(9.5);
    expect(bbox.maxX).eql(100.5);
    expect(bbox.maxY).eql(100.5);
  });

  it('isHit', () => {
    expect(polyline.isHit(10, 10)).eql(true);
    expect(polyline.isHit(100, 10)).eql(true);
    expect(polyline.isHit(100, 110)).eql(false);
    expect(polyline.isHit(50, 50)).eql(false);
  });

  it('change', () => {
    expect(polyline.attr('lineWidth')).eql(1);
    polyline.attr('lineWidth', 4);
    expect(polyline.attr('lineWidth')).eql(4);
    polyline.draw(context);
    const bbox = polyline.getBBox();
    expect(bbox.minX).eql(8);
    expect(bbox.minY).eql(8);
    expect(bbox.maxX).eql(102);
    expect(bbox.maxY).eql(102);
    expect(polyline.isHit(11, 11)).eql(true);
    expect(polyline.isHit(101, 11)).eql(true);
    expect(polyline.isHit(100, 110)).eql(false);
    expect(polyline.isHit(50, 50)).eql(false);
  });

  it('getTotalLength', () => {
    polyline.attr('points', points1);
    expect(polyline.getTotalLength()).eqls(270);
    polyline.attr('points', points2);
    expect(polyline.getTotalLength()).eqls(250);
  });

  it('getPoint', () => {
    polyline.attr('points', points1);
    expect(polyline.getPoint(0)).eqls({
      x: 10,
      y: 10,
    });
    expect(polyline.getPoint(0.6)).eqls({
      x: 100,
      y: 82,
    });
    expect(polyline.getPoint(1)).eqls({
      x: 10,
      y: 100,
    });
    polyline.attr('points', points2);
    expect(polyline.getPoint(0)).eqls({
      x: 50,
      y: 50,
    });
    expect(polyline.getPoint(0.5)).eqls({
      x: 125,
      y: 100,
    });
    expect(polyline.getPoint(1)).eqls({
      x: 200,
      y: 150,
    });
  });

  it('destroy', () => {
    expect(polyline.destroyed).eql(false);
    polyline.destroy();
    expect(polyline.destroyed).eql(true);
  });
});
