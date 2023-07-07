import { Canvas, CanvasEvent, Circle, Path, Text } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import Stats from 'stats.js';

/**
 * do `pan` action with camera
 *
 * compared with G 4.0 ～30FPS
 * @see https://codesandbox.io/s/g-4-0-data1-pan-g8t95d?file=/index.js
 */

const renderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  let edgesNum = 2742;
  for (let i = 0; i < edgesNum; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 500;
    canvas.appendChild(
      new Path({
        attrs: {
          d: `M ${x} ${y} L ${x + Math.random() * 100} ${
            y + Math.random() * 50
          }`,
          lineWidth: 1,
          stroke: '#000',
          lineWidth: 0.3,
        },
      }),
    );
  }
  let nodesNum = 1589;
  for (let i = 0; i < nodesNum; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 500;
    canvas.appendChild(
      new Circle({
        attrs: {
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          r: 2,
          cx: x,
          cy: y,
          lineWidth: 0.3,
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
let count = 0;
let tag = 1;
const animate = () => {
  if (stats) {
    stats.update();
  }
  count++;
  if (count % 80 === 0) {
    count = 0;
    tag *= -1;
  }
  camera.pan(tag, tag);
  requestAnimationFrame(animate);
};

requestAnimationFrame(animate);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
