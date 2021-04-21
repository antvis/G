import { Group, Circle, Canvas, RENDERER } from '@antv/g';
import '@antv/g-renderer-canvas';
import '@antv/g-renderer-webgl';
import '@antv/g-renderer-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

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

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: RENDERER.Canvas,
});

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
  attrs: {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const earth = new Circle({
  id: 'earth',
  attrs: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const moon = new Circle({
  id: 'moon',
  attrs: {
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
moonOrbit.translate(50, 0);

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
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
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

const sunFolder = gui.addFolder('sun');
const sunConfig = {
  visibility: 'initial',
  'z-index': 0,
};
sunFolder.add(sunConfig, 'visibility', ['initial', 'visible', 'hidden']).onChange((visible) => {
  sun.attr('visibility', visible);
});
sunFolder.add(sunConfig, 'z-index', 0, 100).onChange((zIndex) => {
  sun.setZIndex(zIndex);
});
sunFolder.open();

const earthFolder = gui.addFolder('earth');
const earthConfig = {
  visibility: 'initial',
  'z-index': 0,
};
earthFolder.add(earthConfig, 'visibility', ['initial', 'visible', 'hidden']).onChange((visible) => {
  earth.attr('visibility', visible);
});
earthFolder.add(earthConfig, 'z-index', 0, 100).onChange((zIndex) => {
  earth.setZIndex(zIndex);
});

const moonFolder = gui.addFolder('moon');
const moonConfig = {
  visibility: 'initial',
};
moonFolder.add(moonConfig, 'visibility', ['initial', 'visible', 'hidden']).onChange((visible) => {
  moon.attr('visibility', visible);
});

const earthOrbitFolder = gui.addFolder('earthOrbit');
const earthOrbitConfig = {
  visibility: 'initial',
  'z-index': 0,
};
earthOrbitFolder.add(earthOrbitConfig, 'visibility', ['initial', 'visible', 'hidden']).onChange((visible) => {
  earthOrbit.attr('visibility', visible);
});
earthOrbitFolder.add(earthOrbitConfig, 'z-index', 0, 100).onChange((zIndex) => {
  earthOrbit.setZIndex(zIndex);
});

const moonOrbitFolder = gui.addFolder('moonOrbit');
const moonOrbitConfig = {
  visibility: 'initial',
  'z-index': 0,
};
moonOrbitFolder.add(moonOrbitConfig, 'visibility', ['initial', 'visible', 'hidden']).onChange((visible) => {
  moonOrbit.attr('visibility', visible);
});
moonOrbitFolder.add(moonOrbitConfig, 'z-index', 0, 100).onChange((zIndex) => {
  moonOrbit.setZIndex(zIndex);
});
