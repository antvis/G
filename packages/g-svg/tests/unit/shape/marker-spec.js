import { expect } from 'chai';
import { isNumberEqual } from '@antv/util';
import Marker from '../../../src/shape/marker';
import getCanvas from '../../get-canvas';

describe('SVG Marker', () => {
  let canvas;
  let marker;

  before(() => {
    canvas = getCanvas('svg-marker');
    marker = new Marker({
      attrs: {
        x: 20,
        y: 20,
        radius: 10,
        fill: 'red',
        symbol: 'circle',
      },
    });
    canvas.add(marker);
  });

  it('init', () => {
    expect(marker.attr('x')).eql(20);
    expect(marker.attr('y')).eql(20);
    expect(marker.attr('radius')).eql(10);
    expect(marker.attr('fill')).eql('red');
    expect(marker.attr('symbol')).eql('circle');
  });

  it('autoDraw', () => {
    expect(marker.get('el')).not.eql(undefined);
    expect(marker.get('el').getAttribute('fill')).eq('red');
  });

  it('bbox', () => {
    const bbox = marker.getBBox();
    expect(isNumberEqual(bbox.minX, 10)).eql(true);
    expect(isNumberEqual(bbox.minY, 10)).eql(true);
    expect(isNumberEqual(bbox.maxX, 30)).eql(true);
    expect(isNumberEqual(bbox.maxY, 30)).eql(true);
  });

  it('isHit', () => {
    expect(marker.isHit(20, 20)).eql(true);
    expect(marker.isHit(20, 30)).eql(true);
    expect(marker.isHit(20, 40)).eql(false);
  });

  it('change', () => {
    expect(marker.attr('radius')).eql(10);
    marker.attr('radius', 20);
    expect(marker.attr('radius')).eql(20);
    const bbox = marker.getBBox();
    expect(isNumberEqual(bbox.minX, 0)).eql(true);
    expect(isNumberEqual(bbox.minY, 0)).eql(true);
    expect(isNumberEqual(bbox.maxX, 40)).eql(true);
    expect(isNumberEqual(bbox.maxY, 40)).eql(true);
    expect(marker.isHit(20, 20)).eql(true);
    expect(marker.isHit(20, 30)).eql(true);
    expect(marker.isHit(20, 50)).eql(false);
  });

  it('destroy', () => {
    expect(marker.destroyed).eql(false);
    marker.destroy();
    expect(marker.destroyed).eql(true);
  });
});
