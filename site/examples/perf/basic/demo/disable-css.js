import {
  runtime,
  Canvas,
  CanvasEvent,
  Circle,
  Image,
  Line,
  Path,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

runtime.enableCSSParsing = false;

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

const arrowMarker = new Path({
  style: {
    path: 'M 10,10 L -10,0 L 10,-10 Z',
    stroke: '#1890FF',
    lineWidth: 2,
    anchor: '0.5 0.5',
    transformOrigin: 'center',
  },
});
const circleMarker = new Circle({
  style: {
    r: 10,
    stroke: '#1890FF',
  },
});
const imageMarker = new Image({
  style: {
    width: 50,
    height: 50,
    anchor: [0.5, 0.5],
    transformOrigin: 'center',
    transform: 'rotate(90deg)',
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});

const arrowLine = new Line({
  style: {
    x1: 200,
    y1: 250,
    x2: 400,
    y2: 250,
    stroke: '#1890FF',
    lineWidth: 2,
    cursor: 'pointer',
    markerStart: arrowMarker,
    markerEnd: circleMarker,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(arrowLine);
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

const markerFolder = gui.addFolder('marker');
const markerConfig = {
  markerStart: 'path',
  markerEnd: 'circle',
  markerStartOffset: 0,
  markerEndOffset: 0,
  x1: 200,
  y1: 250,
  x2: 400,
  y2: 250,
};
markerFolder
  .add(markerConfig, 'markerStart', ['path', 'circle', 'image', 'null'])
  .onChange((markerStartStr) => {
    let markerStart;
    if (markerStartStr === 'path') {
      markerStart = arrowMarker;
    } else if (markerStartStr === 'circle') {
      markerStart = circleMarker;
    } else if (markerStartStr === 'image') {
      markerStart = imageMarker;
    } else {
      markerStart = null;
    }

    arrowLine.style.markerStart = markerStart;
  });
markerFolder
  .add(markerConfig, 'markerEnd', ['path', 'circle', 'image', 'null'])
  .onChange((markerEndStr) => {
    let markerEnd;
    if (markerEndStr === 'path') {
      markerEnd = arrowMarker;
    } else if (markerEndStr === 'circle') {
      markerEnd = circleMarker;
    } else if (markerEndStr === 'image') {
      markerEnd = imageMarker;
    } else {
      markerEnd = null;
    }

    arrowLine.style.markerEnd = markerEnd;
  });
markerFolder
  .add(markerConfig, 'markerStartOffset', -20, 20)
  .onChange((markerStartOffset) => {
    arrowLine.style.markerStartOffset = markerStartOffset;
  });
markerFolder
  .add(markerConfig, 'markerEndOffset', -20, 20)
  .onChange((markerEndOffset) => {
    arrowLine.style.markerEndOffset = markerEndOffset;
  });
markerFolder.add(markerConfig, 'x1', 0, 400).onChange((x1) => {
  arrowLine.style.x1 = x1;
});
markerFolder.add(markerConfig, 'y1', 0, 400).onChange((y1) => {
  arrowLine.style.y1 = y1;
});
markerFolder.add(markerConfig, 'x2', 0, 400).onChange((x2) => {
  arrowLine.style.x2 = x2;
});
markerFolder.add(markerConfig, 'y2', 0, 400).onChange((y2) => {
  arrowLine.style.y2 = y2;
});
markerFolder.open();
