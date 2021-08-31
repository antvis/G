import { Path, Canvas } from '@antv/g';
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

const path = new Path({
  style: {
    stroke: 'black',
    path:
      'M 100,300' +
      'l 50,-25' +
      'a25,25 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,50 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,75 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,100 -30 0,1 50,-25' +
      'l 50,-25' +
      'l 0, 200,' +
      'z',
  },
});
canvas.appendChild(path);

const length = path.getTotalLength();
path.animate([{ lineDash: [0, length] }, { lineDash: [length, 0] }], {
  duration: 3500,
  easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  iterations: Infinity,
  direction: 'alternate',
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
canvas.on('afterRender', () => {
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
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
