import { Canvas, CanvasEvent, Text } from '@antv/g';
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

// create a line of text
const text = new Text({
  style: {
    x: 100,
    y: 300,
    fontFamily: 'PingFang SC',
    text: '这是测试文本\nThis is text',
    fontSize: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 5,
    wordWrap: true,
    wordWrapWidth: 280,
    maxLines: 2,
    textOverflow: 'ellipsis',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(text);
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

const multilineFolder = gui.addFolder('multiline');
const multilineConfig = {
  wordWrap: true,
  wordWrapWidth: 280,
  maxLines: 2,
  textOverflow: 'ellipsis',
  lineHeight: 0,
  leading: 0,
  textAlign: 'start',
};
multilineFolder.add(multilineConfig, 'wordWrap').onChange((wordWrap) => {
  text.attr('wordWrap', wordWrap);
});

multilineFolder
  .add(multilineConfig, 'wordWrapWidth', 0, 500)
  .onChange((wordWrapWidth) => {
    text.attr('wordWrapWidth', wordWrapWidth);
  });
multilineFolder
  .add(multilineConfig, 'maxLines', 1, 10, 1)
  .onChange((maxLines) => {
    text.attr('maxLines', maxLines);
  });
multilineFolder
  .add(multilineConfig, 'textOverflow')
  .onChange((textOverflow) => {
    text.attr('textOverflow', textOverflow);
  });
multilineFolder
  .add(multilineConfig, 'lineHeight', 0, 100)
  .onChange((lineHeight) => {
    text.attr('lineHeight', lineHeight);
  });
multilineFolder.add(multilineConfig, 'leading', 0, 30).onChange((leading) => {
  text.attr('leading', leading);
});
multilineFolder
  .add(multilineConfig, 'textAlign', [
    'start',
    'end',
    'center',
    'left',
    'right',
  ])
  .onChange((textAlign) => {
    text.attr('textAlign', textAlign);
  });
