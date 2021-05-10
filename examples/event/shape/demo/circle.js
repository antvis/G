import { Circle, Canvas } from '@antv/g';
import { RENDERER as CANVAS_RENDERER } from '@antv/g-renderer-canvas';
import { RENDERER as WEBGL_RENDERER } from '@antv/g-renderer-webgl';
import { RENDERER as SVG_RENDERER } from '@antv/g-renderer-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: CANVAS_RENDERER,
});

// add a circle to canvas
const circle = new Circle({
  attrs: {
    x: 300,
    y: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});

canvas.appendChild(circle);

circle.on('mouseenter', () => {
  circle.attr('fill', '#2FC25B');
});

circle.on('mouseleave', () => {
  circle.attr('fill', '#1890FF');
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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  capture: true,
  visible: true,
};
circleFolder.add(circleConfig, 'visible').onChange((visible) => {
  if (visible) {
    circle.show();
  } else {
    circle.hide();
  }
});
circleFolder.add(circleConfig, 'capture').onChange((capture) => {
  circle.set('capture', capture);
});
circleFolder.open();
