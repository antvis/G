import { Canvas, CanvasEvent, Polygon } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
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
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a polygon to canvas
  canvas.appendChild(polygon);
});

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
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
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
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
polygonFolder
  .add(polygonConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    polygon.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
polygonFolder
  .add(polygonConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    polygon.style.cursor = cursor;
  });

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 100,
  localPositionY: 100,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'left top',
  anchorX: 0,
  anchorY: 0,
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
transformFolder.add(transformConfig, 'localPositionX', 0, 600).onChange((localPositionX) => {
  const [lx, ly] = polygon.getLocalPosition();
  polygon.setLocalPosition(localPositionX, ly);
});
transformFolder.add(transformConfig, 'localPositionY', 0, 500).onChange((localPositionY) => {
  const [lx, ly] = polygon.getLocalPosition();
  polygon.setLocalPosition(lx, localPositionY);
});
transformFolder.add(transformConfig, 'localScale', 0.2, 5).onChange((localScale) => {
  polygon.setLocalScale(localScale);
});
transformFolder.add(transformConfig, 'localEulerAngles', 0, 360).onChange((localEulerAngles) => {
  polygon.setLocalEulerAngles(localEulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  polygon.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  polygon.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
