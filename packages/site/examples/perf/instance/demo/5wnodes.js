import { Circle, Line, Canvas, Batch } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import Stats from 'stats.js';

// ported from G6 @see https://g6.antv.vision/zh/examples/performance/perf#moreData

fetch('https://gw.alipayobjects.com/os/bmw-prod/f1565312-d537-4231-adf5-81cb1cd3a0e8.json')
  .then((res) => res.json())
  .then((data) => {
    // create a batch
    const circleBatch = new Batch({});

    data.nodes.forEach(({ size, x, y }) => {
      const circle = new Circle({
        attrs: {
          x,
          y,
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          r: 2,
          lineWidth: 1,
        },
      });
      circleBatch.appendChild(circle);
    });

    canvas.appendChild(circleBatch);
  });

// create a renderer
const webglRenderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
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

const camera = canvas.getCamera();
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }

  // manipulate camera instead of the root of canvas
  camera.rotate(0, 0, 1);
});

// update Camera's zoom
// @see https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
const minZoom = 0;
const maxZoom = Infinity;
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  e.stopPropagation();

  let zoom;
  if (e.deltaY < 0) {
    zoom = Math.max(
      minZoom,
      Math.min(maxZoom, camera.getZoom() / 0.95),
    );
  } else {
    zoom = Math.max(
      minZoom,
      Math.min(maxZoom, camera.getZoom() * 0.95),
    );
  }
  camera.setZoom(zoom);
});
