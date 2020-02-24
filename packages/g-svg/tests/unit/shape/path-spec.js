import { expect } from 'chai';
import Path from '../../../src/shape/path';
import getCanvas from '../../get-canvas';

describe('SVG path', () => {
  let canvas;
  let path;
  const p1 = [
    ['M', 10, 10],
    ['L', 20, 20],
  ];
  const p2 = [
    ['M', 10, 10],
    ['Q', 20, 20, 30, 10],
  ];
  const p3 = [
    ['M', 10, 10],
    ['L', 20, 20],
    ['C', 30, 10, 40, 30, 50, 20],
  ];
  const p4 = [['M', 10, 10], ['L', 20, 20], ['A', 20, 20, 0, 0, 1, 60, 20], ['Z'], ['M', 200, 200], ['L', 300, 300]];
  const p5 =
    'M 100,300' +
    'l 50,-25' +
    'a 25,25 -30 0,1 50,-25' +
    'l 50,-25' +
    'a 25,50 -30 0,1 50,-25' +
    'l 50,-25' +
    'a 25,75 -30 0,1 50,-25' +
    'l 50,-25' +
    'a 25,100 -30 0,1 50,-25' +
    'l 50,-25' +
    'l 0, 200,' +
    'z';

  before(() => {
    canvas = getCanvas('svg-path');
    path = new Path({
      attrs: {
        path: [
          ['M', 100, 100],
          ['L', 200, 200],
        ],
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
    expect(path.attr('path')).eql([
      ['M', 100, 100],
      ['L', 200, 200],
    ]);
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

  it('new path bbox', () => {
    const path1 = new Path({
      type: 'path',
      attrs: {
        path: [
          ['M', 100, 100],
          ['L', 200, 200],
        ],
        lineWidth: 1,
        stroke: 'red',
        startArrow: {
          path: 'M 10,0 L -10,-10 L -10,10 Z',
          d: 10,
        },
      },
    });
    const bbox = path1.getBBox();
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
    path.attr('path', [
      ['M', 100, 100],
      ['L', 200, 200],
      ['L', 300, 300],
    ]);
    expect(path.attr('path')).eql([
      ['M', 100, 100],
      ['L', 200, 200],
      ['L', 300, 300],
    ]);
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

  it('getTotalLength', () => {
    path.attr('path', p1);
    expect(path.getTotalLength()).eqls(14.142135620117188);
    path.attr('path', p2);
    expect(path.getTotalLength()).eqls(22.95588493347168);
    path.attr('path', p3);
    expect(path.getTotalLength()).eqls(46.89018630981445);
    path.attr('path', p4);
    // TODO: 这个 case 与 Canavs 的计算结果误差较大，问题原因待排查
    // Canvas 版本
    // expect(path.getTotalLength()).eqls(258.5855635430996);
    expect(path.getTotalLength()).eqls(269.3943786621094);
    path.attr('path', p5);
    expect(path.getTotalLength()).eqls(1579.16943359375);
  });

  it('getPoint', () => {
    path.attr('path', p1);
    expect(path.getPoint(0)).eqls({
      x: 10,
      y: 10,
    });
    expect(path.getPoint(0.5)).eqls({
      x: 15,
      y: 15,
    });
    expect(path.getPoint(1)).eqls({
      x: 20,
      y: 20,
    });
    path.attr('path', p2);
    expect(path.getPoint(0)).eqls({
      x: 10,
      y: 10,
    });
    expect(path.getPoint(0.5)).eqls({
      x: 20,
      y: 15.000000953674316,
    });
    expect(path.getPoint(1)).eqls({
      x: 30,
      y: 10,
    });
    path.attr('path', p3);
    expect(path.getPoint(0)).eqls({
      x: 10,
      y: 10,
    });
    expect(path.getPoint(0.5)).eqls({
      x: 28.46387481689453,
      y: 17.35248374938965,
    });
    expect(path.getPoint(1)).eqls({
      x: 50,
      y: 20,
    });
    path.attr('path', p4);
    expect(path.getPoint(0)).eqls({
      x: 10,
      y: 10,
    });
    expect(path.getPoint(0.5)).eqls({
      x: 204.75469970703125,
      y: 204.75469970703125,
    });
    expect(path.getPoint(1)).eqls({
      x: 300,
      y: 300,
    });
    path.attr('path', p5);
    expect(path.getPoint(0)).eqls({
      x: 100,
      y: 300,
    });
    expect(path.getPoint(0.5)).eqls({
      x: 451.3769226074219,
      y: 33.00656509399414,
    });
    expect(path.getPoint(1)).eqls({
      x: 100,
      y: 300,
    });
  });

  it('destroy', () => {
    expect(path.destroyed).eql(false);
    path.destroy();
    expect(path.destroyed).eql(true);
  });
});
