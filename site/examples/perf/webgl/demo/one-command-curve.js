import { Canvas, CanvasEvent, Path } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import { vec2 } from 'gl-matrix';

const getControlPoint = (startPoint, endPoint, percent, offset) => {
  const point = {
    x: (1 - percent) * startPoint.x + percent * endPoint.x,
    y: (1 - percent) * startPoint.y + percent * endPoint.y,
  };

  let tangent = [0, 0];
  vec2.normalize(tangent, [
    endPoint.x - startPoint.x,
    endPoint.y - startPoint.y,
  ]);

  if (!tangent || (!tangent[0] && !tangent[1])) {
    tangent = [0, 0];
  }
  const perpendicular = [-tangent[1] * offset, tangent[0] * offset]; // 垂直向量
  point.x += perpendicular[0];
  point.y += perpendicular[1];
  return point;
};

// create a renderer
const webglRenderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

for (let i = 0; i < 5000; i++) {
  const p1 = { x: Math.random() * 600 * 2, y: Math.random() * 500 * 2 };
  const p2 = { x: Math.random() * 600 * 2, y: Math.random() * 500 * 2 };
  const cp = getControlPoint(p1, p2, 0.5, 30);
  const path = new Path({
    style: {
      lineWidth: 1,
      lineDash: [10, 10],
      stroke: '#54BECC',
      d: [
        ['M', p1.x, p1.y],
        ['Q', cp.x, cp.y, p2.x, p2.y],
      ],
    },
  });
  canvas.appendChild(path);

  path.addEventListener('mouseenter', () => {
    path.style.stroke = 'red';
  });
  path.addEventListener('mouseleave', () => {
    path.style.stroke = '#54BECC';
  });
}

for (let i = 0; i < 5000; i++) {
  const p1 = { x: Math.random() * 600 * 2, y: Math.random() * 500 * 2 };
  const p2 = { x: Math.random() * 600 * 2, y: Math.random() * 500 * 2 };
  const cp1 = getControlPoint(p1, p2, 0.2, 30);
  const cp2 = getControlPoint(p1, p2, 0.8, 30);
  const path = new Path({
    style: {
      lineWidth: 1,
      stroke: '#54BECC',
      d: [
        ['M', p1.x, p1.y],
        ['C', cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y],
      ],
    },
  });
  canvas.appendChild(path);
  path.addEventListener('mouseenter', () => {
    path.style.stroke = 'red';
  });
  path.addEventListener('mouseleave', () => {
    path.style.stroke = '#54BECC';
  });
}
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
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
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
canvas
  .getContextService()
  .getDomElement() // g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
  .addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      let zoom;
      if (e.deltaY < 0) {
        zoom = Math.max(minZoom, Math.min(maxZoom, camera.getZoom() / 0.95));
      } else {
        zoom = Math.max(minZoom, Math.min(maxZoom, camera.getZoom() * 0.95));
      }
      camera.setZoom(zoom);
    },
    { passive: false },
  );

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const transformFolder = gui.addFolder('style');
const transformConfig = {
  lineWidth: 1,
  lineDash: 10,
  lineDashOffset: 0,
};
transformFolder
  .add(transformConfig, 'lineWidth', 0, 20)
  .onChange((lineWidth) => {
    const paths = canvas.document.querySelectorAll('path');
    paths.forEach((path) => {
      path.style.lineWidth = lineWidth;
    });
  });
transformFolder.add(transformConfig, 'lineDash', 0, 50).onChange((dash) => {
  const paths = canvas.document.querySelectorAll('path');
  paths[0].style.lineDash = [dash, dash];
});
transformFolder
  .add(transformConfig, 'lineDashOffset', 0, 50)
  .onChange((lineDashOffset) => {
    const paths = canvas.document.querySelectorAll('path');
    paths[0].style.lineDashOffset = lineDashOffset;
  });
