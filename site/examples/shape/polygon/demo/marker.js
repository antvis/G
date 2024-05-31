import { Canvas, CanvasEvent, Circle, Image, Path, Polygon } from '@antv/g';
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

// create a polygon
const polygon = new Polygon({
  style: {
    points: [
      [200, 100],
      [400, 100],
      [400 + 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
      [400, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200 - 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
    ],
    fill: '#C6E5FF',
    stroke: '#1890FF',
    lineWidth: 2,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a polygon to canvas
  canvas.appendChild(polygon);
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
    x: -25,
    y: -25,
    width: 50,
    height: 50,
    transformOrigin: 'center',
    transform: 'rotate(90deg)',
    src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
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
  markerStart: 'null',
  markerEnd: 'null',
  markerMid: 'null',
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

    polygon.style.markerStart = markerStart;
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

    polygon.style.markerMid = markerMid;
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

    polygon.style.markerEnd = markerEnd;
  });
markerFolder
  .add(markerConfig, 'markerStartOffset', -20, 20)
  .onChange((markerStartOffset) => {
    polygon.style.markerStartOffset = markerStartOffset;
  });
markerFolder
  .add(markerConfig, 'markerEndOffset', -20, 20)
  .onChange((markerEndOffset) => {
    polygon.style.markerEndOffset = markerEndOffset;
  });
markerFolder.open();
