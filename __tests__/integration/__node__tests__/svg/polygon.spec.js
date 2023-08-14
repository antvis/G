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
const { Polygon, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/polygon.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Polygon> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render polygon on server-side correctly.', async () => {
    await canvas.ready;
    const polygon = new Polygon({
      style: {
        points: [
          [10, 10],
          [10, 30],
          [30, 30],
        ],
        stroke: 'red',
        lineWidth: 6,
      },
    });
    canvas.appendChild(polygon);

    // dashed
    const polyline2 = polygon.cloneNode();
    polyline2.style.lineDash = [2];
    polyline2.translate(30, 0);
    canvas.appendChild(polyline2);

    // lineCap
    const polyline3 = polygon.cloneNode();
    polyline3.style.lineCap = 'round';
    polyline3.translate(60, 0);
    canvas.appendChild(polyline3);
    const polyline4 = polygon.cloneNode();
    polyline4.style.lineCap = 'square';
    polyline4.translate(90, 0);
    canvas.appendChild(polyline4);

    // lineJoin
    const polyline5 = polygon.cloneNode();
    polyline5.style.lineJoin = 'round';
    polyline5.translate(120, 0);
    canvas.appendChild(polyline5);

    const polyline6 = polygon.cloneNode();
    polyline6.style.lineJoin = 'miter'; // "bevel" | "miter" | "round";
    polyline6.translate(150, 0);
    canvas.appendChild(polyline6);

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
