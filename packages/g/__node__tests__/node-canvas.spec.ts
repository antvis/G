const sleep = (n) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, n);
  });
};

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { Group, Circle, Canvas, Rect, ElementEvent } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');

// create a node-canvas
const nodeCanvas = createCanvas(200, 200);

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const canvas = new Canvas({
  width: 200,
  height: 200,
  canvas: nodeCanvas, // use node-canvas
  renderer,
});

describe('Node Canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render on node correctly.', async () => {
    const circle = new Circle({
      style: {
        x: 100,
        y: 100,
        r: 100,
        fill: 'red',
      },
    });
    canvas.appendChild(circle);

    await sleep(200);

    await new Promise((resolve) => {
      const out = fs.createWriteStream(__dirname + '/test.png');
      const stream = nodeCanvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        resolve(undefined);
      });
    });
  });
});
