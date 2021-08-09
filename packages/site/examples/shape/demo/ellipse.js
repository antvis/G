import { Ellipse, Canvas } from '@antv/g';
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

const ellipse = new Ellipse({
  style: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(ellipse);

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

const ellipseFolder = gui.addFolder('ellipse');
const ellipseConfig = {
  rx: 100,
  ry: 150,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
  anchorX: 0.5,
  anchorY: 0.5,
};
ellipseFolder.add(ellipseConfig, 'rx', 50, 200).onChange((radius) => {
  ellipse.attr('rx', radius);
});
ellipseFolder.add(ellipseConfig, 'ry', 50, 200).onChange((radius) => {
  ellipse.attr('ry', radius);
});
ellipseFolder.add(ellipseConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  ellipse.attr('anchor', [anchorX, ellipseConfig.anchorY]);
});
ellipseFolder.add(ellipseConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  ellipse.attr('anchor', [ellipseConfig.anchorX, anchorY]);
});
ellipseFolder.addColor(ellipseConfig, 'fill').onChange((color) => {
  ellipse.attr('fill', color);
});
ellipseFolder.addColor(ellipseConfig, 'stroke').onChange((color) => {
  ellipse.attr('stroke', color);
});
ellipseFolder.add(ellipseConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  ellipse.attr('lineWidth', lineWidth);
});
ellipseFolder.add(ellipseConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  ellipse.attr('fillOpacity', opacity);
});
ellipseFolder.add(ellipseConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  ellipse.attr('strokeOpacity', opacity);
});
ellipseFolder.open();
