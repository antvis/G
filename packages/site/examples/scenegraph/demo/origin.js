import { Rect, Circle, Text, Canvas } from '@antv/g';
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

const rect = new Rect({
  id: 'rect',
  style: {
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
  style: {
    r: 30,
    fill: '#F04864',
  },
});
const originText = new Text({
  id: 'text',
  style: {
    fontFamily: 'PingFang SC',
    text: 'Origin',
    fontSize: 16,
    fill: '#fFF',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});

origin.appendChild(originText);
origin.setPosition(200, 100);

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
canvas.on('afterrender', () => {
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
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const rectFolder = gui.addFolder('Origin');
const rectConfig = {
  originX: 0,
  originY: 0,
  transformOrigin: 'left top',
};
rectFolder
  .add(rectConfig, 'transformOrigin', ['left top', 'center', 'right bottom', '150px 100px'])
  .onChange((transformOrigin) => {
    rect.style.transformOrigin = transformOrigin;

    if (transformOrigin === 'left top') {
      origin.setPosition(200, 100);
    } else if (transformOrigin === 'center') {
      origin.setPosition(200 + 150, 100 + 100);
    } else if (transformOrigin === 'right bottom') {
      origin.setPosition(200 + 300, 100 + 200);
    } else if (transformOrigin === '150px 100px') {
      origin.setPosition(200 + 150, 100 + 100);
    }
  });
rectFolder.add(rectConfig, 'originX', -200, 200).onChange((tx) => {
  rect.style.origin = [tx, rectConfig.originY];
  origin.setPosition(200 + tx, 100 + rectConfig.originY);
});
rectFolder.add(rectConfig, 'originY', -200, 200).onChange((ty) => {
  rect.style.origin = [rectConfig.originX, ty];
  origin.setPosition(200 + rectConfig.originX, 100 + ty);
});
rectFolder.open();
