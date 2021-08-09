import { Ellipse, Canvas } from '@antv/g';
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

const ellipse = new Ellipse({
  style: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
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

const ellipseFolder = gui.addFolder('Transform');
const ellipseConfig = {
  translateX: 0,
  translateY: 0,
  originX: 0,
  originY: 0,
  scale: 1,
  rotate: () => {
    ellipse.rotateLocal(10);
  },
};
ellipseFolder.add(ellipseConfig, 'translateX', -200, 200).onChange((tx) => {
  // same as:
  // ellipse.attr('x');
  // ellipse.attr('y');
  const [x, y] = ellipse.getPosition();
  // same as:
  // * ellipse.move(300 + tx, y);
  // * ellipse.moveTo(300 + tx, y);
  ellipse.setPosition(300 + tx, y);
});
ellipseFolder.add(ellipseConfig, 'translateY', -200, 200).onChange((ty) => {
  const [x, y] = ellipse.getPosition();
  // same as:
  // * ellipse.move(x, 200 + ty);
  // * ellipse.moveTo(x, 200 + ty);
  ellipse.setPosition(x, 200 + ty);
});
ellipseFolder.add(ellipseConfig, 'originX', -200, 200).onChange((tx) => {
  ellipse.style.origin = [tx, ellipseConfig.originY];
});
ellipseFolder.add(ellipseConfig, 'originY', -200, 200).onChange((ty) => {
  ellipse.style.origin = [ellipseConfig.originX, ty];
});
ellipseFolder.add(ellipseConfig, 'rotate').name('rotate');
ellipseFolder.add(ellipseConfig, 'scale', 0.2, 5).onChange((scaling) => {
  ellipse.setLocalScale(scaling);
});

ellipseFolder.open();
