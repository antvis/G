import { Canvas, CanvasEvent, Line, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// create a line
const line1 = new Line({
  style: {
    x1: 200,
    y1: 100,
    x2: 400,
    y2: 100,
    stroke: '#1890FF',
    lineWidth: 0.1,
    cursor: 'pointer',
  },
});
const line2 = line1.cloneNode();
const line3 = line1.cloneNode();
const line4 = line1.cloneNode();
line2.style.lineWidth = 0.5;
line3.style.lineWidth = 1;
line4.style.lineWidth = 2;
line2.translate(0, 50);
line3.translate(0, 100);
line4.translate(0, 150);

const path = new Path({
  style: {
    lineWidth: 0.5,
    stroke: '#54BECC',
    d: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
    transform: 'translate(100, 100)',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(line1);
  canvas.appendChild(line2);
  canvas.appendChild(line3);
  canvas.appendChild(line4);
  canvas.appendChild(path);
});

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};

rendererFolder
  .add(rendererConfig, 'renderer', [
    'canvas',
    'svg',
    'webgl',
    'webgpu',
    'canvaskit',
  ])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'canvas') {
      renderer = canvasRenderer;
    } else if (rendererName === 'svg') {
      renderer = svgRenderer;
    } else if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
