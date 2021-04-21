import { Line, Canvas, RENDERER } from '@antv/g';
import '@antv/g-renderer-canvas';
import '@antv/g-renderer-webgl';
import '@antv/g-renderer-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: RENDERER.Canvas,
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
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: RENDERER.Canvas,
};
rendererFolder.add(rendererConfig, 'renderer', [RENDERER.Canvas, RENDERER.WebGL, RENDERER.SVG]).onChange((renderer) => {
  canvas.setConfig({
    renderer,
  });
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
