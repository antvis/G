const expect = require('chai').expect;
import Canvas from '../../src/abstract/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);

class MyCanvas extends Canvas {
  getShapeBase() {}

  createDom() {
    const el = document.createElement('canvas');
    return el;
  }

  getGroupBase() {}
}

describe('test canvas', () => {
  const canvas = new MyCanvas({
    container: dom,
    width: 500,
    height: 500,
  });

  it('init', () => {
    const el = canvas.get('el');
    expect(el.style.width).eqls('500px');
    expect(el.style.height).eqls('500px');
    expect(canvas.get('children').length).eqls(0);
  });

  it('getPointByClient', () => {
    const rect = dom.getBoundingClientRect();
    const point = canvas.getPointByClient(rect.left + 10, rect.top + 20);
    expect(point).eqls({
      x: 10,
      y: 20,
    });
  });

  it('getClientByPoint', () => {
    const rect = dom.getBoundingClientRect();
    const point = canvas.getClientByPoint(10, 20);
    expect(point).eqls({
      x: rect.left + 10,
      y: rect.top + 20,
    });
  });

  it('change size', () => {
    canvas.changeSize(600, 600);
    const el = canvas.get('el');
    expect(el.style.width).eqls('600px');
    expect(el.style.height).eqls('600px');
  });

  it('destroy', () => {
    canvas.destroy();
    expect(canvas.destroyed).eqls(true);
    expect(dom.childNodes.length).eqls(0);
  });
});
