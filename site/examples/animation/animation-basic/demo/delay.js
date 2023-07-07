import { Canvas, CanvasEvent, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
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
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const rect = new Rect({
  style: {
    x: 100,
    y: 200,
    width: 50,
    height: 100,
    fill: '#1890FF',
  },
});
const rect2 = new Rect({
  style: {
    x: 200,
    y: 200,
    width: 50,
    height: 100,
    fill: '#1890FF',
  },
});
const rect3 = new Rect({
  style: {
    x: 300,
    y: 200,
    width: 50,
    height: 100,
    fill: '#1890FF',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(rect);
  canvas.appendChild(rect2);
  canvas.appendChild(rect3);

  rect.animate(
    [{ transform: 'scale(0.0001, 1)' }, { transform: 'scale(1, 1)' }],
    {
      duration: 1000,
      //   delay: 0,
      fill: 'both',
    },
  );
  rect2.animate(
    [{ transform: 'scale(0.0001, 1)' }, { transform: 'scaleY(1)' }],
    {
      duration: 1000,
      delay: 1000,
      fill: 'both',
    },
  );
  rect3.animate(
    [{ transform: 'scale(0.0001, 1)' }, { transform: 'scale(1, 1)' }],
    {
      duration: 1000,
      delay: 2000,
      fill: 'both',
    },
  );
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
