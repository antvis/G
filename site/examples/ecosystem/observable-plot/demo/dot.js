import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import * as Plot from '@observablehq/plot';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
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

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 640,
  height: 400,
  renderer: canvasRenderer,
});

(async () => {
  const res = await fetch(
    'https://gw.alipayobjects.com/os/bmw-prod/b8954a70-dcc7-4868-9b85-5e291ba8d5db.json',
  );
  const athletes = await res.json();

  Plot.dot(athletes, {
    x: 'weight',
    y: 'height',
    stroke: 'sex',
  }).plot({
    document: canvas.document,
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
    });
  rendererFolder.open();
})();
