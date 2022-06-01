import { Canvas, CanvasEvent, Circle } from '@antv/g';
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
  renderer: canvasRenderer,
});
const camera = canvas.getCamera();

for (let i = 0; i < 1000; i++) {
  const circle = new Circle({
    style: {
      cx: Math.random() * 600,
      cy: Math.random() * 500,
      r: 20 + Math.random() * 10,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  canvas.appendChild(circle);

  circle.on('mouseenter', () => {
    circle.attr('fill', '#2FC25B');
  });

  circle.on('mouseleave', () => {
    circle.attr('fill', '#1890FF');
  });
}

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

  camera.rotate(0, 0, 0.1);

  console.log(canvas.getStats());
});

// GUI
let currentRenderer = canvasRenderer;
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  currentRenderer =
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer;
  canvas.setRenderer(currentRenderer);
});
rendererFolder.open();

const folder0 = gui.addFolder('dirty rectangle');
const dirtyRectangleConfig = {
  enable: true,
};
folder0.add(dirtyRectangleConfig, 'enable').onChange((enable) => {
  currentRenderer.setConfig({
    enableDirtyRectangleRendering: enable,
  });
});
folder0.open();
