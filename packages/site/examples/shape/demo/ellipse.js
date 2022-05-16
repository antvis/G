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
    cx: 300,
    cy: 200,
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
  cx: 300,
  cy: 200,
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
ellipseFolder.add(ellipseConfig, 'cx', 0, 600).onChange((cx) => {
  ellipse.style.cx = cx;
});
ellipseFolder.add(ellipseConfig, 'cy', 0, 600).onChange((cy) => {
  ellipse.style.cy = cy;
});
ellipseFolder.add(ellipseConfig, 'rx', 50, 200).onChange((rx) => {
  ellipse.style.rx = rx;
});
ellipseFolder.add(ellipseConfig, 'ry', 50, 200).onChange((ry) => {
  ellipse.style.ry = ry;
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
  localPositionX: 300,
  localPositionY: 200,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'center',
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
transformFolder.add(transformConfig, 'localPositionX', 0, 600).onChange((localPositionX) => {
  const [lx, ly] = ellipse.getLocalPosition();
  ellipse.setLocalPosition(localPositionX, ly);
});
transformFolder.add(transformConfig, 'localPositionY', 0, 500).onChange((localPositionY) => {
  const [lx, ly] = ellipse.getLocalPosition();
  ellipse.setLocalPosition(lx, localPositionY);
});
transformFolder.add(transformConfig, 'localScale', 0.2, 5).onChange((localScale) => {
  ellipse.setLocalScale(localScale);
});
transformFolder.add(transformConfig, 'localEulerAngles', 0, 360).onChange((localEulerAngles) => {
  ellipse.setLocalEulerAngles(localEulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  ellipse.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  ellipse.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
