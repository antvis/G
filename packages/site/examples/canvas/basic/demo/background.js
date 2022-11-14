import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// set container's background
const $wrapper = document.getElementById('container');
$wrapper.style.background = 'grey';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
  background: 'rgba(255, 0, 0, 0.5)',
});

// create a circle
const circle = new Circle({
  style: {
    cx: 300,
    cy: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a circle to canvas
  canvas.appendChild(circle);
});

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl'])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'canvas') {
      renderer = canvasRenderer;
    } else if (rendererName === 'svg') {
      renderer = svgRenderer;
    } else if (rendererName === 'webgl') {
      renderer = webglRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
};
circleFolder.add(circleConfig, 'r', 50, 200).onChange((r) => {
  circle.style.r = r;
});
