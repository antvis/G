import { Canvas, CanvasEvent, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import Stats from 'stats.js';

const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

function draw(nodesNum) {
  function inner() {
    for (let i = 0; i < nodesNum; i++) {
      const x = Math.random() * 600;
      const y = Math.random() * 500;
      const path = canvas.appendChild(
        new Path({
          attrs: {
            fill: '#C6E5FF',
            stroke: '#5B8FF9',
            // path: [
            //   ['M', 54.4462133232839 + x, -6.41757177038063 + y],
            //   ['L', 61.3765714868427 + x, 6.41757177038063 + y],
            //   ['M', 61.3765714868427 + x, 6.41757177038063 + y],
            //   ['L', 61.54285370420826 + x, 0.5852759906612777 + y],
            //   ['M', 61.3765714868427 + x, 6.41757177038063 + y],
            //   ['L', 56.4087962879037 + x, 3.3574192560847824 + y],
            // ],
            path: `M${54.4462133232839 + x},${-6.41757177038063 + y} L${61.3765714868427 + x},${
              6.41757177038063 + y
            } M${61.3765714868427 + x},${6.41757177038063 + y} L${61.54285370420826 + x},${
              0.5852759906612777 + y
            }M${61.3765714868427 + x},${6.41757177038063 + y}L${56.4087962879037 + x},${
              3.3574192560847824 + y
            }`,
          },
        }),
      );
      // path.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }]);
    }
  }

  inner();
  inner();
  inner();
  inner();
  inner();
}

canvas.addEventListener(CanvasEvent.READY, () => {
  let nodesNum = 10000;
  draw(nodesNum);
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
