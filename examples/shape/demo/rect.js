import { Rect, Canvas, RENDERER } from '@antv/g';
import '@antv/g-renderer-canvas';
import '@antv/g-renderer-webgl';
import '@antv/g-renderer-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: RENDERER.Canvas,
});

const rect = new Rect({
  attrs: {
    x: 200,
    y: 100,
    width: 300,
    height: 200,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
  },
});

canvas.appendChild(rect);

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

const rectFolder = gui.addFolder('rect');
const rectConfig = {
  x: 200,
  y: 100,
  width: 300,
  height: 200,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  radius: 8,
  fillOpacity: 1,
  strokeOpacity: 1,
};
rectFolder.add(rectConfig, 'x', 50, 200).onChange((x) => {
  rect.attr('x', x);
});
rectFolder.add(rectConfig, 'y', 50, 200).onChange((y) => {
  rect.attr('y', y);
});
rectFolder.add(rectConfig, 'width', 50, 400).onChange((width) => {
  rect.attr('width', width);
});
rectFolder.add(rectConfig, 'height', 50, 400).onChange((height) => {
  rect.attr('height', height);
});
rectFolder.addColor(rectConfig, 'fill').onChange((color) => {
  rect.attr('fill', color);
});
rectFolder.addColor(rectConfig, 'stroke').onChange((color) => {
  rect.attr('stroke', color);
});
rectFolder.add(rectConfig, 'radius', 0, 20).onChange((radius) => {
  rect.attr('radius', radius);
});
rectFolder.add(rectConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  rect.attr('lineWidth', lineWidth);
});
rectFolder.add(rectConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  rect.attr('fillOpacity', opacity);
});
rectFolder.add(rectConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  rect.attr('strokeOpacity', opacity);
});
rectFolder.open();
