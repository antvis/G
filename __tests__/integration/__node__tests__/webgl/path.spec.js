const fs = require('fs');
const { createCanvas } = require('canvas');
const { Path, Canvas, Rectangle } = require('@antv/g');
const { Renderer } = require('@antv/g-webgl');
const { createPNGFromRawdata, sleep, diff } = require('../../util');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer({
  targets: ['webgl1'],
  enableFXAA: false,
});
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const width = 200;
const height = 200;
const gl = require('gl')(width, height, {
  antialias: false,
  preserveDrawingBuffer: true,
  stencil: true,
});
const mockCanvas = {
  width,
  height,
  getContext: () => {
    gl.canvas = mockCanvas;
    // 模拟 DOM API，返回小程序 context，它应当和 CanvasRenderingContext2D 一致
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
    return gl;
  },
  getBoundingClientRect: () => {
    // 模拟 DOM API，返回小程序 context 相对于视口的位置
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
    return new Rectangle(0, 0, width, height);
  },
};

// create a node-canvas
const offscreenNodeCanvas = createCanvas(1, 1);
const canvas = new Canvas({
  width,
  height,
  canvas: mockCanvas, // use headless-gl
  renderer,
  offscreenCanvas: offscreenNodeCanvas,
});

const RESULT_IMAGE = '/path.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Path> with g-webgl', () => {
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

    const path4 = new Path({
      style: {
        path: [['M', -6, -6], ['L', 6, -6], ['L', 6, 6], ['L', -6, 6], ['Z']],
        lineWidth: 0,
        fill: '#5AD8A6',
        fillOpacity: 1,
        stroke: '',
        visibility: 'visible',
      },
    });
    path4.translate(100, 100);
    path4.scale(2);
    canvas.appendChild(path4);

    await sleep(200);

    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    await createPNGFromRawdata(__dirname + RESULT_IMAGE, width, height, pixels);

    expect(
      diff(
        __dirname + RESULT_IMAGE,
        __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      ),
    ).toBeLessThan(50);
  });
});
