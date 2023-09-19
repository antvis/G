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

const { createCanvas } = require('canvas');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Line, Path, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-svg');
const { sleep } = require('../../util');
const { Arrow } = require('../../fixtures/Arrow');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const dom = new JSDOM(`
<div id="container">
</div>
`);

const SIZE = 200;

const offscreenNodeCanvas = createCanvas(1, 1);

const canvas = new Canvas({
  container: 'container',
  width: SIZE,
  height: SIZE,
  renderer,
  document: dom.window.document,
  offscreenCanvas: offscreenNodeCanvas,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

const RESULT_IMAGE = '/custom-element.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <CustomElement> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render custom-element on server-side correctly.', async () => {
    await canvas.ready;
    const lineArrow = new Arrow({
      id: 'lineArrow',
      style: {
        body: new Line({
          style: {
            x1: 100,
            y1: 100,
            x2: 0,
            y2: 0,
          },
        }),
        startHead: true,
        stroke: '#1890FF',
        lineWidth: 10,
        cursor: 'pointer',
      },
    });
    lineArrow.translate(50, 50);
    lineArrow.scale(0.5);
    canvas.appendChild(lineArrow);

    const pathArrow = new Arrow({
      id: 'pathArrow',
      style: {
        body: new Path({
          style: {
            path: 'M 100,100' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80',
          },
        }),
        startHead: true,
        stroke: '#1890FF',
        lineWidth: 10,
        cursor: 'pointer',
      },
    });
    pathArrow.translate(0, 50);
    pathArrow.scale(0.5);
    canvas.appendChild(pathArrow);

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
