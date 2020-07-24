const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const DELAY = 40; // 本来应该 16ms，但是测试时需要适当调大这个值

const dom = document.createElement('div');
document.body.appendChild(dom);

describe('prompt refresh test', () => {
  const canvas = new Canvas({
    container: dom,
    width: 300,
    pixelRatio: 1,
    height: 300,
  });
  const ctx = canvas.get('context');
  let group;
  let group1;
  let group2;
  let group11;
  let group12;

  it('empty groups', (done) => {
    group = canvas.addGroup();
    group1 = group.addGroup();
    group2 = group.addGroup();
    group11 = group1.addGroup({ zIndex: 10 });
    group12 = group2.addGroup({ zIndex: -1 });
    expect(canvas.get('refreshElements').length).eql(1);
    setTimeout(() => {
      expect(canvas.get('refreshElements').length).eql(0);
      expect(group.get('hasChanged')).eql(false);
      done();
    }, DELAY);
  });

  it('init add', (done) => {
    group1.addShape({
      type: 'circle',
      attrs: {
        x: 100,
        y: 100,
        r: 10,
        fill: '#0000ff',
      },
    });
    expect(getColor(ctx, 100, 100)).eql('#000000');

    group11.addShape({
      type: 'rect',
      attrs: {
        x: 200,
        y: 100,
        width: 20,
        height: 20,
        fill: '#ff0000',
      },
    });
    expect(getColor(ctx, 201, 101)).eql('#000000');
    expect(canvas.get('refreshElements').length).eql(2);
    setTimeout(() => {
      expect(canvas.get('refreshElements').length).eql(0);
      expect(getColor(ctx, 100, 100)).eql('#0000ff');
      expect(getColor(ctx, 201, 101)).eql('#ff0000');
      done();
    }, DELAY + 5);
  });

  it('shape move', (done) => {
    const circle = group12.addShape({
      type: 'circle',
      attrs: {
        x: 50,
        y: 50,
        r: 5,
        fill: '#00ff00',
      },
    });
    group12.addGroup();
    setTimeout(() => {
      expect(getColor(ctx, 50, 50)).eql('#00ff00');
      circle.translate(50, 50);
      setTimeout(() => {
        expect(getColor(ctx, 50, 50)).eql('#000000');
        expect(getColor(ctx, 100, 100)).eql('#00ff00');
        done();
      }, DELAY);
    }, DELAY);
  });

  it('group move', (done) => {
    group12.translate(20, 20);
    expect(getColor(ctx, 100, 100)).eql('#00ff00');
    setTimeout(() => {
      expect(getColor(ctx, 100, 100)).eql('#0000ff');
      expect(getColor(ctx, 120, 120)).eql('#00ff00');
      done();
    }, DELAY);
  });

  it('group move out', (done) => {
    group12.translate(-200, 0);
    setTimeout(() => {
      expect(getColor(ctx, 120, 120)).eql('#000000');
      expect(group12.get('cacheCanvasBBox')).eql(null);
      group12.translate(180, -20);
      setTimeout(() => {
        expect(getColor(ctx, 100, 100)).eql('#00ff00');
        expect(getColor(ctx, 95, 96)).eql('#0000ff');
        done();
      }, DELAY);
    }, DELAY);
  });

  it('group sort', (done) => {
    const group3 = canvas.addGroup();
    group3.addShape({
      type: 'circle',
      zIndex: 1,
      attrs: {
        x: 200,
        y: 200,
        r: 5,
        fill: '#00ff00',
      },
    });

    const s2 = group3.addShape({
      type: 'circle',
      zIndex: 0,
      attrs: {
        x: 200,
        y: 200,
        r: 10,
        fill: '#0000ff',
      },
    });
    setTimeout(() => {
      expect(getColor(ctx, 200, 200)).eql('#0000ff');
      group3.sort();
      setTimeout(() => {
        expect(getColor(ctx, 200, 200)).eql('#00ff00');
        s2.toFront();
        setTimeout(() => {
          expect(getColor(ctx, 200, 200)).eql('#0000ff');
          done();
        }, DELAY);
      }, DELAY);
    }, DELAY);
  });

  it('group clip', (done) => {
    group12.setClip({
      type: 'rect',
      attrs: {
        x: 100,
        y: 100,
        width: 10,
        height: 10,
      },
    });
    setTimeout(() => {
      expect(getColor(ctx, 99, 99)).eql('#0000ff');
      expect(getColor(ctx, 101, 101)).eql('#00ff00');
      group12.getClip().attr({ x: 92, y: 92 });
      setTimeout(() => {
        expect(getColor(ctx, 99, 99)).eql('#00ff00');
        done();
      }, DELAY);
    }, DELAY);
  });

  it('canvas change size', (done) => {
    group2.addShape({
      type: 'rect',
      attrs: {
        x: 310,
        y: 310,
        width: 10,
        height: 10,
        fill: '#fff000',
      },
    });
    setTimeout(() => {
      expect(getColor(ctx, 310, 310)).eql('#000000');
      canvas.changeSize(500, 500);
      setTimeout(() => {
        expect(getColor(ctx, 310, 310)).eql('#fff000');
        done();
      }, DELAY);
    }, DELAY);
  });
});
