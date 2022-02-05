import { Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const blur = 'blur(5px)';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

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
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    filter: blur,
  },
});

// add a circle to canvas
canvas.appendChild(circle);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterrender', () => {
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
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
  anchorX: 0.5,
  anchorY: 0.5,
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
circleFolder.add(circleConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.attr('strokeOpacity', opacity);
});
circleFolder.add(circleConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  circle.attr('anchor', [anchorX, circleConfig.anchorY]);
});
circleFolder.add(circleConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  circle.attr('anchor', [circleConfig.anchorX, anchorY]);
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
