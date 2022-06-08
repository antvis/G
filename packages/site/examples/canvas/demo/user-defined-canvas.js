import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import Stats from 'stats.js';

const $canvas = document.createElement('canvas');
const dpr = window.devicePixelRatio;
$canvas.width = dpr * 600;
$canvas.height = dpr * 500;
$canvas.style.width = '600px';
$canvas.style.height = '500px';
document.getElementById('container').appendChild($canvas);

// create a renderer
const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  canvas: $canvas,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    cx: 300,
    cy: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);
  circle.addEventListener('pointerenter', () => {
    circle.attr('fill', '#2FC25B');
  });

  circle.addEventListener('pointerleave', () => {
    circle.attr('fill', '#1890FF');
  });
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
