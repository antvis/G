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
const { Ellipse, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/ellipse.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Ellipse> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render ellipse on server-side correctly.', async () => {
    await canvas.ready;
    const ellipse1 = new Ellipse({
      style: {
        cx: 20,
        cy: 20,
        rx: 10,
        ry: 20,
        fill: 'red',
      },
    });
    canvas.appendChild(ellipse1);

    const ellipse2 = ellipse1.cloneNode();
    ellipse2.style.stroke = 'green';
    ellipse2.style.lineWidth = '2px';
    ellipse2.setPosition(40, 20);
    canvas.appendChild(ellipse2);

    // transparent
    const ellipse3 = ellipse2.cloneNode();
    ellipse3.style.fill = 'transparent';
    ellipse3.setPosition(60, 20);
    canvas.appendChild(ellipse3);

    // none fill
    const ellipse4 = ellipse2.cloneNode();
    ellipse4.style.fill = 'none';
    ellipse4.setPosition(80, 20);
    canvas.appendChild(ellipse4);

    // dashed
    const ellipse5 = ellipse2.cloneNode();
    ellipse5.style.lineDash = [2, 2];
    ellipse5.setPosition(100, 20);
    canvas.appendChild(ellipse5);

    // dashed with offset
    const ellipse6 = ellipse2.cloneNode();
    ellipse6.style.lineDash = [2, 2];
    ellipse6.style.lineDashOffset = 2;
    ellipse6.setPosition(120, 20);
    canvas.appendChild(ellipse6);

    const ellipse7 = ellipse1.cloneNode();
    ellipse7.style.opacity = 0.5;
    ellipse7.setPosition(140, 20);
    canvas.appendChild(ellipse7);

    // with shadow
    const ellipse8 = ellipse1.cloneNode();
    ellipse8.style.r = 20;
    ellipse8.style.shadowBlur = 10;
    ellipse8.style.shadowColor = 'blue';
    ellipse8.setPosition(20, 60);
    canvas.appendChild(ellipse8);

    // with gradient
    const ellipse9 = ellipse1.cloneNode();
    ellipse9.style.fill = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
    ellipse9.setPosition(60, 60);
    canvas.appendChild(ellipse9);

    const ellipse10 = ellipse1.cloneNode();
    ellipse10.style.fill = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
    ellipse10.setPosition(100, 60);
    canvas.appendChild(ellipse10);

    // transform
    const ellipse11 = ellipse1.cloneNode();
    ellipse11.scaleLocal(2);
    ellipse11.setPosition(140, 100);
    canvas.appendChild(ellipse11);

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
