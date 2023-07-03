import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const linearGradient = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
const radialGradient = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
const pattern =
  'p(a) https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';

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
    fill: linearGradient,
    stroke: '#F04864',
    lineWidth: 4,
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
  fill: 'linear',
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
circleFolder
  .add(circleConfig, 'fill', ['linear', 'radial', 'pattern'])
  .onChange((color) => {
    if (color === 'linear') {
      circle.style.fill = linearGradient;
    } else if (color === 'radial') {
      circle.style.fill = radialGradient;
    } else if (color === 'pattern') {
      circle.style.fill = pattern;
    }
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
circleFolder.open();

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 200,
  localPositionY: 100,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'left top',
  anchorX: 0,
  anchorY: 0,
};
transformFolder
  .add(transformConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    circle.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = circle.getLocalPosition();
    circle.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = circle.getLocalPosition();
    circle.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    circle.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    circle.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  circle.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  circle.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
