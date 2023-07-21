import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  for (let i = 0; i < 5000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 600,
        cy: Math.random() * 500,
        r: Math.random() * 100,
        stroke: '#5B8FF9',
        lineWidth: 1,
        lineDash: i % 2 === 0 ? [10, 10] : [0],
        fill: 'red',
        fillOpacity: 0.5,
      },
    });
    canvas.appendChild(circle);
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
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'webgl',
};
rendererFolder
  .add(rendererConfig, 'renderer', ['webgl', 'webgpu'])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
