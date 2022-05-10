import { Ellipse, Canvas } from '@antv/g';
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

const ellipse = new Ellipse({
  style: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
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

const ellipseFolder = gui.addFolder('ellipse');
const ellipseConfig = {
  rx: 100,
  ry: 150,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
};
ellipseFolder.add(ellipseConfig, 'rx', 50, 200).onChange((radius) => {
  ellipse.style.rx = radius;
});
ellipseFolder.add(ellipseConfig, 'ry', 50, 200).onChange((radius) => {
  ellipse.style.ry = radius;
});
ellipseFolder.addColor(ellipseConfig, 'fill').onChange((color) => {
  ellipse.style.fill = color;
});
ellipseFolder.addColor(ellipseConfig, 'stroke').onChange((color) => {
  ellipse.style.stroke = color;
});
ellipseFolder.add(ellipseConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  ellipse.style.lineWidth = lineWidth;
});
ellipseFolder.add(ellipseConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  ellipse.style.fillOpacity = opacity;
});
ellipseFolder.add(ellipseConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  ellipse.style.strokeOpacity = opacity;
});
ellipseFolder.open();
ellipseFolder
  .add(ellipseConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    ellipse.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
ellipseFolder
  .add(ellipseConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    ellipse.style.cursor = cursor;
  });

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  x: 300,
  y: 200,
  scale: 1,
  transformOrigin: 'center',
  eulerAngles: 0,
  anchorX: 0.5,
  anchorY: 0.5,
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
    ellipse.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'x', 0, 400).onChange((x) => {
  ellipse.setLocalPosition(x, ellipse.style.y);
  // or
  // ellipse.style.x = x;
});
transformFolder.add(transformConfig, 'y', 0, 400).onChange((y) => {
  ellipse.setLocalPosition(ellipse.style.x, y);
  // or
  // ellipse.style.y = y;
});
transformFolder.add(transformConfig, 'scale', 0.2, 5).onChange((scaling) => {
  ellipse.setLocalScale(scaling);
});
transformFolder.add(transformConfig, 'eulerAngles', 0, 360).onChange((eulerAngles) => {
  ellipse.setLocalEulerAngles(eulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  ellipse.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  ellipse.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
