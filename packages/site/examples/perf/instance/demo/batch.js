import { Circle, Line, Canvas, Batch } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import Stats from 'stats.js';
import interact from 'interactjs';

// create a renderer
const webglRenderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const circleBatch = new Batch({});

for (let i = 0; i < 5; i++) {
  const circle = new Circle({
    id: i,
    attrs: {
      x: Math.random() * 600,
      y: Math.random() * 500,
      r: 20 + Math.random() * 10,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  circle.addEventListener('mouseenter', (e) => {
    e.target.setAttribute('fill', '#F04864');
  });

  circle.addEventListener('mouseleave', (e) => {
    e.target.setAttribute('fill', '#1890FF');
  });

  circleBatch.appendChild(circle);
}

canvas.appendChild(circleBatch);

// update Camera's zoom
// @see https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
const camera = canvas.getCamera();
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

interact(canvas.document, {
  context: canvas.document,
}).draggable({
  onmove: function (event) {
    const { dx, dy } = event;
    // circle.translateLocal(dx, dy);
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
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }
});