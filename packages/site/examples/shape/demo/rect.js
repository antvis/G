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
  width: 300,
  height: 200,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  lineDash: 0,
  lineDashOffset: 0,
  radius: 8,
  fillOpacity: 1,
  strokeOpacity: 1,
};
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

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  x: 200,
  y: 100,
  scale: 1,
  transformOrigin: 'left top',
  eulerAngles: 0,
};
transformFolder
  .add(transformConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    rect.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'x', 0, 400).onChange((x) => {
  rect.setLocalPosition(x, rect.style.y);
  // or
  // rect.style.x = x;
});
transformFolder.add(transformConfig, 'y', 0, 400).onChange((y) => {
  rect.setLocalPosition(rect.style.x, y);
  // or
  // rect.style.y = y;
});
transformFolder.add(transformConfig, 'scale', 0.2, 5).onChange((scaling) => {
  rect.setLocalScale(scaling);
});
transformFolder.add(transformConfig, 'eulerAngles', 0, 360).onChange((eulerAngles) => {
  rect.setLocalEulerAngles(eulerAngles);
});
transformFolder.open();
