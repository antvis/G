import { Polygon, Canvas } from '@antv/g';
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

// create a polygon
const polygon = new Polygon({
  style: {
    points: [
      [200, 100],
      [400, 100],
      [400 + 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
      [400, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200 - 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
    ],
    fill: '#C6E5FF',
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

const polygonFolder = gui.addFolder('polygon');
const polygonConfig = {
  fill: '#C6E5FF',
  stroke: '#1890FF',
  lineWidth: 2,
  fillOpacity: 1,
  strokeOpacity: 1,
  anchorX: 0,
  anchorY: 0,
  lineDash: 0,
  lineDashOffset: 0,
};
polygonFolder.addColor(polygonConfig, 'fill').onChange((color) => {
  polygon.style.fill = color;
});
polygonFolder.addColor(polygonConfig, 'stroke').onChange((color) => {
  polygon.style.stroke = color;
});
polygonFolder.add(polygonConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  polygon.style.lineWidth = lineWidth;
});
polygonFolder.add(polygonConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  polygon.style.lineDash = [lineDash];
});
polygonFolder.add(polygonConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  polygon.style.lineDashOffset = lineDashOffset;
});
polygonFolder.add(polygonConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  polygon.style.fillOpacity = opacity;
});
polygonFolder.add(polygonConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  polygon.style.strokeOpacity = opacity;
});

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
    polygon.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'x', 0, 400).onChange((x) => {
  polygon.setLocalPosition(x, polygon.style.y);
  // or
  // polygon.style.x = x;
});
transformFolder.add(transformConfig, 'y', 0, 400).onChange((y) => {
  polygon.setLocalPosition(polygon.style.x, y);
  // or
  // polygon.style.y = y;
});
transformFolder.add(transformConfig, 'scale', 0.2, 5).onChange((scaling) => {
  polygon.setLocalScale(scaling);
});
transformFolder.add(transformConfig, 'eulerAngles', 0, 360).onChange((eulerAngles) => {
  polygon.setLocalEulerAngles(eulerAngles);
});
transformFolder.open();
