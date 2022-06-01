import { Canvas, Image, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-dragndrop';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Drag'n'Drop with PointerEvents
 * @see https://javascript.info/mouse-drag-and-drop
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new Plugin());
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(new Plugin());
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const gate = new Image({
  style: {
    droppable: true,
    x: 50,
    y: 100,
    width: 200,
    height: 100,
    src: 'https://en.js.cx/clipart/soccer-gate.svg',
  },
});

const ball = new Image({
  style: {
    draggable: true,
    x: 300,
    y: 200,
    width: 100,
    height: 100,
    src: 'https://en.js.cx/clipart/ball.svg',
    cursor: 'pointer',
  },
});

canvas.appendChild(gate);
canvas.appendChild(ball);

const gateText = new Text({
  style: {
    x: 50,
    y: 350,
    fill: 'black',
    text: '',
    pointerEvents: 'none',
  },
});
const ballText = new Text({
  style: {
    x: 50,
    y: 400,
    fill: 'black',
    text: '',
    pointerEvents: 'none',
  },
});
canvas.appendChild(gateText);
canvas.appendChild(ballText);

let shiftX = 0;
let shiftY = 0;
function moveAt(target, canvasX, canvasY) {
  target.setPosition(canvasX - shiftX, canvasY - shiftY);
}

ball.addEventListener('dragstart', function (e) {
  e.target.style.opacity = 0.5;
  ballText.style.text = 'ball dragstart';

  const [x, y] = e.target.getPosition();
  shiftX = e.canvasX - x;
  shiftY = e.canvasY - y;

  moveAt(e.target, e.canvasX, e.canvasY);
});
ball.addEventListener('drag', function (e) {
  moveAt(e.target, e.canvasX, e.canvasY);
  ballText.style.text = `ball drag movement: ${e.movementX}, ${e.movementY}`;
});
ball.addEventListener('dragend', function (e) {
  e.target.style.opacity = 1;
  ballText.style.text = 'ball dragend';
});

gate.addEventListener('dragenter', function (e) {
  e.target.style.opacity = 0.6;
  gateText.style.text = 'gate dragenter';
});
gate.addEventListener('dragleave', function (e) {
  e.target.style.opacity = 1;
  gateText.style.text = 'gate dragleave';
});
gate.addEventListener('dragover', function (e) {
  e.target.style.opacity = 0.6;
  gateText.style.text = 'gate dragover';
});
gate.addEventListener('drop', function (e) {
  e.target.style.opacity = 1;
  gateText.style.text = 'gate drop';
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
