const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { Circle, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');
const { sleep, diff } = require('../../util');

// create a node-canvas
const nodeCanvas = createCanvas(200, 200);

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const SIZE = 200;
const canvas = new Canvas({
  width: SIZE,
  height: SIZE,
  canvas: nodeCanvas, // use node-canvas
  renderer,
});

const RESULT_IMAGE = '/filter.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render filters with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render filter on server-side correctly.', async () => {
    const circle1 = new Circle({
      style: {
        cx: 20,
        cy: 20,
        r: 20,
        fill: 'red',
      },
    });
    await canvas.ready;
    canvas.appendChild(circle1);

    // FIXME: filter is not supported in node-canvas
    const circle2 = circle1.cloneNode();
    circle2.style.filter = 'blur(15px)';
    circle2.setPosition(60, 20);
    canvas.appendChild(circle2);

    await sleep(200);

    await new Promise((resolve) => {
      const out = fs.createWriteStream(__dirname + RESULT_IMAGE);
      const stream = nodeCanvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        resolve(undefined);
      });
    });

    expect(
      diff(
        __dirname + RESULT_IMAGE,
        __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      ),
    ).toBe(0);
  });
});
