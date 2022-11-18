import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin } from '@antv/g-plugin-dragndrop';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Drag and Drop Stress Test with 10,000 Shapes
 * @see https://konvajs.org/docs/sandbox/Drag_and_Drop_Stress_Test.html
 */

const plugin = new Plugin();

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(plugin);
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
canvaskitRenderer.registerPlugin(plugin);
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(plugin);
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(plugin);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple'];
  for (let i = 0; i < 10000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 600,
        cy: Math.random() * 500,
        r: 6,
        fill: colors[i % colors.length],
        draggable: true,
      },
    });
    canvas.appendChild(circle);
  }
});

let shiftX = 0;
let shiftY = 0;
function moveAt(target, canvasX, canvasY) {
  target.setPosition(canvasX - shiftX, canvasY - shiftY);
}

canvas.addEventListener('dragstart', function (e) {
  const [x, y] = e.target.getPosition();
  shiftX = e.canvasX - x;
  shiftY = e.canvasY - y;

  moveAt(e.target, e.canvasX, e.canvasY);
});
canvas.addEventListener('drag', function (e) {
  moveAt(e.target, e.canvasX, e.canvasY);
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
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
