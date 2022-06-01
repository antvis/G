import { Canvas, CanvasEvent, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
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
  renderer: svgRenderer,
});

const rect = new Rect({
  style: {
    x: 100,
    y: 200,
    width: 50,
    height: 100,
    fill: '#1890FF',
  },
});
const rect2 = new Rect({
  style: {
    x: 200,
    y: 200,
    width: 50,
    height: 100,
    fill: '#1890FF',
  },
});
const rect3 = new Rect({
  style: {
    x: 300,
    y: 200,
    width: 50,
    height: 100,
    fill: '#1890FF',
  },
});

canvas.appendChild(rect);
canvas.appendChild(rect2);
canvas.appendChild(rect3);

rect.animate([{ transform: 'scale(0.0001, 1)' }, { transform: 'scale(1, 1)' }], {
  duration: 1000,
  //   delay: 0,
  fill: 'both',
});
rect2.animate([{ transform: 'scale(0.0001, 1)' }, { transform: 'scaleY(1)' }], {
  duration: 1000,
  delay: 1000,
  fill: 'both',
});
rect3.animate([{ transform: 'scale(0.0001, 1)' }, { transform: 'scale(1, 1)' }], {
  duration: 1000,
  delay: 2000,
  fill: 'both',
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
