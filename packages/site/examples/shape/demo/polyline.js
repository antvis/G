import { Polyline, Canvas } from '@antv/g';
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
const polyline = new Polyline({
  attrs: {
    points: [
      [50, 50],
      [100, 50],
      [100, 100],
      [150, 100],
      [150, 150],
      [200, 150],
      [200, 200],
      [250, 200],
      [250, 250],
      [300, 250],
      [300, 300],
      [350, 300],
      [350, 350],
      [400, 350],
      [400, 400],
      [450, 400],
    ],
    stroke: '#1890FF',
    lineWidth: 2,
  },
});

canvas.appendChild(polyline);

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

const lineFolder = gui.addFolder('polyline');
const lineConfig = {
  stroke: '#1890FF',
  lineWidth: 2,
  lineJoin: 'miter',
  lineCap: 'butt',
  strokeOpacity: 1,
};
lineFolder.addColor(lineConfig, 'stroke').onChange((color) => {
  polyline.attr('stroke', color);
});
lineFolder.add(lineConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  polyline.attr('lineWidth', lineWidth);
});
lineFolder.add(lineConfig, 'lineJoin', ['miter', 'round', 'bevel']).onChange((lineJoin) => {
  polyline.attr('lineJoin', lineJoin);
});
lineFolder.add(lineConfig, 'lineCap', ['butt', 'round', 'square']).onChange((lineCap) => {
  polyline.attr('lineCap', lineCap);
});
lineFolder.add(lineConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  polyline.attr('strokeOpacity', opacity);
});
lineFolder.open();
