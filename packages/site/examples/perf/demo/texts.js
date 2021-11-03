import { Text, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

for (let i = 0; i < 100; i++) {
  const text = new Text({
    style: {
      x: Math.random() * 600,
      y: Math.random() * 500,
      fontFamily: 'PingFang SC',
      text: '测试文本' + i,
      fontSize: 50 + Math.random() * 10,
      fill: i % 2 === 0 ? '#1890FF' : 'red',
    },
  });
  canvas.appendChild(text);
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
canvas.on('afterrender', () => {
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
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'webgl',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
