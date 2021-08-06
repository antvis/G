import { Canvas, Group, Rect, Text, CustomEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a custom event
const event = new CustomEvent('build', { detail: { prop1: 'xx' } });

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

const ul = new Group({
  id: 'ul',
});
const li1 = new Rect({
  id: 'li1',
  attrs: {
    x: 200,
    y: 100,
    width: 300,
    height: 100,
    fill: '#1890FF',
  },
});
const text = new Text({
  attrs: {
    x: 150,
    y: 50,
    text: 'Click me!',
    fontSize: 22,
    fill: '#000',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});
li1.appendChild(text);

const li2 = new Rect({
  id: 'li2',
  attrs: {
    x: 200,
    y: 300,
    width: 300,
    height: 100,
    fill: '#1890FF',
  },
});

canvas.appendChild(ul);
ul.appendChild(li1);
ul.appendChild(li2);

li1.addEventListener('click', (e) => {
  // dispatch my custom event!
  li1.dispatchEvent(event);

  // @deprecated
  // li1.emit('build', { prop1: 'xx' });
});

// delegate to parent
ul.addEventListener('build', (e) => {
  console.log(e.target); // circle
  console.log(e.detail); // { prop1: 'xx' }
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
