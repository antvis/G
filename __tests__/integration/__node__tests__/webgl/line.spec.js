const fs = require('fs');
const { createCanvas } = require('canvas');
const { Line, Canvas, Rectangle } = require('@antv/g');
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

const RESULT_IMAGE = '/line.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Line> with g-webgl', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
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
    line7.setPosition(180, 0);
    canvas.appendChild(line7);

    // lineWidth less than 1px
    const line8 = line.cloneNode();
    line8.style.lineWidth = 0.5;
    line8.setPosition(10, 80);
    canvas.appendChild(line8);

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
