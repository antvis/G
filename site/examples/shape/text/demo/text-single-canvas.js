import {
  Canvas,
  CanvasEvent,
  Circle,
  Rect,
  Text,
  Path,
  runtime,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();

const $canvas = document.createElement('canvas');
const dpr = window.devicePixelRatio;
$canvas.width = dpr * 600;
$canvas.height = dpr * 500;
$canvas.style.width = '600px';
$canvas.style.height = '500px';
document.getElementById('container').appendChild($canvas);

// create a canvas
const canvas = new Canvas({
  canvas: $canvas,
  renderer: canvasRenderer,
  offscreenCanvas: $canvas,
});

runtime.offscreenCanvas = $canvas;

// create a line of text
const text = new Text({
  style: {
    x: 100,
    y: 300,
    fontFamily: 'PingFang SC',
    text: '这是测试文本This is text',
    fontSize: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 5,
  },
});

console.log(text.getBounds());

// display anchor
const origin = new Circle({
  style: {
    r: 20,
    fill: 'red',
  },
});
origin.setPosition(text.getPosition());

// display bounds
const bounds = new Rect({
  style: {
    stroke: 'black',
    lineWidth: 2,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(bounds);
  canvas.appendChild(text);
  canvas.appendChild(origin);
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

  const bounding = text.getBounds();
  if (bounding) {
    const { center, halfExtents } = bounding;
    bounds.attr('width', halfExtents[0] * 2);
    bounds.attr('height', halfExtents[1] * 2);
    bounds.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
  }
});
