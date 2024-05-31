import { Canvas, CanvasEvent, Path } from '@antv/g';
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
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const line = new Path({
  style: {
    d: [
      ['M', 100, 100],
      ['L', 200, 100],
    ],
    stroke: '#F04864',
    lineDash: [10],
  },
});

const polyline = new Path({
  style: {
    d: [
      ['M', 57.06339097770921, -18.541019662496844],
      ['L', 13.225168176580645, -18.202882373436317],
      ['L', 3.67394039744206e-15, -60],
      ['L', -13.225168176580643, -18.202882373436317],
      ['L', -57.06339097770921, -18.54101966249685],
      ['L', -21.398771616640953, 6.952882373436324],
      ['L', -35.267115137548394, 48.54101966249684],
      ['L', -4.133182947122317e-15, 22.5],
      ['L', 35.26711513754837, 48.54101966249685],
      ['L', 21.398771616640953, 6.952882373436322],
      ['Z'],
    ],
    stroke: '#1890FF',
    lineWidth: 1,
  },
});
polyline.translate(100, 250);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(line);
  canvas.appendChild(polyline);
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
