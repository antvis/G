const fs = require('fs');
const { createCanvas } = require('canvas');
const { Polygon, Canvas, Rectangle } = require('@antv/g');
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

const RESULT_IMAGE = '/polygon.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Polygon> with g-webgl', () => {
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
