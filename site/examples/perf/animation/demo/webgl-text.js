import { Canvas, CanvasEvent, Text, runtime } from '@antv/g';
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
  for (let i = 0; i < 1000; i++) {
    const text = new Text({
      style: {
        x: Math.random() * 600,
        y: Math.random() * 500,
        fontSize: 16,
        fill: 'black',
        text: `Text1${i}`,
      },
    });
    canvas.appendChild(text);

    text.animate(
      [
        { opacity: 0, transform: 'translate(0, 0)' },
        { opacity: 1, transform: 'translate(100, 0)' },
      ],
      {
        duration: 2000,
        fill: 'both',
        iterations: Infinity,
      },
    );
  }
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
