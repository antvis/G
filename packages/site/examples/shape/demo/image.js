import { Canvas, CanvasEvent, Image } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
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

const image = new Image({
  style: {
    x: 200,
    y: 100,
    width: 200,
    height: 200,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(image);
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
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const imageFolder = gui.addFolder('image');
const config = {
  x: 200,
  y: 100,
  width: 200,
  height: 200,
  opacity: 1,
  src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  visible: true,
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
imageFolder.add(config, 'visible').onChange((visible) => {
  if (visible) {
    image.style.visibility = 'visible';
    // image.show();
  } else {
    image.style.visibility = 'hidden';
    // image.hide();
  }
});
imageFolder.open();

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 200,
  localPositionY: 100,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'left top',
  anchorX: 0,
  anchorY: 0,
};
transformFolder
  .add(transformConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    image.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'localPositionX', 0, 600).onChange((localPositionX) => {
  const [lx, ly] = image.getLocalPosition();
  image.setLocalPosition(localPositionX, ly);
});
transformFolder.add(transformConfig, 'localPositionY', 0, 500).onChange((localPositionY) => {
  const [lx, ly] = image.getLocalPosition();
  image.setLocalPosition(lx, localPositionY);
});
transformFolder.add(transformConfig, 'localScale', 0.2, 5).onChange((localScale) => {
  image.setLocalScale(localScale);
});
transformFolder.add(transformConfig, 'localEulerAngles', 0, 360).onChange((localEulerAngles) => {
  image.setLocalEulerAngles(localEulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  image.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  image.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
