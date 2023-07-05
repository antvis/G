import { Canvas, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * CSS Box Model
 * @see https://developer.mozilla.org/zh-CN/docs/learn/css/building_blocks/the_box_model
 *
 * scenegraph:
 * blue rect
 *  -> red rect
 *   -> green rect
 */

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

const parent = new Rect({
  style: {
    x: 100,
    y: 100,
    width: 400,
    height: 400,
    fill: '#1890FF',
  },
});
canvas.appendChild(parent);

const red = new Rect({
  style: {
    x: '50%',
    y: '50%',
    width: 100,
    height: 100,
    fill: 'red',
  },
});
parent.appendChild(red);

const green = new Rect({
  style: {
    x: '-100%',
    y: 0,
    width: '100%',
    height: '100%',
    fill: 'green',
  },
});
red.appendChild(green);

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

const parentFolder = gui.addFolder('blue rect');
const parentConfig = {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
};
parentFolder
  .add(parentConfig, 'x', 0, 300)
  .onChange((x) => {
    parent.style.x = `${x}px`;
  })
  .name('x(in px)');
parentFolder
  .add(parentConfig, 'y', 0, 300)
  .onChange((y) => {
    parent.style.y = `${y}px`;
  })
  .name('y(in px)');
parentFolder
  .add(parentConfig, 'width', 0, 600)
  .onChange((width) => {
    parent.style.width = width;
  })
  .name('width(in px)');
parentFolder
  .add(parentConfig, 'height', 0, 600)
  .onChange((height) => {
    parent.style.height = height;
  })
  .name('height(in px)');
parentFolder.open();

const redFolder = gui.addFolder('red rect');
const redConfig = {
  x: 50,
  y: 50,
  width: 100,
  height: 100,
};
redFolder
  .add(redConfig, 'x', 0, 100)
  .onChange((x) => {
    red.style.x = `${x}%`;
  })
  .name('x(in %)');
redFolder
  .add(redConfig, 'y', 0, 100)
  .onChange((y) => {
    red.style.y = `${y}%`;
  })
  .name('y(in %)');
redFolder
  .add(redConfig, 'width', 0, 400)
  .onChange((width) => {
    red.style.width = width;
  })
  .name('width(in px)');
redFolder
  .add(redConfig, 'height', 0, 400)
  .onChange((height) => {
    red.style.height = height;
  })
  .name('height(in px)');
redFolder.open();

const greenFolder = gui.addFolder('green rect');
const greenConfig = {
  x: -100,
  y: 50,
  width: 100,
  height: 100,
};
greenFolder
  .add(greenConfig, 'x', -100, 100)
  .onChange((x) => {
    green.style.x = `${x}%`;
  })
  .name('x(in %)');
greenFolder
  .add(greenConfig, 'y', -100, 100)
  .onChange((y) => {
    green.style.y = `${y}px`;
  })
  .name('y(in px)');
greenFolder
  .add(greenConfig, 'width', 0, 100)
  .onChange((width) => {
    green.style.width = `${width}%`;
  })
  .name('width(in %)');
greenFolder
  .add(greenConfig, 'height', 0, 100)
  .onChange((height) => {
    green.style.height = `${height}%`;
  })
  .name('height(in %)');
greenFolder.open();
