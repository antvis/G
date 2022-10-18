import { Canvas, DisplayObjectPool, runtime, HTML } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { sleep } from '../utils';

chai.use(chaiAlmost(0.0001));
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('HTML', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should create HTML correctly.', async () => {
    const pool = runtime.displayObjectPool;
    expect(pool.getHTMLs().length).to.be.eqls(0);

    const html = new HTML({
      id: 'id',
      name: 'name',
      className: 'classname',
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
      },
    });

    await canvas.ready;
    canvas.appendChild(html);

    expect(pool.getHTMLs().length).to.be.eqls(1);

    expect(html.getAttribute('x')).to.be.eqls(100);
    expect(html.getAttribute('y')).to.be.eqls(100);
    expect(html.getAttribute('width')).to.be.eqls(100);
    expect(html.getAttribute('height')).to.be.eqls(100);

    const $el = html.getDomElement();
    expect($el.id).to.be.eqls('id');
    expect($el.getAttribute('name')).to.be.eqls('name');
    expect($el.className).to.be.eqls('classname');
    expect($el.style.position).to.be.eqls('absolute');
    expect($el.style.top).to.be.eqls('0px');
    expect($el.style.left).to.be.eqls('0px');
    expect($el.style.width).to.be.eqls('100px');
    expect($el.style.height).to.be.eqls('100px');
    expect($el.style.willChange).to.be.eqls('transform');
    expect($el.style.opacity).to.be.eqls('1');
    expect($el.style.visibility).to.be.eqls('visible');
    expect($el.style.pointerEvents).to.be.eqls('auto');
    expect($el.style.fontFamily).to.be.eqls('sans-serif');
    expect($el.style.fontSize).to.be.eqls('16px');
    expect($el.style.transform).to.be.eqls('matrix(1, 0, 0, 1, 100, 100)');
    expect($el.style.transformOrigin).to.be.eqls('0px 0px');
    expect($el.style.background).to.be.eqls('transparent');

    html.translateLocal(100, 100);

    await sleep(500);
    expect($el.style.transform).to.be.eqls('matrix(1, 0, 0, 1, 200, 200)');

    html.scaleLocal(0.5);

    await sleep(500);
    expect($el.style.transform).to.be.eqls('matrix(0.5, 0, 0, 0.5, 200, 200)');

    html.style.fill = 'white';
    expect($el.style.background).to.be.eqls('white');

    html.style.stroke = 'red';
    html.style.lineWidth = 10;
    expect($el.style.borderColor).to.be.eqls('red');
    expect($el.style.borderStyle).to.be.eqls('solid');
    expect($el.style.borderWidth).to.be.eqls('10px');

    html.style.lineDash = [2];
    expect($el.style.borderStyle).to.be.eqls('dashed');

    html.style.zIndex = 10;
    expect($el.style.zIndex).to.be.eqls('10');

    expect(html.getBoundingClientRect().x).to.be.eqls(208);
    expect(html.getBoundingClientRect().y).to.be.eqls(208);

    expect(html.getClientRects()[0].x).to.be.eqls(208);
    expect(html.getClientRects()[0].y).to.be.eqls(208);

    expect(html.getBounds().halfExtents[0]).to.be.eqls(30);
    expect(html.getBounds().halfExtents[1]).to.be.eqls(30);
    expect(html.getBounds().center[0]).to.be.eqls(230);
    expect(html.getBounds().center[1]).to.be.eqls(230);

    expect(html.getLocalBounds().halfExtents[0]).to.be.eqls(30);
    expect(html.getLocalBounds().halfExtents[1]).to.be.eqls(30);
    expect(html.getLocalBounds().center[0]).to.be.eqls(230);
    expect(html.getLocalBounds().center[1]).to.be.eqls(230);
  });
});
