const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { Rect, Circle, Canvas, Group } = require('@antv/g');
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

const RESULT_IMAGE = '/clippath.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render ClipPath with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render clippath on server-side correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 50,
        cy: 50,
        r: 50,
        fill: 'red',
        clipPath: new Rect({
          // basic graphic as clippath
          style: {
            width: 50,
            height: 50,
          },
        }),
      },
    });

    // nested group
    const group = new Group({
      style: {
        x: 100,
        y: 0,
        clipPath: new Rect({
          // basic graphic as clippath
          style: {
            x: 100,
            y: 0,
            width: 50,
            height: 50,
          },
        }),
      },
    });
    const circle2 = new Circle({
      style: {
        cx: 50,
        cy: 50,
        r: 50,
        fill: 'blue',
      },
    });
    group.appendChild(circle2);

    // nested group
    const group2 = new Group({
      style: {
        x: 50,
        y: 100,
        clipPath: new Rect({
          // basic graphic as clippath
          style: {
            x: 50,
            y: 100,
            width: 50,
            height: 50,
          },
        }),
      },
    });
    const group3 = new Group();
    const circle3 = new Circle({
      style: {
        cx: 50,
        cy: 50,
        r: 50,
        fill: 'green',
      },
    });
    group2.appendChild(group3);
    group3.appendChild(circle3);

    // clip with connected shape
    const clipPathCircle = new Circle({
      style: {
        cx: 150,
        cy: 150,
        r: 50,
        fill: 'yellow',
      },
    });
    const rect = new Rect({
      style: {
        x: 150,
        y: 100,
        width: 50,
        height: 50,
        fill: 'cyan',
      },
    });
    rect.style.clipPath = clipPathCircle;

    await canvas.ready;
    canvas.appendChild(circle);
    canvas.appendChild(group);
    canvas.appendChild(group2);
    canvas.appendChild(clipPathCircle);
    canvas.appendChild(rect);

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
