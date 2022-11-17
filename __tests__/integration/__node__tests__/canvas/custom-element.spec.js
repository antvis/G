const { createCanvas } = require('canvas');
const fs = require('fs');
const { Line, Path, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');
const { sleep, diff } = require('../../util');
const { Arrow } = require('../../fixtures/Arrow');

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

const RESULT_IMAGE = '/custom-element.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <CustomElement> with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render image on server-side correctly.', async () => {
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

    await sleep(300);

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
