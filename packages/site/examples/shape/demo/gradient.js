import { Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const linearGradient = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
const radialGradient = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
const pattern = 'p(a) https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';

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
    fill: linearGradient,
    stroke: '#F04864',
    lineWidth: 4,
  },
});

// add a circle to canvas
canvas.appendChild(circle);

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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  fill: 'linear',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
  anchorX: 0.5,
  anchorY: 0.5,
};
circleFolder.add(circleConfig, 'r', 50, 200).onChange((radius) => {
  circle.style.r = radius;
});
circleFolder.add(circleConfig, 'fill', ['linear', 'radial', 'pattern']).onChange((color) => {
  if (color === 'linear') {
    circle.style.fill = linearGradient;
  } else if (color === 'radial') {
    circle.style.fill = radialGradient;
  } else if (color === 'pattern') {
    circle.style.fill = pattern;
  }
});
circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
  circle.attr('stroke', color);
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circle.attr('lineWidth', lineWidth);
});
circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.attr('fillOpacity', opacity);
});
circleFolder.add(circleConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.attr('strokeOpacity', opacity);
});
circleFolder.add(circleConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  circle.attr('anchor', [anchorX, circleConfig.anchorY]);
});
circleFolder.add(circleConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  circle.attr('anchor', [circleConfig.anchorX, anchorY]);
});
circleFolder.open();
