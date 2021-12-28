import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshPhongMaterial,
  TorusGeometry,
  DirectionalLight,
  Mesh,
  FogType,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
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

const torusGeometry = new TorusGeometry();
const basicMaterial = new MeshPhongMaterial();

const torus = new Mesh({
  style: {
    x: 300,
    y: 250,
    fill: 'white',
    opacity: 1,
    tubeRadius: 30,
    ringRadius: 200,
    geometry: torusGeometry,
    material: basicMaterial,
  },
});

canvas.appendChild(torus);

// add a directional light into scene
const light = new DirectionalLight({
  style: {
    fill: 'white',
    direction: [-1, 0, 1],
  },
});
canvas.appendChild(light);

const camera = canvas.getCamera();
camera.setPosition(300, 0, 500);

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
  torus.rotate(0, 0.2, 0);
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const torusFolder = gui.addFolder('torus');
const torusConfig = {
  opacity: 1,
  fill: '#1890FF',
};
torusFolder.add(torusConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  torus.style.opacity = opacity;
});
torusFolder.addColor(torusConfig, 'fill').onChange((color) => {
  torus.style.fill = color;
});
torusFolder.open();

const geometryFolder = gui.addFolder('geometry');
const geometryConfig = {
  radius: 200,
  latitudeBands: 32,
  longitudeBands: 32,
};
geometryFolder.add(geometryConfig, 'radius', 50, 300).onChange((radius) => {
  torus.style.radius = radius;
});
geometryFolder.add(geometryConfig, 'latitudeBands', 8, 32).onChange((latitudeBands) => {
  torus.style.latitudeBands = latitudeBands;
});
geometryFolder.add(geometryConfig, 'longitudeBands', 8, 32).onChange((longitudeBands) => {
  torus.style.longitudeBands = longitudeBands;
});
geometryFolder.open();

const materialFolder = gui.addFolder('material');
const materialConfig = {
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
  fogType: FogType.NONE,
  fogColor: '#000000',
  fogDensity: 0.5,
  fogStart: 1,
  fogEnd: 1000,
};
materialFolder
  .add(materialConfig, 'map', [
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    'none',
  ])
  .onChange((map) => {
    if (map === 'none') {
      torus.style.material.map = null;
    } else {
      torus.style.material.map = map;
    }
  });
const fogTypes = [FogType.NONE, FogType.EXP, FogType.EXP2, FogType.LINEAR];
materialFolder.add(materialConfig, 'fogType', fogTypes).onChange((fogType) => {
  // FogType.NONE
  torus.style.material.fogType = fogType;
});
materialFolder.addColor(materialConfig, 'fogColor').onChange((fogColor) => {
  torus.style.material.fogColor = fogColor;
});
materialFolder.add(materialConfig, 'fogDensity', 0, 10).onChange((fogDensity) => {
  torus.style.material.fogDensity = fogDensity;
});
materialFolder.add(materialConfig, 'fogStart', 0, 1000).onChange((fogStart) => {
  torus.style.material.fogStart = fogStart;
});
materialFolder.add(materialConfig, 'fogEnd', 0, 1000).onChange((fogEnd) => {
  torus.style.material.fogEnd = fogEnd;
});
materialFolder.open();
