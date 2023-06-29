import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';

import Stats from 'stats.js';

const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 500,
  height: 500,
  renderer: webgpuRenderer,
  // background: 'gray',
});

const circle = new Circle({
  style: {
    x: 250,
    y: 250,
    r: 250,
    fill: 'green',
    cursor: 'pointer',
  },
});

// const icon = new Image({
//   style: {
//     x: 200,
//     y: 200,
//     z: 0,
//     width: 200,
//     height: 200,
//     src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
//     isBillboard: true,
//   },
// });

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);
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
