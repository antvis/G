import { Canvas, CanvasEvent, Rect, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// ul1 -> li1
//     -> li2
// ul2 -> li3

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

canvas.addEventListener(CanvasEvent.READY, () => {
  const ul1 = new Rect({
    id: 'ul1',
    style: {
      width: 400,
      height: 200,
      fill: 'blue',
    },
  });
  const ul1Text = new Text({
    id: 'ui1-text',
    style: {
      text: 'ul1',
      fontSize: 16,
      fill: 'white',
    },
  });
  const ul2 = new Rect({
    id: 'ul2',
    style: {
      width: 300,
      height: 250,
      fill: '#1890FF',
      lineWidth: 4,
      stroke: 'white',
    },
  });
  const ul2Text = new Text({
    id: 'ui2-text',
    style: {
      text: 'ul2',
      fontSize: 16,
      fill: 'white',
    },
  });

  const li1 = new Rect({
    id: 'li1',
    style: {
      width: 200,
      height: 50,
      fill: '#1890FF',
      lineWidth: 4,
      stroke: 'white',
    },
  });
  const li1Text = new Text({
    id: 'li1-text',
    style: {
      text: 'li1',
      fontSize: 16,
      fill: 'white',
    },
  });
  const li2 = new Rect({
    id: 'li2',
    style: {
      width: 200,
      height: 50,
      fill: '#1890FF',
      lineWidth: 4,
      stroke: 'white',
    },
  });
  const li2Text = new Text({
    id: 'li2-text',
    style: {
      text: 'li2',
      fontSize: 16,
      fill: 'white',
    },
  });

  ul1Text.translateLocal(260, 20);
  ul1.appendChild(ul1Text);
  ul1.setPosition(50, 50);
  li1Text.translateLocal(10, 20);
  li1.appendChild(li1Text);
  li2Text.translateLocal(10, 20);
  li2.appendChild(li2Text);
  li2.translateLocal(20, 30);
  ul1.appendChild(li1);
  ul1.appendChild(li2);

  ul2Text.translateLocal(60, 20);
  ul2.appendChild(ul2Text);
  ul2.setPosition(200, 100);

  canvas.appendChild(ul1);
  canvas.appendChild(ul2);

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

  const zIndexFolder = gui.addFolder('z-index');
  const zIndexConfig = {
    li1ZIndex: 0,
    li2ZIndex: 0,
    ul1ZIndex: 0,
    ul2ZIndex: 0,
  };
  zIndexFolder.add(zIndexConfig, 'li1ZIndex', 0, 100).onChange((zIndex) => {
    li1.style.zIndex = zIndex;
  });
  zIndexFolder.add(zIndexConfig, 'li2ZIndex', 0, 100).onChange((zIndex) => {
    li2.style.zIndex = zIndex;
  });
  zIndexFolder.add(zIndexConfig, 'ul1ZIndex', 0, 100).onChange((zIndex) => {
    ul1.style.zIndex = zIndex;
  });
  zIndexFolder.add(zIndexConfig, 'ul2ZIndex', 0, 100).onChange((zIndex) => {
    ul2.style.zIndex = zIndex;
  });
  zIndexFolder.open();
});
