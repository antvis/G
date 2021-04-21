import { Circle, Canvas, RENDERER } from '@antv/g';
import '@antv/g-renderer-canvas';
import '@antv/g-renderer-webgl';
import '@antv/g-renderer-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: RENDERER.Canvas,
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
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: RENDERER.Canvas,
};
rendererFolder.add(rendererConfig, 'renderer', [RENDERER.Canvas, RENDERER.WebGL, RENDERER.SVG]).onChange((renderer) => {
  canvas.setConfig({
    renderer,
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
