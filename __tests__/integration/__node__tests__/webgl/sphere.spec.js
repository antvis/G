const fs = require('fs');
const { createCanvas } = require('canvas');
const { Canvas, Rectangle } = require('@antv/g');
const { Renderer } = require('@antv/g-webgl');
const {
  MeshPhongMaterial,
  SphereGeometry,
  AmbientLight,
  DirectionalLight,
  Mesh,
  Plugin,
} = require('@antv/g-plugin-3d');
const { createPNGFromRawdata, sleep, diff } = require('../../util');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer({
  targets: ['webgl1'],
  enableFXAA: false,
});
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);
renderer.registerPlugin(new Plugin());

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

const RESULT_IMAGE = '/sphere.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Sphere> with g-webgl', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render sphere on server-side correctly.', async () => {
    await canvas.ready;

    canvas.getCamera().rotate(30, 30, 30);

    // use GPU device
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // create a sphere geometry
    const sphereGeometry = new SphereGeometry(device, {
      radius: 50,
      latitudeBands: 32,
      longitudeBands: 32,
    });
    // create a material with Phong lighting model
    const basicMaterial = new MeshPhongMaterial(device, {
      shininess: 10,
    });
    const sphere = new Mesh({
      style: {
        x: 100,
        y: 100,
        z: 0,
        fill: '#1890FF',
        opacity: 1,
        geometry: sphereGeometry,
        material: basicMaterial,
      },
    });
    canvas.appendChild(sphere);

    const light = new DirectionalLight({
      style: {
        fill: 'white',
        direction: [-1, 0, 1],
      },
    });
    canvas.appendChild(light);

    const ambientLight = new AmbientLight({
      style: {
        fill: '#000',
      },
    });
    canvas.appendChild(ambientLight);

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
