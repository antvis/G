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
const { Line, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/line.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Line> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render line on server-side correctly.', async () => {
    await canvas.ready;
    const line = new Line({
      style: {
        x1: 10,
        y1: 10,
        x2: 10,
        y2: 30,
        stroke: 'red',
        lineWidth: 6,
      },
    });
    canvas.appendChild(line);

    // dashed
    const line2 = line.cloneNode();
    line2.style.lineDash = [2];
    line2.translate(30, 0);
    canvas.appendChild(line2);

    // lineCap
    const line3 = line.cloneNode();
    line3.style.lineCap = 'round';
    line3.translate(60, 0);
    canvas.appendChild(line3);
    const line4 = line.cloneNode();
    line4.style.lineCap = 'square';
    line4.translate(90, 0);
    canvas.appendChild(line4);

    // with gradient
    const line5 = line.cloneNode();
    line5.style.stroke = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
    line5.setPosition(120, 0);
    canvas.appendChild(line5);

    const line6 = line.cloneNode();
    line6.style.stroke = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
    line6.setPosition(150, 0);
    canvas.appendChild(line6);

    const line7 = line.cloneNode();
    line7.style.stroke = 'linear-gradient(90deg, blue, green 40%, red)';
    line7.setPosition(150, 0);
    canvas.appendChild(line7);

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
