const { createCanvas } = require('canvas');
const fs = require('fs');
const { Path, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/path.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Path> with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render path on server-side correctly.', async () => {
    await canvas.ready;
    const path = new Path({
      style: {
        path: 'M10,10 L30,30 L10, 30',
        stroke: 'red',
        lineWidth: 6,
      },
    });
    canvas.appendChild(path);

    // dashed
    const polyline2 = path.cloneNode();
    polyline2.style.lineDash = [2];
    polyline2.translate(30, 0);
    canvas.appendChild(polyline2);

    // lineCap
    const polyline3 = path.cloneNode();
    polyline3.style.lineCap = 'round';
    polyline3.translate(60, 0);
    canvas.appendChild(polyline3);
    const polyline4 = path.cloneNode();
    polyline4.style.lineCap = 'square';
    polyline4.translate(90, 0);
    canvas.appendChild(polyline4);

    // lineJoin
    const polyline5 = path.cloneNode();
    polyline5.style.lineJoin = 'round';
    polyline5.translate(120, 0);
    canvas.appendChild(polyline5);

    const polyline6 = path.cloneNode();
    polyline6.style.lineJoin = 'miter'; // "bevel" | "miter" | "round";
    polyline6.translate(150, 0);
    canvas.appendChild(polyline6);

    const path2 = new Path({
      style: {
        path:
          'M 100,300' +
          'l 50,-25' +
          'a25,25 -30 0,1 50,-25' +
          'l 50,-25' +
          'a25,50 -30 0,1 50,-25' +
          'l 50,-25' +
          'a25,75 -30 0,1 50,-25' +
          'l 50,-25' +
          'a25,100 -30 0,1 50,-25' +
          'l 50,-25' +
          'l 0, 200,' +
          'z',
        lineWidth: 10,
        lineJoin: 'round',
        stroke: '#54BECC',
      },
    });
    canvas.appendChild(path2);
    path2.scale(0.2);
    path2.translateLocal(-100, 20);

    // Bezier
    const path3 = new Path({
      style: {
        lineWidth: 1,
        stroke: '#54BECC',
        transform: 'scale(0.6) translate(0, 100px)',
        path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
      },
    });
    canvas.appendChild(path3);

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
