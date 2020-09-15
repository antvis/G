import { expect } from 'chai';
import Dom from '../../../src/shape/dom';
import getCanvas from '../../get-canvas';

describe('SVG dom', () => {
  let canvas;
  let dom;

  before(() => {
    canvas = getCanvas('svg-dom');
    dom = new Dom({
      attrs: {
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        html: '<div><h1>Hello World</h1></div>',
      },
    });
    canvas.add(dom);
  });

  it('init', () => {
    expect(dom.attr('x')).eql(100);
    expect(dom.attr('y')).eql(100);
    expect(dom.attr('width')).eql(200);
    expect(dom.attr('height')).eql(200);
    expect(dom.attr('html')).eql('<div><h1>Hello World</h1></div>');
  });

  it('autoDraw', () => {
    expect(dom.get('el')).not.eql(undefined);
    expect(dom.get('el').getAttribute('width')).eql('200');
  });

  it('bbox', () => {
    const bbox = dom.getBBox();
    expect(bbox.minX).eql(100);
    expect(bbox.minY).eql(100);
    expect(bbox.maxX).eql(300);
    expect(bbox.maxY).eql(300);
  });

  it('isHit', () => {
    expect(dom.isHit(200, 200)).eql(true);
    expect(dom.isHit(99, 99)).eql(false);
  });

  it('change', () => {
    dom.attr({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      html: '<div><h1>Hello World</h1></div>',
    });
    const bbox = dom.getBBox();
    expect(bbox.minX).eql(0);
    expect(bbox.minY).eql(0);
    expect(bbox.maxX).eql(100);
    expect(bbox.maxY).eql(100);
    expect(dom.isHit(0, 0)).eql(true);
    expect(dom.isHit(20, 20)).eql(true);
    expect(dom.isHit(-1, -1)).eql(false);
  });

  it('set html(text) by function', () => {
    dom.attr({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      html(attrs) {
        return `<div><h1>Hello World,${attrs.width},${attrs.height}</h1></div>`;
      },
    });
    expect(dom.get('el').innerHTML).eql('<div><h1>Hello World,100,100</h1></div>');
  });

  it('set html(dom) by function', () => {
    dom.attr({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      html(attrs) {
        const div = document.createElement('div');
        div.id = 'new-dom-node';
        const child = document.createElement('span');
        child.innerHTML = `Hello Child,${attrs.width},${attrs.height}`;
        div.appendChild(child);
        return div;
      },
    });
    expect(dom.get('el').innerHTML).eql('<div id="new-dom-node"><span>Hello Child,100,100</span></div>');
  });

  it('destroy', () => {
    expect(dom.destroyed).eql(false);
    dom.destroy();
    expect(dom.destroyed).eql(true);
  });
});
