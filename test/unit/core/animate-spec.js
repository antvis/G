const expect = require('chai').expect;
const G = require('../../../src/index');


describe('animate', function() {
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
    }, 100);
    setTimeout(function() {
      expect(shape.attr('x')).equal(10);
      expect(called).equal(false);
      shape.stopAnimate();
      setTimeout(function() {
        expect(shape.attr('x')).equal(200);
        expect(called).equal(true);
        done();
      }, 80);
    }, 50);
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
});
