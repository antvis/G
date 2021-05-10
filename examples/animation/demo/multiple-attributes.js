import { Circle, Canvas } from '@antv/g';
import { RENDERER as CANVAS_RENDERER } from '@antv/g-renderer-canvas';
import { RENDERER as WEBGL_RENDERER } from '@antv/g-renderer-webgl';
import { RENDERER as SVG_RENDERER } from '@antv/g-renderer-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: CANVAS_RENDERER,
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
  renderer: CANVAS_RENDERER,
};
rendererFolder.add(rendererConfig, 'renderer', [CANVAS_RENDERER, WEBGL_RENDERER, SVG_RENDERER]).onChange((renderer) => {
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
