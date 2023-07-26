const fs = require('fs');
const { createCanvas } = require('canvas');
const { Circle, Canvas, Line, Polyline, Polygon, Path } = require('@antv/g');
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

const RESULT_IMAGE = '/marker.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render markers with g-webgl', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render marker on server-side correctly.', async () => {
    await canvas.ready;

    const circle = new Circle({
      style: {
        r: 5,
        fill: 'red',
      },
    });

    const line = new Line({
      style: {
        x1: 20,
        y1: 20,
        x2: 60,
        y2: 20,
        stroke: 'blue',
        markerEnd: circle,
        markerStart: circle,
      },
    });

    const polyline = new Polyline({
      style: {
        points: [
          [100, 20],
          [160, 20],
          [160, 40],
          [100, 40],
        ],
        stroke: 'blue',
        markerEnd: circle,
        markerStart: circle,
        markerMid: circle,
      },
    });
    const polyline2 = polyline.cloneNode(true);
    polyline2.style.points = [
      [100, 70],
      [160, 70],
      [160, 90],
      [100, 90],
    ];
    polyline2.style.markerStartOffset = 20;
    // FIXME: should be removed
    polyline2.style.markerMid = circle;

    const polygon = new Polygon({
      style: {
        points: [
          [100, 120],
          [160, 120],
          [160, 140],
        ],
        stroke: 'blue',
        markerEnd: circle,
        markerStart: circle,
        markerMid: circle,
      },
    });

    const path = new Path({
      style: {
        d: 'M20 120 L60 120',
        stroke: 'blue',
        markerEnd: circle,
        markerStart: circle,
        markerMid: circle,
      },
    });
    const path2 = path.cloneNode(true);
    path2.style.transform = 'translateY(50)';
    path2.style.markerEndOffset = 20;

    canvas.appendChild(line);

    // use marker end offset
    const line2 = line.cloneNode(true);
    line2.translateLocal(0, 20);
    canvas.appendChild(line2);
    line2.style.markerEndOffset = -20;

    // use marker start offset
    const line3 = line.cloneNode(true);
    line3.translateLocal(0, 40);
    canvas.appendChild(line3);
    line3.style.markerStartOffset = 20;

    // clear marker
    const line4 = line.cloneNode(true);
    line4.translateLocal(0, 60);
    canvas.appendChild(line4);
    line4.style.markerStart = null;
    line4.style.markerEnd = null;

    canvas.appendChild(polyline);
    canvas.appendChild(polyline2);
    canvas.appendChild(polygon);
    canvas.appendChild(path);
    canvas.appendChild(path2);

    await sleep(1000);

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
