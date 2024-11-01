import { Canvas, CanvasEvent, Image } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import Stats from 'stats.js';
import * as lil from 'lil-gui';

const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const image = new Image({
    style: {
      x: 0,
      y: 0,
      // 16151/6971, 11.4MB
      src: 'https://mdn.alipayobjects.com/huamei_fr7vu1/afts/img/A*SqloToP7R9QAAAAAAAAAAAAADkn0AQ/original',
    },
  });

  canvas.appendChild(image);

  // ---
  const $dom = canvas.getContextService().getDomElement();
  let currentZoom = 1;
  let isDragging = false;
  let lastX;
  let lastY;

  $dom.style.border = '1px solid gray';

  $dom.addEventListener('wheel', (event) => {
    event.preventDefault();

    const { deltaX, deltaY } = event;
    const d = -(deltaX || deltaY);

    const ratio = 1 + (Math.min(Math.max(d, -50), 50) * 1) / 100;
    const zoom = canvas.getCamera().getZoom();
    currentZoom = zoom * ratio;

    canvas
      .getCamera()
      .setZoomByViewportPoint(currentZoom, [event.offsetX, event.offsetY]);
  });

  $dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  $dom.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      canvas.getCamera().pan(-dx / currentZoom, -dy / currentZoom);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  $dom.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // ---
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
const canvasConfig = {
  enableLargeImageOptimization: false,
};
gui.add(canvasConfig, 'enableLargeImageOptimization').onChange((result) => {
  canvas.context.config.enableLargeImageOptimization = result;
});
