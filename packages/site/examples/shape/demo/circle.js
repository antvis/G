import { Circle, Canvas } from '@antv/g';
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

// create a circle
const circle = new Circle({
  style: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    shadowColor: 'black',
    shadowBlur: 20,
    cursor: 'pointer',
  },
});

// add a circle to canvas
canvas.appendChild(circle);

// use AntV G devtools
window.__g_instances__ = [canvas];

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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  lineDash: 0,
  lineDashOffset: 0,
  fillOpacity: 1,
  strokeOpacity: 1,
  shadowColor: '#000',
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
};
circleFolder.add(circleConfig, 'r', 50, 200).onChange((radius) => {
  circle.style.r = radius;
});
circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
  circle.style.fill = color;
});
circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
  circle.attr('stroke', color);
});
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circle.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circle.style.shadowBlur = shadowBlur;
});
circleFolder.add(circleConfig, 'shadowOffsetX', -50, 50).onChange((shadowOffsetX) => {
  circle.style.shadowOffsetX = shadowOffsetX;
});
circleFolder.add(circleConfig, 'shadowOffsetY', -50, 50).onChange((shadowOffsetY) => {
  circle.style.shadowOffsetY = shadowOffsetY;
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circle.style.lineWidth = lineWidth;
});
circleFolder.add(circleConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  circle.style.lineDash = [lineDash];
});
circleFolder.add(circleConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  circle.style.lineDashOffset = lineDashOffset;
});
circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.style.fillOpacity = opacity;
});
circleFolder.add(circleConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.style.strokeOpacity = opacity;
});
circleFolder
  .add(circleConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    circle.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
circleFolder
  .add(circleConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    circle.style.cursor = cursor;
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
    circle.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'x', 0, 400).onChange((x) => {
  circle.setLocalPosition(x, circle.style.y);
  // or
  // circle.style.x = x;
});
transformFolder.add(transformConfig, 'y', 0, 400).onChange((y) => {
  circle.setLocalPosition(circle.style.x, y);
  // or
  // circle.style.y = y;
});
transformFolder.add(transformConfig, 'scale', 0.2, 5).onChange((scaling) => {
  circle.setLocalScale(scaling);
});
transformFolder.add(transformConfig, 'eulerAngles', 0, 360).onChange((eulerAngles) => {
  circle.setLocalEulerAngles(eulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  circle.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  circle.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
