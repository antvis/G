import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Cube, Plugin } from '@antv/g-plugin-3d';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a webgl renderer
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const camera = canvas.getCamera();
camera.setPosition(300, 20, 500);

// create a cube
const cube = new Cube({
  style: {
    width: 200,
    height: 200,
    depth: 200,
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
  },
});
cube.setPosition(300, 250, 0);

// add a cube to canvas
canvas.appendChild(cube);

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
  cube.rotate(0, 1, 0);
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const cubeFolder = gui.addFolder('cube');
const cubeConfig = {
  width: 200,
  height: 200,
  depth: 200,
  opacity: 1,
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
};
cubeFolder.add(cubeConfig, 'width', 50, 300).onChange((width) => {
  cube.attr('width', width);
});
cubeFolder.add(cubeConfig, 'height', 50, 300).onChange((height) => {
  cube.attr('height', height);
});
cubeFolder.add(cubeConfig, 'depth', 50, 300).onChange((depth) => {
  cube.attr('depth', depth);
});
cubeFolder.add(cubeConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  cube.attr('opacity', opacity);
});
cubeFolder.open();
