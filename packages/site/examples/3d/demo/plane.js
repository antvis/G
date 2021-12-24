import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { MeshBasicMaterial, PlaneGeometry, Mesh, Plugin as Plugin3D } from '@antv/g-plugin-3d';
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

const planeGeometry = new PlaneGeometry();
const basicMaterial = new MeshBasicMaterial({
  wireframe: true,
});

const plane = new Mesh({
  style: {
    fill: '#1890FF',
    opacity: 1,
    width: 200,
    depth: 200,
    geometry: planeGeometry,
    material: basicMaterial,
  },
});

plane.setPosition(300, 250, 0);

canvas.appendChild(plane);

canvas.getCamera().setPosition(300, 0, 500);

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
  plane.rotate(0, 1, 0);
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const planeFolder = gui.addFolder('plane');
const planeConfig = {
  opacity: 1,
  fill: '#1890FF',
};
planeFolder.add(planeConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  plane.style.opacity = opacity;
});
planeFolder.addColor(planeConfig, 'fill').onChange((color) => {
  plane.style.fill = color;
});
planeFolder.open();

const geometryFolder = gui.addFolder('geometry');
const geometryConfig = {
  width: 200,
  depth: 200,
};
geometryFolder.add(geometryConfig, 'width', 50, 300).onChange((width) => {
  plane.style.width = width;
});
geometryFolder.add(geometryConfig, 'depth', 50, 300).onChange((depth) => {
  plane.style.depth = depth;
});
geometryFolder.open();
