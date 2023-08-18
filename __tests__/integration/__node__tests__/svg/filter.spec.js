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
const { Circle, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/filter.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render filters with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render filter on server-side correctly.', async () => {
    await canvas.ready;
    const circle1 = new Circle({
      style: {
        cx: 20,
        cy: 20,
        r: 20,
        fill: '#1890FF',
      },
    });
    await canvas.ready;
    canvas.appendChild(circle1);

    const circle2 = circle1.cloneNode();
    circle2.style.filter = 'blur(2px)';
    circle2.setPosition(60, 20);
    canvas.appendChild(circle2);

    const circle3 = circle1.cloneNode();
    circle3.style.filter = 'brightness(2)';
    circle3.setPosition(100, 20);
    canvas.appendChild(circle3);

    const circle4 = circle1.cloneNode();
    circle4.style.filter = 'drop-shadow(6px 6px 10px black)';
    circle4.setPosition(140, 20);
    canvas.appendChild(circle4);

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
