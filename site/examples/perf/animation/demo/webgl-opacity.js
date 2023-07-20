import { Canvas, CanvasEvent, Rect, runtime } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import Stats from 'stats.js';

runtime.enableCSSParsing = false;

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: new Renderer(),
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const rect1 = new Rect({
    style: {
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      fill: 'blue',
    },
  });

  const rect2 = new Rect({
    style: {
      x: 250,
      y: 250,
      width: 100,
      height: 100,
      fill: 'red',
    },
  });

  canvas.appendChild(rect1);
  canvas.appendChild(rect2);

  rect2.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 2000,
    fill: 'both',
    iterations: Infinity,
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
