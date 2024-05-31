import { Canvas, CanvasEvent, Path } from '@antv/g';
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
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

function getCirclePath(cx, cy, rx, ry) {
  return [
    ['M', cx - rx, ry],
    ['A', rx, ry, 0, 1, 0, cx + rx, ry],
    ['A', rx, ry, 0, 1, 0, cx - rx, ry],
    ['Z'],
  ];
}

const circlePath = new Path({
  style: {
    d: getCirclePath(200, 0, 100, 100),
    lineWidth: 10,
    stroke: '#54BECC',
    fill: '#F04864',
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circlePath);
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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  lineWidth: 1,
  lineDash: 0,
  lineDashOffset: 0,
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  pointerEvents: 'auto',
  visibility: 'visible',
};
circleFolder.add(circleConfig, 'r', 0, 200).onChange((r) => {
  circlePath.style.d = getCirclePath(200, 0, r, r);
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circlePath.style.lineWidth = lineWidth;
});
circleFolder.add(circleConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  circlePath.style.lineDash = [lineDash];
});
circleFolder
  .add(circleConfig, 'lineDashOffset', 0, 100)
  .onChange((lineDashOffset) => {
    circlePath.style.lineDashOffset = lineDashOffset;
  });
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circlePath.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circlePath.style.shadowBlur = shadowBlur;
});
circleFolder
  .add(circleConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    circlePath.style.shadowOffsetX = shadowOffsetX;
  });
circleFolder
  .add(circleConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    circlePath.style.shadowOffsetY = shadowOffsetY;
  });
circleFolder
  .add(circleConfig, 'pointerEvents', [
    'none',
    'auto',
    'stroke',
    'fill',
    'painted',
    'visible',
    'visiblestroke',
    'visiblefill',
    'visiblepainted',
    'all',
  ])
  .onChange((pointerEvents) => {
    circlePath.style.pointerEvents = pointerEvents;
  });
circleFolder
  .add(circleConfig, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    circlePath.style.visibility = visibility;
  });
circleFolder.open();
