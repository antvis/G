import { Canvas, Rect, Group, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import Stats from 'stats.js';
import * as lil from 'lil-gui';

const canvasRenderer = new CanvasRenderer({
  enableRenderingOptimization: true,
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const { width, height } = canvas.getConfig();
  const root = new Group();
  const count = 1e4;
  let rects = [];

  function update() {
    const rectsToRemove = [];

    for (let i = 0; i < count; i++) {
      const rect = rects[i];
      rect.x -= rect.speed;
      rect.el.setAttribute('x', rect.x);
      if (rect.x + rect.size < 0) rectsToRemove.push(i);
    }

    rectsToRemove.forEach((i) => {
      rects[i].x = width + rects[i].size / 2;
    });
  }

  function render() {
    root.destroyChildren();
    rects = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 40;
      const speed = 1 + Math.random();

      const rect = new Rect({
        style: {
          x,
          y,
          width: size,
          height: size,
          fill: 'white',
          stroke: '#000',
          lineWidth: 1,
        },
      });
      root.appendChild(rect);
      rects[i] = { x, y, size, speed, el: rect };
    }
  }

  render();
  canvas.addEventListener(CanvasEvent.BEFORE_RENDER, () => update());

  canvas.appendChild(root);

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
  enableRenderingOptimization: canvas.getConfig().renderer.getConfig()
    .enableRenderingOptimization,
};
gui.add(canvasConfig, 'enableRenderingOptimization').onChange((value) => {
  canvas.getConfig().renderer.getConfig().enableRenderingOptimization = value;
});
