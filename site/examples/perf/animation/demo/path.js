import { Canvas, CanvasEvent, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * G4.0 @see https://tnwwc1.csb.app/
 * @see https://codesandbox.io/s/g-canvas-4-0-animation2-tnwwc1?file=/src/index.tsx
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 500;
    const path = canvas.appendChild(
      new Path({
        style: {
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          d: `M${54.4462133232839 + x},${-6.41757177038063 + y} L${
            61.3765714868427 + x
          },${6.41757177038063 + y} M${61.3765714868427 + x},${
            6.41757177038063 + y
          } L${61.54285370420826 + x},${0.5852759906612777 + y}M${
            61.3765714868427 + x
          },${6.41757177038063 + y}L${56.4087962879037 + x},${
            3.3574192560847824 + y
          }`,
        },
      }),
    );

    path.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 1000,
      delay: 1000,
      fill: 'both',
      iterations: 5,
    });
  }
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
