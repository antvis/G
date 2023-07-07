import { Canvas, CanvasEvent, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import { lines } from '@antv/g-pattern';

/**
 * inspired by https://nivo.rocks/guides/patterns/
 */

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

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const rect = new Rect({
  style: {
    x: 50,
    y: 100,
    width: 200,
    height: 100,
    fill: {
      image: lines({
        stroke: '#000000',
      }),
      repetition: 'repeat',
    },
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(rect);
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

const folder = gui.addFolder('lines');
const config = {
  spacing: 5,
  backgroundColor: 'transparent',
  backgroundOpacity: 1,
  stroke: '#000000',
  opacity: 1,
  strokeOpacity: 1,
  lineWidth: 2,
};
const transformConfig = {
  scale: 1,
  rotate: 0,
  translateX: 0,
  translateY: 0,
};
function updatePattern(name, value) {
  const { translateX, translateY, scale, rotate } = transformConfig;
  rect.style.fill = {
    image: lines(Object.assign({}, config, name ? { [name]: value } : {})),
    repetition: 'repeat',
    transform: `translate(${translateX}, ${translateY}) rotate(${rotate}deg) scale(${scale})`,
  };
}
folder.add(config, 'spacing', 0, 20).onChange((spacing) => {
  updatePattern('spacing', spacing);
});
folder.addColor(config, 'backgroundColor').onChange((backgroundColor) => {
  updatePattern('backgroundColor', backgroundColor);
});
folder.add(config, 'backgroundOpacity', 0, 1).onChange((backgroundOpacity) => {
  updatePattern('backgroundOpacity', backgroundOpacity);
});
folder.addColor(config, 'stroke').onChange((stroke) => {
  updatePattern('stroke', stroke);
});
folder.add(config, 'opacity', 0, 1).onChange((opacity) => {
  updatePattern('opacity', opacity);
});
folder.add(config, 'strokeOpacity', 0, 1).onChange((strokeOpacity) => {
  updatePattern('strokeOpacity', strokeOpacity);
});
folder.add(config, 'lineWidth', 0, 20).onChange((lineWidth) => {
  updatePattern('lineWidth', lineWidth);
});
folder.open();

const transformFolder = gui.addFolder('transform');
transformFolder.add(transformConfig, 'scale', 0.1, 5).onChange((scale) => {
  updatePattern();
});
transformFolder.add(transformConfig, 'rotate', 0, 360).onChange((scale) => {
  updatePattern();
});
transformFolder.add(transformConfig, 'translateX', 0, 100).onChange((scale) => {
  updatePattern();
});
transformFolder.add(transformConfig, 'translateY', 0, 100).onChange((scale) => {
  updatePattern();
});
transformFolder.open();
