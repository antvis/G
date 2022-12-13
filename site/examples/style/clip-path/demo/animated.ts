import { Canvas, CanvasEvent, Circle, Group } from '@antv/g';
import { Sector } from '@antv/g-components';
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
const webgpuRenderer = new WebGPURenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const sector = new Sector({
  style: {
    x: 150,
    y: 100,
    lineWidth: 1,
    sr: 100,
    startAngle: -90,
    fill: 'yellow',
    opacity: 0.5,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const group = new Group({
    style: {
      clipPath: sector,
    },
  });
  const circle1 = new Circle({
    style: {
      fill: 'red',
      cx: 100,
      cy: 100,
      r: 20,
    },
  });
  const circle2 = new Circle({
    style: {
      fill: 'red',
      cx: 150,
      cy: 100,
      r: 20,
    },
  });
  canvas.appendChild(group);
  group.appendChild(circle1);
  group.appendChild(circle2);
  canvas.appendChild(sector);

  sector.animate(
    [
      {
        endAngle: -90,
      },
      {
        endAngle: 270,
      },
    ],
    {
      duration: 1000,
      iterations: Infinity,
      fill: 'both',
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
