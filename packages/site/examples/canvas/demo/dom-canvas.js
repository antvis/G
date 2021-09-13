import { Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const $div1 = document.createElement('div');
document.getElementById('container').appendChild($div1);
const $div2 = document.createElement('div');
document.getElementById('container').appendChild($div2);

// create a renderer
const canvasRenderer1 = new CanvasRenderer();
const webglRenderer1 = new WebGLRenderer();
const svgRenderer1 = new SVGRenderer();
const canvasRenderer2 = new CanvasRenderer();

// create a canvas
const canvas1 = new Canvas({
  container: $div1,
  width: 600,
  height: 500,
  renderer: canvasRenderer1,
});

const canvas2 = new Canvas({
  container: $div2,
  width: 600,
  height: 500,
  renderer: canvasRenderer2,
});

// create a circle
const circle1 = new Circle({
  id: 'circle1',
  style: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
canvas1.appendChild(circle1);
circle1.on('mouseenter', () => {
  circle1.attr('fill', '#2FC25B');
});

circle1.on('mouseleave', () => {
  circle1.attr('fill', '#1890FF');
});

const circle2 = new Circle({
  id: 'circle2',
  style: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
canvas2.appendChild(circle2);
circle2.on('mouseenter', () => {
  circle2.attr('fill', '#2FC25B');
});

circle2.on('mouseleave', () => {
  circle2.attr('fill', '#1890FF');
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
canvas1.on('afterrender', () => {
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
  canvas1.setRenderer(
    renderer === 'canvas' ? canvasRenderer1 : renderer === 'webgl' ? webglRenderer1 : svgRenderer1,
  );
});
rendererFolder.open();
