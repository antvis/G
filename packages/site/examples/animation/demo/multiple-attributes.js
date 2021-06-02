import { Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
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
});

const circle = new Circle({
  attrs: {
    x: 200,
    y: 100,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(circle);

circle.animate(
  {
    x: 500,
    y: 400,
    r: 50,
    fill: '#F04864',
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
    repeat: true,
  }
);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('postrender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setConfig({
    renderer: renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  });
});
rendererFolder.open();

const animationFolder = gui.addFolder('animation');
const animationConfig = {
  pause: () => {
    circle.pauseAnimation();
  },
  resume: () => {
    circle.resumeAnimation();
  },
  stop: () => {
    circle.stopAnimation(true);
  },
  start: () => {
    circle.attr({
      x: 200,
      y: 100,
      r: 20,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    });
    circle.animate(
      {
        x: 500,
        y: 400,
        r: 50,
        fill: '#F04864',
      },
      {
        delay: 0,
        duration: 2000,
        easing: 'easeLinear',
        callback: () => {},
        repeat: true,
      }
    );
  },
};
animationFolder.add(animationConfig, 'pause').name('Pause');
animationFolder.add(animationConfig, 'resume').name('Resume');
animationFolder.add(animationConfig, 'stop').name('Stop');
animationFolder.add(animationConfig, 'start').name('Restart');
animationFolder.open();
