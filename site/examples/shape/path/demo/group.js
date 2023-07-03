import { Canvas, CanvasEvent, Group, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

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

const g = new Group({
  style: {
    transform: 'translate(200, 200) scale(0.5)',
  },
});
const p1 = new Path({
  style: {
    d: 'M1.2858791391047205e-14,-209.99999999999994A209.99999999999994,209.99999999999994,0,0,1,207.94618110413055,29.298221178223883L0,0Z',
    fill: 'red',
  },
});
const p2 = new Path({
  style: {
    d: 'M207.94618110413066,29.298221178223898A210.00000000000006,210.00000000000006,0,0,1,137.74500635698746,158.512817222184L0,0Z',
    fill: 'green',
  },
});
const p3 = new Path({
  style: {
    d: 'M137.7450063569874,158.51281722218394A209.99999999999997,209.99999999999997,0,0,1,-6.530971076665772,209.89841928131747L0,0Z',
    fill: 'blue',
  },
});
const p4 = new Path({
  style: {
    d: 'M-6.530971076665824,209.8984192813175A210,210,0,0,1,-168.7343604741219,-125.01486149809983L0,0Z',
    fill: 'yellow',
  },
});
const p5 = new Path({
  style: {
    d: 'M-168.7343604741219,-125.01486149809983A210,210,0,0,1,-3.377057564320937e-14,-210L0,0Z',
    fill: 'black',
  },
});
g.appendChild(p1);
g.appendChild(p2);
g.appendChild(p3);
g.appendChild(p4);
g.appendChild(p5);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(g);
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
