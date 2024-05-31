import {
  Canvas,
  CanvasEvent,
  Circle,
  convertToPath,
  Ellipse,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
} from '@antv/g';
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

/**
 * show converted path in blue
 */
const showConvertedPath = (object) => {
  const pathStr = convertToPath(object);
  const objectPath = new Path({
    style: {
      d: pathStr,
      fill: 'none',
      stroke: 'blue',
      lineWidth: 10,
    },
  });
  canvas.appendChild(objectPath);
};

/**
 * Circle -> Path
 */
const circle = new Circle({
  style: {
    cx: 0,
    cy: 0,
    r: 100,
    transform: 'translate(100, 100)',
    fill: 'red',
    opacity: 0.5,
  },
});
canvas.appendChild(circle);
circle.scale(0.5);
showConvertedPath(circle);

/**
 * Ellipse -> Path
 */
const ellipse = new Ellipse({
  style: {
    cx: 0,
    cy: 0,
    rx: 100,
    ry: 60,
    fill: 'red',
    opacity: 0.5,
  },
});
ellipse.setPosition(300, 100);
ellipse.setLocalScale(0.6);
canvas.appendChild(ellipse);
showConvertedPath(ellipse);

/**
 * Rect -> Path
 */
const rect = new Rect({
  style: {
    x: 200,
    y: 100,
    width: 100,
    height: 100,
    fill: 'red',
    opacity: 0.5,
    transformOrigin: '200 100',
  },
});
canvas.appendChild(rect);
rect.rotateLocal(30);
showConvertedPath(rect);

/**
 * Line -> Path
 */
const line = new Line({
  style: {
    x1: 100,
    y1: 200,
    x2: 100,
    y2: 300,
    lineWidth: 30,
    stroke: 'red',
    opacity: 0.5,
  },
});
canvas.appendChild(line);
showConvertedPath(line);

/**
 * Polyline -> Path
 */
const polyline = new Polyline({
  style: {
    points: '100,360 100,400, 50,400',
    lineWidth: 30,
    stroke: 'red',
    opacity: 0.5,
    transformOrigin: 'center',
  },
});
canvas.appendChild(polyline);
polyline.rotateLocal(90);
showConvertedPath(polyline);

/**
 * Polyline -> Path
 */
const polygon = new Polygon({
  style: {
    points: '200,360 200,400, 250,400',
    fill: 'red',
    transform: 'scale(2)',
    transformOrigin: '200 360',
    opacity: 0.5,
  },
});
canvas.appendChild(polygon);
showConvertedPath(polygon);

/**
 * Path -> Path
 */
const path = new Path({
  style: {
    d: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011Z',
    fill: 'red',
    opacity: 0.5,
  },
});
path.translate(300, 250);
path.scale(0.2);
canvas.appendChild(path);
showConvertedPath(path);

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
