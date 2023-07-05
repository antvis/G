import { Canvas, CanvasEvent, Image } from '@antv/g';
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
  for (let i = 0; i < 1000; i++) {
    const image = new Image({
      style: {
        x: Math.random() * 600,
        y: Math.random() * 500,
        width: 100 + Math.random() * 100,
        height: 100 + Math.random() * 100,
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8eoKRbfOwgAAAAAAAAAAAABkARQnAQ',
      },
    });
    canvas.appendChild(image);
  }
  for (let i = 0; i < 1000; i++) {
    const image = new Image({
      style: {
        x: Math.random() * 600,
        y: Math.random() * 500,
        width: 100 + Math.random() * 100,
        height: 100 + Math.random() * 100,
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      },
    });
    canvas.appendChild(image);
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
