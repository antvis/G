import { Circle, Rect, Canvas } from '@antv/g';
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
    width: 100,
    height: 40,
    fill: 'red',
  },
});

const circle1 = new Circle({
  style: {
    y: 20,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const circle2 = new Circle({
  style: {
    x: 100,
    y: 20,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

rect.setPosition(100, 100);
rect.appendChild(circle1);
rect.appendChild(circle2);
canvas.appendChild(rect);

const animation = rect.animate(
  [
    {
      width: 100,
    },
    {
      width: 400,
    },
  ],
  {
    duration: 1500,
    iterations: Infinity,
  },
);
animation.onframe = () => {
  // use parsed value here
  circle2.setLocalPosition(rect.parsedStyle.width.value, 20);
  // circle2.setLocalPosition(Number(`${rect.style.width}`.replace('px', '')), 20);
};

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
