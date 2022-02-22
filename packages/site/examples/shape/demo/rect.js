import { Rect, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
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

const rect = new Rect({
  style: {
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
canvas.on('afterrender', () => {
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

const rectFolder = gui.addFolder('rect');
const rectConfig = {
  x: 200,
  y: 100,
  width: 300,
  height: 200,
  anchorX: 0,
  anchorY: 0,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  lineDash: 0,
  lineDashOffset: 0,
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
rectFolder.add(rectConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  rect.attr('anchor', [anchorX, rectConfig.anchorY]);
});
rectFolder.add(rectConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  rect.attr('anchor', [rectConfig.anchorX, anchorY]);
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
rectFolder.add(rectConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  rect.style.lineDash = [lineDash];
});
rectFolder.add(rectConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  rect.style.lineDashOffset = lineDashOffset;
});
rectFolder.add(rectConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  rect.attr('fillOpacity', opacity);
});
rectFolder.add(rectConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  rect.attr('strokeOpacity', opacity);
});
rectFolder.open();
