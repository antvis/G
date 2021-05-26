import { Canvas, Rect } from '@antv/g';
import { Arrow } from '@antv/g-ui';
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

// create an arrow
const arrow = new Arrow({
  attrs: {
    x1: 300,
    y1: 200,
    x2: 100,
    y2: 100,
    stroke: '#F04864',
    lineWidth: 4,
  },
});

// display bounds
// const bounds = new Rect({
//   attrs: {
//     stroke: 'black',
//     lineWidth: 2,
//   },
// });

// canvas.appendChild(bounds);
canvas.appendChild(arrow);

// arrow.rotate(30)
// arrow.scale(0.5)

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('postrender', () => {
  if (stats) {
    stats.update();
  }

  // const bounding = arrow.getBounds();
  // if (bounding) {
  //   const { center, halfExtents } = bounding;
  //   bounds.attr('width', halfExtents[0] * 2);
  //   bounds.attr('height', halfExtents[1] * 2);
  //   bounds.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
  // }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setConfig({
    renderer: renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  });
});
rendererFolder.open();

const arrowFolder = gui.addFolder('arrow');
const arrowConfig = {
  stroke: '#F04864',
  lineWidth: 4,
  strokeOpacity: 1,
};
arrowFolder.addColor(arrowConfig, 'stroke').onChange((color) => {
  arrow.attr('stroke', color);
});
arrowFolder.add(arrowConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  arrow.attr('lineWidth', lineWidth);
});
arrowFolder.add(arrowConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  arrow.attr('strokeOpacity', opacity);
});
arrowFolder.open();
