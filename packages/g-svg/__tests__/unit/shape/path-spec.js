import { expect } from 'chai';
import Path from '../../../src/shape/path';
import getCanvas from '../../get-canvas';

describe('SVG path', () => {
  let canvas;
  let path;

  before(() => {
    canvas = getCanvas('svg-path');
    path = new Path({
      attrs: {
        path: [['M', 100, 100], ['L', 200, 200]],
        lineWidth: 1,
        stroke: 'red',
        startArrow: {
          path: 'M 10,0 L -10,-10 L -10,10 Z',
          d: 10,
        },
      },
    });
    canvas.add(path);
  });

  it('init', () => {
    expect(path.attr('path')).eql([['M', 100, 100], ['L', 200, 200]]);
    expect(path.attr('lineWidth')).eql(1);
    expect(path.attr('stroke')).eql('red');
    expect(path.attr('startArrow')).eql({
      path: 'M 10,0 L -10,-10 L -10,10 Z',
      d: 10,
    });
  });

  it('autoDraw', () => {
    expect(path.get('el')).not.eql(undefined);
    expect(path.get('el').getAttribute('stroke-width')).eql('1');
  });

  it('bbox', () => {
    const bbox = path.getBBox();
    expect(bbox.minX).eql(99.5);
    expect(bbox.minY).eql(99.5);
    expect(bbox.maxX).eql(200.5);
    expect(bbox.maxY).eql(200.5);
  });

  it('isHit', () => {
    expect(path.isHit(100, 100)).eql(true);
    expect(path.isHit(110, 109.5)).eql(true); // in arrow
    expect(path.isHit(150, 150)).eql(true);
    expect(path.isHit(200, 200)).eql(true);
    expect(path.isHit(300, 300)).eql(false);
    expect(path.isHit(150, 100)).eql(false);
  });

  it('change', () => {
    path.attr('path', [['M', 100, 100], ['L', 200, 200], ['L', 300, 300]]);
    expect(path.attr('path')).eql([['M', 100, 100], ['L', 200, 200], ['L', 300, 300]]);
    const bbox = path.getBBox();
    expect(bbox.minX).eql(99.5);
    expect(bbox.minY).eql(99.5);
    expect(bbox.maxX).eql(300.5);
    expect(bbox.maxY).eql(300.5);
    expect(path.isHit(100, 100)).eql(true);
    expect(path.isHit(110, 109.5)).eql(true); // in arrow
    expect(path.isHit(150, 150)).eql(true);
    expect(path.isHit(300, 300)).eql(true);
    expect(path.isHit(400, 400)).eql(false);
    expect(path.isHit(150, 100)).eql(false);
  });

  it('destroy', () => {
    expect(path.destroyed).eql(false);
    path.destroy();
    expect(path.destroyed).eql(true);
  });
});
