const { createCanvas } = require('canvas');
const fs = require('fs');
const { Polygon, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/polygon.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Polygon> with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
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
