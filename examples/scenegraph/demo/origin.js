import { Rect, Circle, Text, Canvas, RENDERER } from '@antv/g';
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

const rect = new Rect({
  id: 'rect',
  attrs: {
    x: 200,
    y: 100,
    width: 300,
    height: 200,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
  },
});

const origin = new Circle({
  id: 'origin',
  attrs: {
    x: 200,
    y: 100,
    r: 30,
    fill: '#F04864',
  },
});
const originText = new Text({
  attrs: {
    fontFamily: 'PingFang SC',
    text: 'Origin',
    fontSize: 16,
    fill: '#fFF',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});

origin.appendChild(originText);

canvas.appendChild(rect);
canvas.appendChild(origin);

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
  rect.rotateLocal(1);
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

const rectFolder = gui.addFolder('Origin');
const rectConfig = {
  originX: 0,
  originY: 0,
};
rectFolder.add(rectConfig, 'originX', -200, 200).onChange((tx) => {
  rect.setOrigin(tx, rectConfig.originY);

  origin.setPosition(200 + tx, 100 + rectConfig.originY);
});
rectFolder.add(rectConfig, 'originY', -200, 200).onChange((ty) => {
  rect.setOrigin(rectConfig.originX, ty);

  origin.setPosition(200 + rectConfig.originX, 100 + ty);
});
rectFolder.open();
