import { Canvas, CanvasEvent, Rect } from '@antv/g';
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
  width: 500,
  height: 500,
  renderer: canvasRenderer,
});
const camera = canvas.getCamera();
camera.setZoom(0.1);

const rect = new Rect({
  style: {
    x: 250,
    y: 250,
    width: 2000,
    height: 2000,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const culledRect = new Rect({
  style: {
    x: 250 - 2500,
    y: 250 - 2500,
    width: 2000,
    height: 2000,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(rect);
  canvas.appendChild(culledRect);
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

const cameraFolder = gui.addFolder('camera actions');
const cameraConfig = {
  panX: 0,
  panY: 0,
  zoom: 0.1,
  roll: 0,
};
const printVisibility = () => {
  console.log("rect1's visibility:", rect.isVisible() ? 'visible' : 'hidden');
  console.log(
    "rect2's visibility:",
    culledRect.isVisible() ? 'visible' : 'hidden',
  );
};

const origin = camera.getPosition();
cameraFolder.add(cameraConfig, 'panX', -3000, 3000).onChange((panX) => {
  const current = camera.getPosition();
  camera.pan(origin[0] + panX - current[0], 0);
  printVisibility();
});
cameraFolder.add(cameraConfig, 'panY', -3000, 3000).onChange((panY) => {
  const current = camera.getPosition();
  camera.pan(0, origin[1] + panY - current[1]);
  printVisibility();
});
cameraFolder.add(cameraConfig, 'roll', -90, 90).onChange((roll) => {
  camera.rotate(0, 0, roll);
  printVisibility();
});
cameraFolder.add(cameraConfig, 'zoom', 0, 1).onChange((zoom) => {
  camera.setZoom(zoom);
  printVisibility();
});
cameraFolder.open();
