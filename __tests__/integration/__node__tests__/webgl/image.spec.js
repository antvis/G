const fs = require('fs');
const { createCanvas, Image: CanvasImage, loadImage } = require('canvas');
const { Image, Canvas, Rectangle } = require('@antv/g');
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
  createImage: () => {
    const image = new CanvasImage();
    return image;
  },
});

const RESULT_IMAGE = '/image.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Image> with g-webgl', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render image on server-side correctly.', async () => {
    await canvas.ready;

    const src = await loadImage(__dirname + '/antv.png');

    // URL src
    const image = new Image({
      style: {
        width: 100,
        height: 100,
        src,
      },
    });
    canvas.appendChild(image);

    // <canvas> src
    const nodeCanvasSrc = createCanvas(50, 50);
    const context = nodeCanvasSrc.getContext('2d');
    context.fillStyle = 'red';
    context.fillRect(0, 0, 50, 50);
    const image2 = new Image({
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        src: nodeCanvasSrc,
      },
    });
    canvas.appendChild(image2);

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
