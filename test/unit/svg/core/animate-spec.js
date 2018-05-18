const expect = require('chai').expect;
const g = require('../../../../src/index');

const G = g.svg;

describe('animate', () => {
  const div = document.createElement('div');
  div.id = 'canvas-animate';
  document.body.appendChild(div);
  const canvas = new G.Canvas({
    containerId: 'canvas-animate',
    width: 500,
    height: 500
  });
  it('repeat', () => {
    const shape = canvas.addShape('circle', {
      attrs: {
        x: 0,
        y: 0,
        fill: 'red',
        r: 10
      }
    });
    shape.animate({
      x: 100,
      y: 100,
      repeat: true
    }, 2000);
  });
  it('start animate', done => {
    let called = false;
    const shape = canvas.addShape('circle', {
      attrs: {
        x: 0,
        y: 0,
        fill: 'red',
        r: 10
      }
    });
    shape.animate({
      x: 100,
      y: 100
    }, 500, () => {
      called = true;
    });

    expect(shape.attr('x')).equal(0);
    setTimeout(() => {
      expect(shape.attr('x')).equal(100);
      expect(shape.attr('y')).equal(100);
      expect(called).equal(true);
      done();
    }, 600);
  });

  it('start delay and stop', done => {
    let called = false;
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        stroke: 'blue',
        lineWidth: 3
      }
    });
    canvas.draw();
    shape.animate({
      x: 200,
      width: 20
    }, 500, () => {
      called = true;
    }, 100);
    setTimeout(() => {
      expect(shape.attr('x')).equal(10);
      expect(called).equal(false);
      shape.stopAnimate();
      setTimeout(() => {
        expect(shape.attr('x')).equal(200);
        expect(called).equal(true);
        done();
      }, 80);
    }, 50);
  });

  it('destory', done => {
    let called = false;
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 50,
        y: 50,
        width: 20,
        height: 20,
        fill: 'pink'
      }
    });
    shape.animate({ fill: 'red' }, 300, () => {
      called = true;
    });

    expect(() => {
      shape.destroy();
    }).not.to.throw();
    setTimeout(() => {
      expect(called).equal(false);
      done();
    }, 350);
  });

  it('with clip animate', done => {
    const clip = new G.Circle({
      attrs: {
        x: 100,
        y: 100,
        r: 10,
        fill: 'blue'
      },
      canvas
    });
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 90,
        y: 90,
        clip,
        width: 20,
        height: 20,
        fill: 'red'
      }
    });
    canvas.draw();
    shape.set('animating', true);
    clip.animate({
      r: 20,
      repeat: true
    }, 1000);

    setTimeout(() => {
      shape.stopAnimate();
      expect(shape.get('animating', false));
      expect(clip.get('animating', false));
      done();
    }, 1000);
  });
});
