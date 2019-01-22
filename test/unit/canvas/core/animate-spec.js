const expect = require('chai').expect;
const G = require('../../../../src/index');
const Util = require('../../../../src/util');

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
      width: 20,
      matrix: [ 2, 0, 0, 0, 2, 0, 0, 0, 1 ]
    }, 500, function() {
      called = true;
    }, 1000);
    setTimeout(function() {
      expect(shape.attr('x')).equal(10);
      expect(called).equal(false);
      shape.stopAnimate();
      setTimeout(function() {
        expect(shape.attr('matrix')[0]).equal(2);
        expect(shape.attr('matrix')[1]).equal(0);
        expect(shape.attr('matrix')[4]).equal(2);
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
  it('overlap animation with delays', done => {
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 150,
        y: 90,
        width: 20,
        height: 20,
        fill: 'red'
      }
    });
    shape.animate({ height: 100 }, 1000, 'easeLinear', function() {
      expect(shape.attr('height')).to.equal(100);
    }, 0);
    shape.animate({ height: 150 }, 1000, 'easeLinear', function() {
      expect(shape.attr('height')).to.equal(150);
      done();
    });
  }, 1000);
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
  it('stop animation on timeline', done => {
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
    setTimeout(() => {
      shape.stopAnimate();
      expect(shape._attrs.width, 100);
      expect(shape._attrs.height, 100);
      done();
    }, 200);
  });
  it('path animate with different length', done => {
    const shape = canvas.addShape('path', {
      attrs: {
        stroke: 'red',
        path: [[ 'M', 245.7373046875, 242.89436666666668 ], [ 'L', 611.5791015625, 35.262968333333305 ]]
      }
    });
    const toPath = [
      [ 'M', 115.26450892857142, 225.14576114285714 ],
      [ 'C', 115.26450892857142, 225.14576114285714, 178.7633443159541, 245.64869959397348, 219.76227678571428, 242.25132142857143 ],
      [ 'C', 262.3615586016684, 238.72133025111634, 290.04645452446687, 233.03905902988083, 324.2600446428571, 207.8273377857143 ],
      [ 'C', 373.64466881018114, 171.43620274416654, 382.1815853644091, 130.67553707530774, 428.7578125, 88.2441807142857 ],
      [ 'C', 465.77979965012344, 54.51682178959344, 502.6525532983182, 11.5, 533.2555803571429, 17.430549571428543 ],
      [ 'C', 586.2507675840325, 48.159742424458955, 583.3566828420871, 173.35341915199137, 637.7533482142858, 209.42998 ],
      [ 'C', 666.9548971278014, 228.79681892341995, 742.2511160714286, 156.03904899999998, 742.2511160714286, 156.03904899999998 ]
    ];
    shape.animate({
      path: toPath
    }, 200, function() {
      expect(parseInt(shape._attrs.path[1][1])).eqls(parseInt(toPath[1][1]));
      expect(shape._attrs.path[1][2]).eqls(toPath[1][2]);
      expect(shape._attrs.path[1][3]).eqls(toPath[1][3]);
      expect(shape._attrs.path[1][4]).eqls(toPath[1][4]);
      expect(shape._attrs.path[1][5]).eqls(toPath[1][5]);
      shape.remove();
      done();
    });

  });
  /* it.only('when callback throw error', (done) => {
    const shape = canvas.addShape('path', {
      attrs: {
        stroke: 'red',
        path: [[ 'M', 245.7373046875, 242.89436666666668 ], [ 'L', 611.5791015625, 35.262968333333305 ]]
      }
    });
    const toPath = [["M",115.26450892857142,225.14576114285714],["C",115.26450892857142,225.14576114285714,178.7633443159541,245.64869959397348,219.76227678571428,242.25132142857143],["C",262.3615586016684,238.72133025111634,290.04645452446687,233.03905902988083,324.2600446428571,207.8273377857143],["C",373.64466881018114,171.43620274416654,382.1815853644091,130.67553707530774,428.7578125,88.2441807142857],["C",465.77979965012344,54.51682178959344,502.6525532983182,11.5,533.2555803571429,17.430549571428543],["C",586.2507675840325,48.159742424458955,583.3566828420871,173.35341915199137,637.7533482142858,209.42998],["C",666.9548971278014,228.79681892341995,742.2511160714286,156.03904899999998,742.2511160714286,156.03904899999998]]
;
    shape.animate({
      path: toPath
    }, 200, function() {
      expect(shape._attrs.path[1]).eqls(toPath[1]);
       expect(1).eqls(2);
      done();
    });
    shape.animate({
      stroke: 'yellow'
    }, 5000);
    setTimeout(function() {
      shape.stopAnimate();
    }, 50);
  });*/
  /* it('animate of a large amount of shapes', () => {
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
  });*/
  it('onFrame rotate Math.PI * 2', done => {
    let count = 0;
    const shape = canvas.addShape('rect', {
      attrs: {
        x: 200,
        y: 100,
        width: 20,
        height: 20,
        fill: 'red'
      }
    });
    let matrix = shape.getMatrix();
    let end = false;
    shape.animate({
      onFrame(ratio) {
        count++;
        if (ratio === 1) {
          end = true;
        }
        const rad = ratio * Math.PI * 2;
        const toMatrix = Util.transform(matrix, [
          [ 't', -210, -110 ],
          [ 'r', rad ],
          [ 't', 210, 110 ]
        ]);
        return {
          matrix: toMatrix
        };
      }, repeat: false }, 1000, function() {
        expect(count > 50).to.be.true;
        matrix = shape.getMatrix();
        console.log(matrix);
        expect(matrix[0]).to.equal(1);
        expect(Util.isNumberEqual(matrix[1], 0)).to.be.true;
        expect(matrix[2]).to.equal(0);
        expect(Util.isNumberEqual(matrix[3], 0)).to.be.true;
        expect(matrix[4]).to.equal(1);
        expect(matrix[5]).to.equal(0);
        expect(Util.isNumberEqual(matrix[6], 0)).to.be.true;
        expect(Util.isNumberEqual(matrix[7], 0)).to.be.true;
        expect(matrix[8]).to.equal(1);
        expect(end).to.be.true;
        done();
      });
  });
});
