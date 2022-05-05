import { Canvas, CanvasEvent, Circle, Group } from '@antv/g';
import { Renderer, CanvasRenderer, CanvasPicker } from '@antv/g-canvas';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import Stats from 'stats.js';
import * as lil from 'lil-gui';

// create a renderer
const renderer = new Renderer();

// fetch all plugins in `g-canvas` preset
const plugins = renderer.getPlugins();

// remove `g-plugin-canvas-renderer` & `g-plugin-canvas-picker`
[CanvasRenderer.Plugin, CanvasPicker.Plugin].forEach((pluginClazz) => {
  const index = plugins.findIndex((plugin) => plugin instanceof pluginClazz);
  plugins.splice(index, 1);
});

// register `g-plugin-rough-canvas-renderer`
plugins.push(new PluginRoughCanvasRenderer());
// or
// renderer.registerPlugin(new PluginRoughCanvasRenderer());

// create a canvas & use `g-canvas`
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

/**
solarSystem
   |    |
   |   sun
   |
 earthOrbit
   |    |
   |  earth
   |
  moonOrbit
      |
     moon
 */
const solarSystem = new Group({
  id: 'solarSystem',
});
const earthOrbit = new Group({
  id: 'earthOrbit',
});
const moonOrbit = new Group({
  id: 'moonOrbit',
});

const sun = new Circle({
  id: 'sun',
  style: {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const earth = new Circle({
  id: 'earth',
  style: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const moon = new Circle({
  id: 'moon',
  style: {
    r: 25,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

solarSystem.appendChild(sun);
solarSystem.appendChild(earthOrbit);
earthOrbit.appendChild(earth);
earthOrbit.appendChild(moonOrbit);
moonOrbit.appendChild(moon);

solarSystem.setPosition(300, 250);
earthOrbit.translate(100, 0);
moonOrbit.translate(100, 0);

canvas.appendChild(solarSystem);

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

  solarSystem.rotateLocal(1);
  earthOrbit.rotateLocal(2);
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const sunFolder = gui.addFolder('sun');
const sunConfig = {
  r: 100,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  visibility: true,
  'z-index': 0,
  fillStyle: 'hachure',
  fillWeight: 2,
};
sunFolder.add(sunConfig, 'r', 50, 200).onChange((radius) => {
  sun.style.r = radius;
});
sunFolder.addColor(sunConfig, 'fill').onChange((color) => {
  sun.style.fill = color;
});
sunFolder.addColor(sunConfig, 'stroke').onChange((color) => {
  sun.style.stroke = color;
});
sunFolder.add(sunConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  sun.style.lineWidth = lineWidth;
});
sunFolder.add(sunConfig, 'visibility').onChange((visible) => {
  if (visible) {
    sun.show();
  } else {
    sun.hide();
  }
});
sunFolder.add(sunConfig, 'z-index', 0, 100).onChange((zIndex) => {
  sun.setZIndex(zIndex);
});
sunFolder
  .add(sunConfig, 'fillStyle', [
    'hachure',
    'solid',
    'zigzag',
    'cross-hatch',
    'dots',
    'dashed',
    'zigzag-line',
  ])
  .onChange((fillStyle) => {
    sun.style.fillStyle = fillStyle;
  });
sunFolder.add(sunConfig, 'fillWeight', 0, 20).onChange((fillWeight) => {
  sun.style.fillWeight = fillWeight;
});
sunFolder.open();
