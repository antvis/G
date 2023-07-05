import { Canvas, CanvasEvent, Circle, Text } from '@antv/g';
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
  alwaysTriggerPointermoveEvent: true,
});

// add a circle to canvas
const circle = new Circle({
  id: 'circle',
  style: {
    fill: 'rgb(239, 244, 255)',
    fillOpacity: 1,
    lineWidth: 1,
    opacity: 1,
    r: 100,
    stroke: 'rgb(95, 149, 255)',
    strokeOpacity: 1,
    cursor: 'pointer',
  },
});

const text = new Text({
  id: 'text',
  style: {
    fill: '#000',
    fillOpacity: 0.9,
    font: `normal normal normal 12px Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    fontFamily: 'Avenir',
    fontSize: 22,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    lineWidth: 1,
    opacity: 1,
    strokeOpacity: 1,
    text: 'Try to tap/press/pan me',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  circle.appendChild(text);
  canvas.appendChild(circle);
  circle.setPosition(300, 200);

  // use hammer.js
  const hammer = new Hammer(circle, {
    inputClass: Hammer.PointerEventInput,
  });
  hammer.on('panleft panright tap press', (ev) => {
    text.attr('text', `${ev.type} gesture detected.`);
  });

  canvas.addEventListener('pointermove', (ev) => {
    console.log(ev.target.nodeName);
  });
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
