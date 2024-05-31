import { Canvas, CanvasEvent, Circle, Image, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

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

const arrowMarker = new Path({
  style: {
    d: 'M 10,10 L -10,0 L 10,-10 Z',
    stroke: '#1890FF',
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

const path = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    d: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
    markerStart: arrowMarker,
    markerMid: circleMarker,
    markerEnd: arrowMarker,
  },
});
path.translate(100, 100);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(path);
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
  markerEnd: 'path',
  markerMid: 'circle',
  markerStartOffset: 0,
  markerEndOffset: 0,
};
markerFolder
  .add(markerConfig, 'markerStart', ['path', 'circle', 'image', 'null'])
  .onChange((markerStartStr) => {
    let markerStart;
    if (markerStartStr === 'path') {
      markerStart = arrowMarker.cloneNode();
    } else if (markerStartStr === 'circle') {
      markerStart = circleMarker.cloneNode();
    } else if (markerStartStr === 'image') {
      markerStart = imageMarker.cloneNode();
    } else {
      markerStart = null;
    }

    path.style.markerStart = markerStart;
  });
markerFolder
  .add(markerConfig, 'markerMid', ['path', 'circle', 'image', 'null'])
  .onChange((markerMidStr) => {
    let markerMid;
    if (markerMidStr === 'path') {
      markerMid = arrowMarker.cloneNode();
    } else if (markerMidStr === 'circle') {
      markerMid = circleMarker.cloneNode();
    } else if (markerMidStr === 'image') {
      markerMid = imageMarker.cloneNode();
    } else {
      markerMid = null;
    }

    path.style.markerMid = markerMid;
  });
markerFolder
  .add(markerConfig, 'markerEnd', ['path', 'circle', 'image', 'null'])
  .onChange((markerEndStr) => {
    let markerEnd;
    if (markerEndStr === 'path') {
      markerEnd = arrowMarker.cloneNode();
    } else if (markerEndStr === 'circle') {
      markerEnd = circleMarker.cloneNode();
    } else if (markerEndStr === 'image') {
      markerEnd = imageMarker.cloneNode();
    } else {
      markerEnd = null;
    }

    path.style.markerEnd = markerEnd;
  });
markerFolder
  .add(markerConfig, 'markerStartOffset', -20, 20)
  .onChange((markerStartOffset) => {
    path.style.markerStartOffset = markerStartOffset;
  });
markerFolder
  .add(markerConfig, 'markerEndOffset', -20, 20)
  .onChange((markerEndOffset) => {
    path.style.markerEndOffset = markerEndOffset;
  });
markerFolder.open();
