import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer1 = new CanvasRenderer();
const webglRenderer1 = new WebGLRenderer();
const svgRenderer1 = new SVGRenderer();
const canvasRenderer2 = new CanvasRenderer();
const webglRenderer2 = new WebGLRenderer();
const svgRenderer2 = new SVGRenderer();

// create a canvas
const canvas1 = new Canvas({
  container: 'container',
  width: 500,
  height: 500,
  renderer: canvasRenderer1,
  supportsMutipleCanvasesInOneContainer: true,
});

const canvas2 = new Canvas({
  container: 'container',
  width: 500,
  height: 500,
  renderer: canvasRenderer2,
  supportsMutipleCanvasesInOneContainer: true,
});

canvas1.addEventListener(CanvasEvent.READY, () => {
  // create a circle
  const circle1 = new Circle({
    id: 'circle1',
    style: {
      cx: 300,
      cy: 200,
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  canvas1.appendChild(circle1);
  circle1.addEventListener('mouseenter', () => {
    circle1.attr('fill', '#2FC25B');
  });

  circle1.addEventListener('mouseleave', () => {
    circle1.attr('fill', '#1890FF');
  });
});

canvas2.addEventListener(CanvasEvent.READY, () => {
  const circle2 = new Circle({
    id: 'circle2',
    style: {
      cx: 300,
      cy: 200,
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  canvas2.appendChild(circle2);
  circle2.addEventListener('mouseenter', () => {
    circle2.attr('fill', '#2FC25B');
  });

  circle2.addEventListener('mouseleave', () => {
    circle2.attr('fill', '#1890FF');
  });
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
canvas1.addEventListener(CanvasEvent.AFTER_RENDER, () => {
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
  .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
  .onChange((renderer) => {
    canvas1.setRenderer(
      renderer === 'canvas'
        ? canvasRenderer1
        : renderer === 'webgl'
        ? webglRenderer1
        : svgRenderer1,
    );
    canvas2.setRenderer(
      renderer === 'canvas'
        ? canvasRenderer2
        : renderer === 'webgl'
        ? webglRenderer2
        : svgRenderer2,
    );
  });
rendererFolder.open();
