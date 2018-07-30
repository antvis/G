/**
 * Created by Elaine on 2018/5/7.
 */
const expect = require('chai').expect;
const G = require('../../../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'canvas-ellipse';
document.body.appendChild(div);


describe('Ellipse', () => {

  const canvas = new Canvas({
    containerId: 'canvas-ellipse',
    width: 200,
    height: 200,
    pixelRatio: 1,
    renderer: 'svg'
  });

  const ellipse = new G.Ellipse({
    attrs: {
      x: 0,
      y: 0,
      rx: 1,
      ry: 1
    }
  });
  canvas.add(ellipse);
  it('init attr', () => {
    expect(ellipse.attr('x')).to.equal(0);
    expect(ellipse.attr('y')).to.equal(0);
    expect(ellipse.attr('rx')).to.equal(1);
    expect(ellipse.attr('ry')).to.equal(1);
    expect(ellipse.attr('lineWidth')).to.equal(1);
    expect(ellipse.attr('stroke')).to.be.undefined;
    expect(ellipse.attr('fill')).to.be.undefined;
  });

  it('x', () => {
    ellipse.attr('x', 20);
    expect(ellipse.attr('x')).to.equal(20);
  });

  it('y', () => {
    ellipse.attr('y', 30);
    expect(ellipse.attr('y')).to.equal(30);
  });

  it('rx', () => {
    expect(ellipse.attr('rx')).to.equal(1);
    ellipse.attr('rx', 5);
    expect(ellipse.attr('rx')).to.equal(5);
  });

  it('ry', () => {
    expect(ellipse.attr('ry')).to.equal(1);
    ellipse.attr('ry', 10);
    expect(ellipse.attr('ry')).to.equal(10);
  });


  it('lineWidth', () => {
    expect(ellipse.attr('lineWidth')).to.equal(1);
    ellipse.attr('lineWidth', 2);
    expect(ellipse.attr('lineWidth')).to.equal(2);
  });

  it('stroke', () => {
    ellipse.attr('stroke', 'l (0) 0:#959231 1:#00cd54');
    expect(ellipse.attr('stroke')).to.equal('l (0) 0:#959231 1:#00cd54');
    canvas.add(ellipse);
    canvas.draw();
  });

  it('fill', () => {
    ellipse.attr('fill', 'l (90) 0:#959231 1:#00cd54');
    expect(ellipse.attr('fill')).to.equal('l (90) 0:#959231 1:#00cd54');
    canvas.draw();
  });


  it('isHit', () => {
    new G.Ellipse({
      attrs: {
        x: 50,
        y: 50,
        rx: 200,
        ry: 100
      }
    });

    new G.Ellipse({
      attrs: {
        x: 100,
        y: 200,
        rx: 50,
        ry: 80
      }
    });

    const ellipse3 = new G.Ellipse({
      attrs: {
        x: 200,
        y: 200,
        rx: 50,
        ry: 100
      }
    });

    ellipse3.attr({
      fill: 'green',
      stroke: 'red'
    });
    canvas.add(ellipse3);
  });
});
