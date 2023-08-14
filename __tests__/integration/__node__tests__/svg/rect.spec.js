const util = require('util');
// ref: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// ref: https://github.com/jsdom/jsdom/issues/2524
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: util.TextEncoder,
});
Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: util.TextDecoder,
});

const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Rect, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-svg');
const { sleep } = require('../../util');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const dom = new JSDOM(`
<div id="container">
</div>
`);

const SIZE = 200;
const canvas = new Canvas({
  container: 'container',
  width: SIZE,
  height: SIZE,
  renderer,
  document: dom.window.document,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

const RESULT_IMAGE = '/rect.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Rect> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render rect on server-side correctly.', async () => {
    await canvas.ready;
    const rect1 = new Rect({
      style: {
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        fill: 'red',
      },
    });
    canvas.appendChild(rect1);

    const rect2 = rect1.cloneNode();
    rect2.style.stroke = 'green';
    rect2.style.lineWidth = '2px';
    rect2.translate(30, 0);
    canvas.appendChild(rect2);

    const rect3 = rect2.cloneNode();
    rect3.style.fill = 'transparent';
    rect3.translate(30, 0);
    canvas.appendChild(rect3);

    // none fill
    const rect4 = rect2.cloneNode();
    rect4.style.fill = 'none';
    rect4.translate(60, 0);
    canvas.appendChild(rect4);

    // dashed
    const rect5 = rect2.cloneNode();
    rect5.style.lineDash = [2, 2];
    rect5.translate(90, 0);
    canvas.appendChild(rect5);

    const rect6 = rect2.cloneNode();
    rect6.style.opacity = 0.5;
    rect6.translate(120, 0);
    canvas.appendChild(rect6);

    // with shadow
    const rect7 = rect2.cloneNode();
    rect7.style.shadowBlur = 10;
    rect7.style.shadowColor = 'blue';
    rect7.setPosition(10, 60);
    canvas.appendChild(rect7);

    // with gradient
    const rect8 = rect2.cloneNode();
    rect8.style.fill = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
    rect8.setPosition(40, 60);
    canvas.appendChild(rect8);
    const rect9 = rect2.cloneNode();
    rect9.style.fill = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
    rect9.setPosition(70, 60);
    canvas.appendChild(rect9);

    // rounded rect
    const rect10 = rect2.cloneNode();
    rect10.style.radius = 5;
    rect10.setPosition(100, 60);
    canvas.appendChild(rect10);

    // rotated rect
    const rect11 = rect2.cloneNode();
    rect11.setPosition(150, 60);
    rect11.rotateLocal(45);
    canvas.appendChild(rect11);

    // with transform-origin
    const rect12 = rect2.cloneNode();
    rect12.style.transformOrigin = 'center';
    rect12.setPosition(150, 60);
    rect12.rotateLocal(45);
    canvas.appendChild(rect12);

    await sleep(120);

    // fs.writeFileSync(
    //   __dirname + RESULT_IMAGE,
    //   xmlserializer.serializeToString(
    //     dom.window.document.getElementById('container').children[0],
    //   ),
    // );

    const snapshot = fs.readFileSync(
      __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      {
        encoding: 'utf8',
        flag: 'r',
      },
    );

    expect(
      xmlserializer.serializeToString(
        dom.window.document.getElementById('container').children[0],
      ),
    ).toBe(snapshot);
  });
});
