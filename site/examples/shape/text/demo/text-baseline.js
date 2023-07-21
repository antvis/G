import { runtime, Canvas, CanvasEvent, Rect, Text, Line, HTML } from '@antv/g';
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

// create a line of text
const text1 = new Text({
  style: {
    x: 10,
    y: 300,
    fontFamily: 'PingFang SC',
    text: 'gah国',
    textBaseline: 'alphabetic',
    fontSize: 24,
    fill: '#1890FF',
    // stroke: '#F04864',
    // lineWidth: 5,
  },
});
const html1 = new HTML({
  style: {
    x: 10,
    y: 200,
    width: 100,
    height: 30,
    innerHTML: 'alphabetic',
  },
});

const text2 = text1.cloneNode();
text2.style.x = 110;
text2.style.textBaseline = 'top';
const html2 = new HTML({
  style: {
    x: 110,
    y: 200,
    width: 100,
    height: 30,
    innerHTML: 'top',
  },
});

const text3 = text1.cloneNode();
text3.style.x = 210;
text3.style.textBaseline = 'middle';
const html3 = new HTML({
  style: {
    x: 210,
    y: 200,
    width: 100,
    height: 30,
    innerHTML: 'middle',
  },
});

const text4 = text1.cloneNode();
text4.style.x = 310;
text4.style.textBaseline = 'bottom';
const html4 = new HTML({
  style: {
    x: 310,
    y: 200,
    width: 100,
    height: 30,
    innerHTML: 'bottom',
  },
});

// baseline
const line = new Line({
  style: {
    x1: 0,
    y1: 300,
    x2: 600,
    y2: 300,
    stroke: 'black',
    strokeWidth: 2,
  },
});

// display bounds
const bounds1 = new Rect({
  style: {
    stroke: 'black',
    lineWidth: 2,
  },
});
const bounds2 = new Rect({
  style: {
    stroke: 'black',
    lineWidth: 2,
  },
});
const bounds3 = new Rect({
  style: {
    stroke: 'black',
    lineWidth: 2,
  },
});
const bounds4 = new Rect({
  style: {
    stroke: 'black',
    lineWidth: 2,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(bounds1);
  canvas.appendChild(text1);
  canvas.appendChild(html1);

  canvas.appendChild(bounds2);
  canvas.appendChild(text2);
  canvas.appendChild(html2);

  canvas.appendChild(bounds3);
  canvas.appendChild(text3);
  canvas.appendChild(html3);

  canvas.appendChild(bounds4);
  canvas.appendChild(text4);
  canvas.appendChild(html4);

  canvas.appendChild(line);
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

  const bounding1 = text1.getBounds();
  if (bounding1) {
    const { center, halfExtents } = bounding1;
    bounds1.attr('width', halfExtents[0] * 2);
    bounds1.attr('height', halfExtents[1] * 2);
    bounds1.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
  }

  const bounding2 = text2.getBounds();
  if (bounding2) {
    const { center, halfExtents } = bounding2;
    bounds2.attr('width', halfExtents[0] * 2);
    bounds2.attr('height', halfExtents[1] * 2);
    bounds2.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
  }
  const bounding3 = text3.getBounds();
  if (bounding3) {
    const { center, halfExtents } = bounding3;
    bounds3.attr('width', halfExtents[0] * 2);
    bounds3.attr('height', halfExtents[1] * 2);
    bounds3.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
  }
  const bounding4 = text4.getBounds();
  if (bounding4) {
    const { center, halfExtents } = bounding4;
    bounds4.attr('width', halfExtents[0] * 2);
    bounds4.attr('height', halfExtents[1] * 2);
    bounds4.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
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

const textFolder = gui.addFolder('text');
const textConfig = {
  fontSize: 24,
};
textFolder.add(textConfig, 'fontSize', 10, 100).onChange((fontSize) => {
  [text1, text2, text3, text4].forEach((text) => {
    text.attr('fontSize', fontSize);
  });
});
