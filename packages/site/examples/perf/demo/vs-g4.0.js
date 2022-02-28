import { Circle, Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * compared with G 4.0 ～20FPS
 * @see https://codesandbox.io/s/g-canvas-particles-2w-jyiie?file=/src/index.tsx
 */

const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

let nodesNum = 2000;
for (let i = 0; i < nodesNum; i++) {
  canvas.appendChild(
    new Circle({
      attrs: {
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        r: 2,
        x: Math.random() * 600,
        y: Math.random() * 500,
        lineWidth: 0.3,
      },
    }),
  );
}

const camera = canvas.getCamera();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }

  camera.rotate(0, 0, 1);
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
