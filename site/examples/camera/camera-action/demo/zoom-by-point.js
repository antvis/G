import { Canvas, CanvasEvent, Ellipse } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import Hammer from 'hammerjs';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 500,
  height: 500,
  renderer: canvasRenderer,
});

const camera = canvas.getCamera();

const ellipse = new Ellipse({
  style: {
    cx: 250,
    cy: 250,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(ellipse);
});

// handle mouse wheel event
const bindWheelHandler = () => {
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

        const { x, y } = canvas.client2Viewport({ x: e.clientX, y: e.clientY });

        let zoom;
        if (e.deltaY < 0) {
          zoom = Math.max(minZoom, Math.min(maxZoom, camera.getZoom() / 0.95));
        } else {
          zoom = Math.max(minZoom, Math.min(maxZoom, camera.getZoom() * 0.95));
        }

        camera.setZoomByViewportPoint(zoom, [x, y]);
      },
      { passive: false },
    );
};

// use hammer.js
const hammer = new Hammer(canvas);
hammer.on('pan', (ev) => {
  camera.pan(
    (-ev.deltaX / Math.pow(2, camera.getZoom())) * 0.5,
    (-ev.deltaY / Math.pow(2, camera.getZoom())) * 0.5,
  );
});

bindWheelHandler();

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

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder
  .add(rendererConfig, 'renderer', [
    'canvas',
    'svg',
    'webgl',
    'webgpu',
    'canvaskit',
  ])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'canvas') {
      renderer = canvasRenderer;
    } else if (rendererName === 'svg') {
      renderer = svgRenderer;
    } else if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
    bindWheelHandler();
  });
rendererFolder.open();

const cameraFolder = gui.addFolder('camera actions');
const cameraConfig = {
  panX: 0,
  panY: 0,
  zoom: 1,
  roll: 0,
};

const origin = camera.getPosition();
cameraFolder.add(cameraConfig, 'panX', -300, 300).onChange((panX) => {
  const current = camera.getPosition();
  camera.pan(origin[0] + panX - current[0], 0);
});
cameraFolder.add(cameraConfig, 'panY', -300, 300).onChange((panY) => {
  const current = camera.getPosition();
  camera.pan(0, origin[1] + panY - current[1]);
});
cameraFolder.add(cameraConfig, 'roll', -90, 90).onChange((roll) => {
  camera.rotate(0, 0, roll);
});
cameraFolder.add(cameraConfig, 'zoom', 0, 10).onChange((zoom) => {
  camera.setZoom(zoom);
});
cameraFolder.open();
