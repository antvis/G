import { Canvas, CanvasEvent, Circle, Text } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import Stats from 'stats.js';

const renderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 500;
    canvas.appendChild(
      new Circle({
        attrs: {
          fill: '#C6E5FF',
          stroke: 'red',
          r: 20,
          cx: x,
          cy: y,
          lineWidth: 3,
        },
      }),
    );

    canvas.appendChild(
      new Text({
        attrs: {
          text: 'ccc',
          x,
          y,
          fill: '#ccc',
          fontSize: 12,
        },
      }),
    );
  }
});

const camera = canvas.getCamera();
camera.setZoom(10);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
