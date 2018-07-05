const expect = require('chai').expect;
const G = require('../../../../src/canvas/index');

describe('animate', function() {
  const div = document.createElement('div');
  div.id = 'canvas-animate';
  document.body.appendChild(div);
  const canvas = new G.Canvas({
    containerId: 'canvas-animate',
    width: 1000,
    height: 1000
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
  it('start animate', function(done) {
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
    }, 500, function() {
      called = true;
    });

    expect(shape.attr('x')).equal(0);
    setTimeout(function() {
      expect(shape.attr('x')).equal(100);
      expect(shape.attr('y')).equal(100);
      expect(called).equal(true);
      done();
    }, 600);
  });

  it('start delay and stop', function(done) {
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
    }, 500, function() {
      called = true;
    }, 1000);
    setTimeout(function() {
      expect(shape.attr('x')).equal(10);
      expect(called).equal(false);
      shape.stopAnimate();
      setTimeout(function() {
        expect(shape.attr('x')).equal(200);
        expect(called).equal(true);
        done();
      }, 500);
    }, 500);
  });

  it('destory', function(done) {
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
    shape.animate({ fill: 'red' }, 300, function() {
      called = true;
    });

    expect(() => {
      shape.destroy();
    }).not.to.throw();
    setTimeout(function() {
      expect(called).equal(false);
      done();
    }, 350);
  });

  it('with clip animate', function(done) {
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

    setTimeout(function() {
      shape.stopAnimate();
      expect(shape.get('animating', false));
      expect(clip.get('animating', false));
      done();
    }, 1000);
  });
  it('animate pause & resume', done => {
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 150,
        y: 90,
        width: 20,
        height: 20,
        fill: 'red'
      }
    });
    shape.animate({ height: 100 }, 1000);
    setTimeout(() => {
      shape.pauseAnimate();
      expect(shape.attr('height'), 60);
    }, 500);
    setTimeout(() => {
      expect(shape.attr('height'), 60);
      shape.resumeAnimate();
    }, 700);
    setTimeout(() => {
      expect(shape.attr('height'), 100);
      done();
    }, 1000);
  });
  it('overlap animating attrs', done => {
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 200,
        y: 90,
        width: 20,
        height: 20,
        fill: 'red'
      }
    });
    shape.animate({ width: 100, height: 100 }, 1000);
    shape.animate({ width: 50 }, 1000);
    setTimeout(() => {
      expect(shape.attr('height'), 100);
      expect(shape.attr('width'), 50);
      done();
    }, 1000);
  });
  it('animate of a large amount of shapes', () => {
    const MAX_COUNT = 3000;
    let circle;
    for (let i = 0; i < MAX_COUNT; i++) {
      circle = canvas.addShape('circle', {
        attrs: {
          r: Math.random() * 10,
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          // stroke: '#333',
          fill: '#333'
        }
      });
      circle.animate({ x: Math.random() * 1000, y: Math.random() * 1000, repeat: true }, 2000);
    }
    canvas.draw();
  });
  it('animate with transform', done => {
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 200,
        y: 90,
        width: 20,
        height: 20,
        fill: 'red'
      }
    });
    shape.animate({ transform: [[ 't', -20, -20 ], [ 's', 2, 2 ], [ 't', 20, 20 ]] }, 1000);
    setTimeout(() => {
      expect(shape.getMatrix()[0], 2);
      expect(shape.getMatrix()[4], 2);
      done();
    }, 1000);
  });
});
