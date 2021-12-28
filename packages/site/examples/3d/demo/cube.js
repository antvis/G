import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { MeshBasicMaterial, CubeGeometry, Mesh, Plugin as Plugin3D } from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

const cubeGeometry = new CubeGeometry();
const basicMaterial = new MeshBasicMaterial({
  // wireframe: true,
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
});

const cube = new Mesh({
  style: {
    fill: '#1890FF',
    opacity: 1,
    width: 200,
    height: 200,
    depth: 200,
    geometry: cubeGeometry,
    material: basicMaterial,
  },
});

cube.setPosition(300, 250, 0);

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
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
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
  opacity: 1,
  fill: '#1890FF',
};
cubeFolder.add(cubeConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  cube.style.opacity = opacity;
});
cubeFolder.addColor(cubeConfig, 'fill').onChange((color) => {
  cube.style.fill = color;
});
cubeFolder.open();

const geometryFolder = gui.addFolder('geometry');
const geometryConfig = {
  width: 200,
  height: 200,
  depth: 200,
};
geometryFolder.add(geometryConfig, 'width', 50, 300).onChange((width) => {
  cube.style.width = width;
});
geometryFolder.add(geometryConfig, 'height', 50, 300).onChange((height) => {
  cube.style.height = height;
});
geometryFolder.add(geometryConfig, 'depth', 50, 300).onChange((depth) => {
  cube.style.depth = depth;
});
geometryFolder.open();

const materialFolder = gui.addFolder('material');
const materialConfig = {
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
};
materialFolder
  .add(materialConfig, 'map', [
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    'none',
  ])
  .onChange((map) => {
    if (map === 'none') {
      cube.style.material.map = null;
    } else {
      cube.style.material.map = map;
    }
  });
materialFolder.open();
