import { Line, Canvas } from '@antv/g';
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

// create a line
const line1 = new Line({
  attrs: {
    x1: 200,
    y1: 100,
    x2: 400,
    y2: 100,
    stroke: '#1890FF',
    lineWidth: 2,
  },
});
const line2 = new Line({
  attrs: {
    x1: 200,
    y1: 150,
    x2: 400,
    y2: 150,
    lineWidth: 2,
    lineDash: [10, 10],
    stroke: '#F04864',
  },
});

canvas.appendChild(line1);
canvas.appendChild(line2);

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

const lineFolder = gui.addFolder('line1');
const lineConfig = {
  stroke: '#1890FF',
  lineWidth: 2,
  strokeOpacity: 1,
};
lineFolder.addColor(lineConfig, 'stroke').onChange((color) => {
  line1.attr('stroke', color);
});
lineFolder.add(lineConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  line1.attr('lineWidth', lineWidth);
});
lineFolder.add(lineConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  line1.attr('strokeOpacity', opacity);
});
lineFolder.open();
