import { Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
  // supportPointerEvent: false,
  // supportTouchEvent: true,
});

// add a circle to canvas
const circle = new Circle({
  style: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(circle);

circle.addEventListener('touchstart', function (e) {
  console.log('touchstart');
  console.log('touches', e.touches);
  console.log('changedTouches', e.changedTouches);
  console.log('targetTouches', e.targetTouches);
  console.log('nativeEvent', e.nativeEvent);
  circle.style.fill = '#2FC25B';
});

circle.addEventListener('touchmove', (e) => {
  console.log('touchmove');
  console.log('touches', e.touches);
  console.log('changedTouches', e.changedTouches);
  console.log('targetTouches', e.targetTouches);
  console.log('nativeEvent', e.nativeEvent);
});

circle.addEventListener('touchend', function (e) {
  console.log('touchend');
  console.log('touches', e.touches);
  console.log('changedTouches', e.changedTouches);
  console.log('targetTouches', e.targetTouches);
  console.log('nativeEvent', e.nativeEvent);
  circle.style.fill = '#1890FF';
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
canvas.on('afterrender', () => {
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
