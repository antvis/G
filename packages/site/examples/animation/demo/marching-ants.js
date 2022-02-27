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

const circle = new Circle({
  style: {
    x: 200,
    y: 200,
    r: 60,
    stroke: '#F04864',
    lineWidth: 4,
    lineDash: [10, 10],
  },
});
canvas.appendChild(circle);

circle.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
  duration: 500,
  iterations: Infinity,
});

const rect = new Rect({
  style: {
    x: 300,
    y: 100,
    width: 200,
    height: 200,
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
    lineDash: [10, 10],
  },
});
canvas.appendChild(rect);
rect.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
  duration: 500,
  iterations: Infinity,
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
