import { Canvas, CanvasEvent, Circle, Group, Path, Rect } from '@antv/g';
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

// in user space
const clipPathCircle = new Circle({
  style: {
    cx: 150,
    cy: 150,
    r: 35,
    fill: 'blue',
    transformOrigin: 'center',
  },
});

const rect1 = new Rect({
  style: {
    x: 0,
    y: 0,
    width: 45,
    height: 45,
    stroke: 'white',
    strokeWidth: 2,
    fill: 'red',
    clipPath: clipPathCircle,
    cursor: 'pointer',
    // transform: 'translate(200px, 200px)',
  },
});
const rect2 = rect1.cloneNode();
rect2.style.y = 55;
const rect3 = rect1.cloneNode();
rect3.style.x = 55;
rect3.style.y = 55;
const rect4 = rect1.cloneNode();
rect4.style.x = 55;
rect4.style.y = 0;

const clipPathRect = new Rect({
  style: {
    x: 125,
    y: 125,
    width: 50,
    height: 50,
  },
});
const clipPath = new Path({
  style: {
    stroke: 'black',
    lineWidth: 2,
    d: 'M 10,10 L -10,0 L 10,-10 Z',
  },
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const g = new Group();

canvas.addEventListener(CanvasEvent.READY, () => {
  const group = new Group({
    style: {
      transform: `translate(100, 100)`,
    },
  });
  g.appendChild(clipPathCircle);
  group.appendChild(rect1);
  group.appendChild(rect2);
  group.appendChild(rect3);
  group.appendChild(rect4);
  g.appendChild(group);

  canvas.appendChild(g);

  // g.style.x = 200;
  // g.style.y = 200;

  clipPathCircle.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(2)' }],
    {
      duration: 1500,
      iterations: Infinity,
    },
  );
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

const circleClipFolder = gui.addFolder('Circle as clipPath');
const circleClipConfig = {
  r: 50,
};
circleClipFolder.add(circleClipConfig, 'r', 0, 100).onChange((r) => {
  clipPathCircle.style.r = r;
});
circleClipFolder.open();

const clippedShapesFolder = gui.addFolder('Clipped shapes');
const clippedShapesConfig = {
  rect1: 'circle',
  rect2: 'circle',
  rect3: 'circle',
  rect4: 'circle',
};
[rect1, rect2, rect3, rect4].forEach((rect, index) => {
  clippedShapesFolder
    .add(clippedShapesConfig, `rect${index + 1}`, [
      'circle',
      'rect',
      'path',
      'null',
    ])
    .onChange((type) => {
      switch (type) {
        case 'circle':
          rect.style.clipPath = clipPathCircle;
          break;
        case 'rect':
          rect.style.clipPath = clipPathRect;
          break;
        case 'path':
          rect.style.clipPath = clipPath;
          break;
        case 'null': // clear clip path
          rect.style.clipPath = null;
          // rect.setClip(null);
          break;
      }
    });
});
clippedShapesFolder.open();
