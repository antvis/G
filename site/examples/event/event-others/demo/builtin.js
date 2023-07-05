import { Canvas, CanvasEvent, Circle, ElementEvent, Text } from '@antv/g';
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

canvas.addEventListener(ElementEvent.INSERTED, (e) => {
  console.log('inserted', e.target);
});
canvas.addEventListener(ElementEvent.MOUNTED, (e) => {
  console.log('mounted', e.target);
});
canvas.addEventListener(ElementEvent.UNMOUNTED, (e) => {
  console.log('unmounted', e.target);
});
canvas.addEventListener(ElementEvent.REMOVED, (e) => {
  console.log('removed', e.target);
});
canvas.addEventListener(ElementEvent.DESTROY, (e) => {
  console.log('destroyed', e.target);
});

// observe root node
// const observer = new MutationObserver(() => {});
// observer.observe(canvas.document.documentElement, { childList: true });

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
let circles = [];
let removed = [];
let counter = 0;
const circleConfig = {
  insert: () => {
    let id = counter++;
    const circle = new Circle({
      id,
      style: {
        r: 40,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        cursor: 'pointer',
      },
    });
    const text = new Text({
      id: 'text',
      style: {
        fill: '#000',
        text: '' + id,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });
    circle.appendChild(text);

    circles.push(circle);
    canvas.appendChild(circle);
    circle.setPosition(300 + (circles.length - 1) * 20, 250);

    // const records = observer.takeRecords();
    // console.log(records);
  },
  remove: () => {
    const circle = circles.pop();
    if (circle) {
      removed.push(circle);
      // remove but don't destroy, can re-insert it later
      circle.remove(false);
    }
  },
  're-insert': () => {
    const circle = removed.pop();
    if (circle) {
      circles.push(circle);
      canvas.appendChild(circle);
      // const records = observer.takeRecords();
      // console.log(records);
    }
  },
  destroy: () => {
    const circle = circles.pop();
    if (circle) {
      circle.destroy();
    }
  },
};
circleFolder.add(circleConfig, 'insert');
circleFolder.add(circleConfig, 'remove');
circleFolder.add(circleConfig, 're-insert');
circleFolder.add(circleConfig, 'destroy');
circleFolder.open();
