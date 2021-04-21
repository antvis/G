import { Polygon, Canvas, RENDERER } from '@antv/g';
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

// create a polygon
const polygon = new Polygon({
  attrs: {
    points: [
      [200, 100],
      [400, 100],
      [400 + 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
      [400, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200 - 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
    ],
    stroke: '#1890FF',
    lineWidth: 2,
  },
});

// add a polygon to canvas
canvas.appendChild(polygon);

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

const polygonFolder = gui.addFolder('polygon');
const polygonConfig = {
  fill: '#fff',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
};
polygonFolder.addColor(polygonConfig, 'fill').onChange((color) => {
  polygon.attr('fill', color);
});
polygonFolder.addColor(polygonConfig, 'stroke').onChange((color) => {
  polygon.attr('stroke', color);
});
polygonFolder.add(polygonConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  polygon.attr('lineWidth', lineWidth);
});
polygonFolder.add(polygonConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  polygon.attr('fillOpacity', opacity);
});
polygonFolder.add(polygonConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  polygon.attr('strokeOpacity', opacity);
});
polygonFolder.open();
