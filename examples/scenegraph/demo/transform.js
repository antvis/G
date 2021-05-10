import { Ellipse, Canvas } from '@antv/g';
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

const ellipse = new Ellipse({
  attrs: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(ellipse);

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

const ellipseFolder = gui.addFolder('Transform');
const ellipseConfig = {
  translateX: 0,
  translateY: 0,
  originX: 0,
  originY: 0,
  scale: 1,
  rotate: () => {
    ellipse.rotateLocal(10);
  },
};
ellipseFolder.add(ellipseConfig, 'translateX', -200, 200).onChange((tx) => {
  // same as:
  // ellipse.attr('x');
  // ellipse.attr('y');
  const [x, y] = ellipse.getPosition();
  // same as:
  // * ellipse.move(300 + tx, y);
  // * ellipse.moveTo(300 + tx, y);
  ellipse.setPosition(300 + tx, y);
});
ellipseFolder.add(ellipseConfig, 'translateY', -200, 200).onChange((ty) => {
  const [x, y] = ellipse.getPosition();
  // same as:
  // * ellipse.move(x, 200 + ty);
  // * ellipse.moveTo(x, 200 + ty);
  ellipse.setPosition(x, 200 + ty);
});
ellipseFolder.add(ellipseConfig, 'originX', -200, 200).onChange((tx) => {
  ellipse.setOrigin(tx, ellipseConfig.originY);
});
ellipseFolder.add(ellipseConfig, 'originY', -200, 200).onChange((ty) => {
  ellipse.setOrigin(ellipseConfig.originX, ty);
});
ellipseFolder.add(ellipseConfig, 'rotate').name('rotate');
ellipseFolder.add(ellipseConfig, 'scale', 0.2, 5).onChange((scaling) => {
  ellipse.setLocalScale(scaling);
});

ellipseFolder.open();
