import { Ellipse, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const camera = canvas.getCamera();

const ellipse = new Ellipse({
  attrs: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(ellipse);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('postrender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setConfig({
    renderer: renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  });
});
rendererFolder.open();

const cameraFolder = gui.addFolder('orthographic projection');
const cameraConfig = {
  left: 0,
  right: 600,
  top: 0,
  bottom: 500,
  zoom: 1,
  rotate: () => {
    camera.rotate(10, 0, 0);
  },
  pan: () => {
    camera.pan(10, 0, 0);
  },
};
cameraFolder.add(cameraConfig, 'left', 0, 600).onChange((left) => {
  camera.setOrthographic(left, cameraConfig.right, cameraConfig.top, cameraConfig.bottom, -1, 1);
});
cameraFolder.add(cameraConfig, 'top', 0, 500).onChange((top) => {
  camera.setOrthographic(cameraConfig.left, cameraConfig.right, top, cameraConfig.bottom, -1, 1);
});
cameraFolder.add(cameraConfig, 'zoom', 0, 10).onChange((zoom) => {
  camera.setZoom(zoom);
});
cameraFolder.add(cameraConfig, 'rotate');
cameraFolder.add(cameraConfig, 'pan');
cameraFolder.open();
