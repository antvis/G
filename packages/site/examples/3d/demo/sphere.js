import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshPhongMaterial,
  SphereGeometry,
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
  background: 'black',
});

// create a sphere geometry
const sphereGeometry = new SphereGeometry();
// create a material with Phong lighting model
const basicMaterial = new MeshPhongMaterial({
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
  specular: 'white',
  specularMap:
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8wz0QaP_bjoAAAAAAAAAAAAAARQnAQ',
  bumpMap: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kuUITY47ZhMAAAAAAAAAAAAAARQnAQ',
  bumpScale: 5,
  shininess: 10,
});
const cloudMaterial = new MeshPhongMaterial({
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N2ooTq4cQroAAAAAAAAAAAAAARQnAQ',
  doubleSide: true,
  depthWrite: false,
});

// create a mesh
const sphere = new Mesh({
  style: {
    x: 300,
    y: 250,
    z: 0,
    fill: '#1890FF',
    opacity: 1,
    radius: 200,
    latitudeBands: 32,
    longitudeBands: 32,
    geometry: sphereGeometry,
    material: basicMaterial,
  },
});
canvas.appendChild(sphere);

const cloudMesh = new Mesh({
  style: {
    opacity: 0.2,
    radius: 200,
    latitudeBands: 32,
    longitudeBands: 32,
    geometry: sphereGeometry,
    material: cloudMaterial,
  },
});
sphere.appendChild(cloudMesh);

// add a directional light into scene
const light = new DirectionalLight({
  style: {
    fill: 'white',
    direction: [-1, 0, 1],
  },
});
canvas.appendChild(light);

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
  sphere.rotate(0, 0.2, 0);
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const lightFolder = gui.addFolder('light');
const lightConfig = {
  fill: '#FFF',
};
lightFolder.addColor(lightConfig, 'fill').onChange((fill) => {
  light.style.fill = fill;
});
lightFolder.open();

const sphereFolder = gui.addFolder('sphere');
const sphereConfig = {
  opacity: 1,
  fill: '#1890FF',
};
sphereFolder.add(sphereConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  sphere.style.opacity = opacity;
});
sphereFolder.addColor(sphereConfig, 'fill').onChange((color) => {
  sphere.style.fill = color;
});
sphereFolder.open();

const geometryFolder = gui.addFolder('geometry');
const geometryConfig = {
  radius: 200,
  latitudeBands: 32,
  longitudeBands: 32,
};
geometryFolder.add(geometryConfig, 'radius', 50, 300).onChange((radius) => {
  sphere.style.radius = radius;
});
geometryFolder.add(geometryConfig, 'latitudeBands', 8, 32).onChange((latitudeBands) => {
  sphere.style.latitudeBands = latitudeBands;
});
geometryFolder.add(geometryConfig, 'longitudeBands', 8, 32).onChange((longitudeBands) => {
  sphere.style.longitudeBands = longitudeBands;
});
geometryFolder.open();

const materialFolder = gui.addFolder('material');
const materialConfig = {
  emissive: '#000000',
  specular: '#FFFFFF',
  shininess: 10,
  map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
  fogType: FogType.NONE,
  fogColor: '#000000',
  fogDensity: 0.5,
  fogStart: 1,
  fogEnd: 1000,
  bumpScale: 5,
};
materialFolder.addColor(materialConfig, 'emissive').onChange((emissive) => {
  sphere.style.material.props.emissive = emissive;
});
materialFolder.addColor(materialConfig, 'specular').onChange((specular) => {
  sphere.style.material.props.specular = specular;
});
materialFolder.add(materialConfig, 'shininess', 0, 100).onChange((shininess) => {
  sphere.style.material.props.shininess = shininess;
});
materialFolder
  .add(materialConfig, 'map', [
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    'none',
  ])
  .onChange((map) => {
    if (map === 'none') {
      sphere.style.material.props.map = null;
    } else {
      sphere.style.material.props.map = map;
    }
  });
const fogTypes = [FogType.NONE, FogType.EXP, FogType.EXP2, FogType.LINEAR];
materialFolder.add(materialConfig, 'fogType', fogTypes).onChange((fogType) => {
  // FogType.NONE
  sphere.style.material.props.fogType = fogType;
});
materialFolder.addColor(materialConfig, 'fogColor').onChange((fogColor) => {
  sphere.style.material.props.fogColor = fogColor;
});
materialFolder.add(materialConfig, 'fogDensity', 0, 10).onChange((fogDensity) => {
  sphere.style.material.props.fogDensity = fogDensity;
});
materialFolder.add(materialConfig, 'fogStart', 0, 1000).onChange((fogStart) => {
  sphere.style.material.props.fogStart = fogStart;
});
materialFolder.add(materialConfig, 'fogEnd', 0, 1000).onChange((fogEnd) => {
  sphere.style.material.props.fogEnd = fogEnd;
});
materialFolder.add(materialConfig, 'bumpScale', 0, 10).onChange((bumpScale) => {
  sphere.style.material.props.bumpScale = bumpScale;
});
materialFolder.open();
