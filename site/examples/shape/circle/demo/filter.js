import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const blur = 'blur(5px)';

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

// create a circle
const circle = new Circle({
  style: {
    cx: 300,
    cy: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    filter: blur,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a circle to canvas
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
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
};
circleFolder.add(circleConfig, 'r', 50, 200).onChange((radius) => {
  circle.style.r = radius;
});
circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
  circle.style.fill = color;
});
circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
  circle.attr('stroke', color);
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circle.attr('lineWidth', lineWidth);
});
circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.attr('fillOpacity', opacity);
});
circleFolder
  .add(circleConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    circle.attr('strokeOpacity', opacity);
  });

const blurFolder = gui.addFolder('blur');
const blurConfig = {
  enable: true,
  radius: 5,
};
blurFolder.add(blurConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
blurFolder.add(blurConfig, 'radius', 0, 20).onChange(() => {
  circle.style.filter = generateFilter();
});
blurFolder.open();

const brightnessFolder = gui.addFolder('brightness');
const brightnessConfig = {
  enable: false,
  brightness: 1,
};
brightnessFolder.add(brightnessConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
brightnessFolder.add(brightnessConfig, 'brightness', 0, 4, 0.1).onChange(() => {
  circle.style.filter = generateFilter();
});
brightnessFolder.open();

const dropShadowFolder = gui.addFolder('drop-shadow');
const dropShadowConfig = {
  enable: false,
  offsetX: 0,
  offsetY: 0,
  radius: 0,
  color: '#000',
};
dropShadowFolder.add(dropShadowConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
dropShadowFolder.add(dropShadowConfig, 'offsetX', -10, 10).onChange(() => {
  circle.style.filter = generateFilter();
});
dropShadowFolder.add(dropShadowConfig, 'offsetY', -10, 10).onChange(() => {
  circle.style.filter = generateFilter();
});
dropShadowFolder.add(dropShadowConfig, 'radius', 0, 10).onChange(() => {
  circle.style.filter = generateFilter();
});
dropShadowFolder.addColor(dropShadowConfig, 'color').onChange(() => {
  circle.style.filter = generateFilter();
});
dropShadowFolder.open();

const contrastFolder = gui.addFolder('contrast');
const contrastConfig = {
  enable: false,
  contrast: 1,
};
contrastFolder.add(contrastConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
contrastFolder.add(contrastConfig, 'contrast', 0, 4, 0.1).onChange(() => {
  circle.style.filter = generateFilter();
});
contrastFolder.open();

const grayscaleFolder = gui.addFolder('grayscale');
const grayscaleConfig = {
  enable: false,
  grayscale: 0,
};
grayscaleFolder.add(grayscaleConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
grayscaleFolder.add(grayscaleConfig, 'grayscale', 0, 1, 0.1).onChange(() => {
  circle.style.filter = generateFilter();
});
grayscaleFolder.open();

const sepiaFolder = gui.addFolder('sepia');
const sepiaConfig = {
  enable: false,
  sepia: 0,
};
sepiaFolder.add(sepiaConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
sepiaFolder.add(sepiaConfig, 'sepia', 0, 1, 0.1).onChange(() => {
  circle.style.filter = generateFilter();
});
sepiaFolder.open();

const saturateFolder = gui.addFolder('saturate');
const saturateConfig = {
  enable: false,
  saturate: 0,
};
saturateFolder.add(saturateConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
saturateFolder.add(saturateConfig, 'saturate', 0, 1, 0.1).onChange(() => {
  circle.style.filter = generateFilter();
});
saturateFolder.open();

const hueRotateFolder = gui.addFolder('hue-rotate');
const hueRotateConfig = {
  enable: false,
  angle: 0,
};
hueRotateFolder.add(hueRotateConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
hueRotateFolder.add(hueRotateConfig, 'angle', 0, 360).onChange(() => {
  circle.style.filter = generateFilter();
});
hueRotateFolder.open();

const invertFolder = gui.addFolder('invert');
const invertConfig = {
  enable: false,
  amount: 0,
};
invertFolder.add(invertConfig, 'enable').onChange(() => {
  circle.style.filter = generateFilter();
});
invertFolder.add(invertConfig, 'amount', 0, 1, 0.1).onChange(() => {
  circle.style.filter = generateFilter();
});
invertFolder.open();

const generateFilter = () => {
  return [
    blurConfig.enable ? `blur(${blurConfig.radius}px)` : '',
    brightnessConfig.enable ? `brightness(${brightnessConfig.brightness})` : '',
    dropShadowConfig.enable
      ? `drop-shadow(${dropShadowConfig.offsetX}px ${dropShadowConfig.offsetY}px ${dropShadowConfig.radius}px ${dropShadowConfig.color})`
      : '',
    contrastConfig.enable ? `contrast(${contrastConfig.contrast})` : '',
    grayscaleConfig.enable ? `grayscale(${grayscaleConfig.grayscale})` : '',
    sepiaConfig.enable ? `sepia(${sepiaConfig.sepia})` : '',
    saturateConfig.enable ? `saturate(${saturateConfig.saturate})` : '',
    hueRotateConfig.enable ? `hue-rotate(${hueRotateConfig.angle}deg)` : '',
    invertConfig.enable ? `invert(${invertConfig.amount})` : '',
  ].join(' ');
};
