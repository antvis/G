const expect = require('chai').expect;
const g = require('../../../../src/index');

const G = g.svg;
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'canvas-dom';
document.body.appendChild(div);
describe('dom', () => {
  const canvas = new Canvas({
    containerId: 'canvas-dom',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  const dom = new G.Dom({
    attrs: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  });
  canvas.add(dom);
  it('init attrs', () => {
    expect(dom.attr('x')).to.equal(0);
    expect(dom.attr('y')).to.equal(0);
    expect(dom.attr('width')).to.equal(0);
    expect(dom.attr('height')).to.equal(0);
  });

  it('x', () => {
    dom.attr('x', 10);
    expect(dom.attr('x')).to.equal(10);
    expect(dom.attr('y')).to.equal(0);
    expect(dom.attr('width')).to.equal(0);
    expect(dom.attr('height')).to.equal(0);
  });

  it('y', () => {
    dom.attr('y', 10);
    expect(dom.attr('x')).to.equal(10);
    expect(dom.attr('y')).to.equal(10);
    expect(dom.attr('width')).to.equal(0);
    expect(dom.attr('height')).to.equal(0);
  });

  it('width', () => {
    dom.attr('width', 100);
    expect(dom.attr('x')).to.equal(10);
    expect(dom.attr('y')).to.equal(10);
    expect(dom.attr('width')).to.equal(100);
    expect(dom.attr('height')).to.equal(0);
  });

  it('height', () => {
    dom.attr('height', 100);
    expect(dom.attr('x')).to.equal(10);
    expect(dom.attr('y')).to.equal(10);
    expect(dom.attr('width')).to.equal(100);
    expect(dom.attr('height')).to.equal(100);
  });

  it('dom string', () => {
    dom.attr('html', '<div><p>dom字符串</p></div>');
    expect(dom.attr('html')).to.equal('<div><p>dom字符串</p></div>');
  });

  it('dom elements', () => {
    const div = document.createElement('div');
    const child = document.createElement('input');
    child.setAttribute('type', 'text');
    div.appendChild(child);
    const dom2 = new G.Dom({
      attrs: {
        x: 0,
        y: 100,
        width: 100,
        height: 100,
        html: div
      }
    });
    canvas.add(dom2);
    expect(dom2.attr('html')).to.equal(div);
  });
});
