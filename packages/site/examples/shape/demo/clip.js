import { Image, Circle, Rect, Path, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// clip path shape
const clipPathCircle = new Circle({
  attrs: {
    x: 100,
    y: 100,
    r: 50,
  },
});
const clipPathRect = new Rect({
  attrs: {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
  },
});
const clipPath = new Path({
  attrs: {
    stroke: 'black',
    lineWidth: 2,
    path: 'M 10,10 L -10,0 L 10,-10 Z',
    anchor: [0.5, 0.5],
  },
});

clipPath.setLocalPosition(100, 100);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const image = new Image({
  attrs: {
    x: 200,
    y: 100,
    width: 200,
    height: 200,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
    clipPath: clipPathCircle,
  },
});

const image2 = new Image({
  attrs: {
    x: 200,
    y: 200,
    width: 200,
    height: 200,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    clipPath: clipPathCircle,
  },
});

canvas.appendChild(image);
canvas.appendChild(image2);

clipPathCircle.animate(
  [
    { transform: 'scale(1)' },
    { transform: 'scale(1.2)' },
  ], {
  duration: 1500,
  iterations: Infinity,
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
canvas.on('afterRender', () => {
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
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const clipFolder = gui.addFolder('clipPath');
const clipConfig = {
  clipPath: 'circle',
  r: 50,
};

clipFolder.add(clipConfig, 'clipPath', ['circle', 'rect', 'path', 'null']).onChange((type) => {
  switch (type) {
    case 'circle':
      image.style.clipPath = clipPathCircle;
      break;
    case 'rect':
      image.style.clipPath = clipPathRect;
      break;
    case 'path':
      image.style.clipPath = clipPath;
      break;
    case 'null': // clear clip path
      image.style.clipPath = null;
      // image.setClip(null);
      break;
  }
});
clipFolder.add(clipConfig, 'r', 0, 100).onChange((r) => {
  clipPathCircle.style.r = r;
});
clipFolder.open();

const imageFolder = gui.addFolder('image');
const config = {
  x: 200,
  y: 100,
  width: 200,
  height: 200,
  opacity: 1,
  anchorX: 0,
  anchorY: 0,
  src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
};
imageFolder.add(config, 'x', 0, 400).onChange((x) => {
  image.style.x = x;
});
imageFolder.add(config, 'y', 0, 400).onChange((y) => {
  image.style.y = y;
});
imageFolder.add(config, 'width', 0, 400).onChange((width) => {
  image.style.width = width;
});
imageFolder.add(config, 'height', 0, 400).onChange((height) => {
  image.style.height = height;
});
imageFolder.add(config, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  image.style.anchor = [anchorX, config.anchorY];
});
imageFolder.add(config, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  image.style.anchor = [config.anchorX, anchorY];
});
imageFolder.add(config, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  image.style.opacity = opacity;
});
imageFolder
  .add(config, 'src', [
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8eoKRbfOwgAAAAAAAAAAAABkARQnAQ',
  ])
  .onChange((src) => {
    image.style.img = src;
  });
