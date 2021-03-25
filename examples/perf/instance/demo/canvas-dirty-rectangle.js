import { Canvas } from '@antv/g-canvas';
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
  dirtyRectangle: {
    enable: true,
    debug: true,
  },
});

const solarSystem = canvas.addGroup({
  name: 'solarSystem',
});
solarSystem.setPosition(300, 250);
const earthOrbit = canvas.addGroup({
  name: 'earthOrbit',
});
earthOrbit.translate(100, 0);
const moonOrbit = canvas.addGroup({
  name: 'moonOrbit',
});
moonOrbit.translate(100, 0);

const sun = canvas.addShape('circle', {
  name: 'sun',
  attrs: {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const earth = canvas.addShape('circle', {
  name: 'earth',
  attrs: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const moon = canvas.addShape('circle', {
  name: 'moon',
  attrs: {
    r: 25,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

solarSystem.add(sun);
solarSystem.add(earthOrbit);
earthOrbit.add(earth);
earthOrbit.add(moonOrbit);
moonOrbit.add(moon);

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

  solarSystem.rotateAtStart((Math.PI / 180) * 1);
  earthOrbit.rotateAtStart((Math.PI / 180) * 2);
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const folder0 = gui.addFolder('dirty rectangle');
const dirtyRectangleConfig = {
  enable: true,
  debug: true,
};
folder0.add(dirtyRectangleConfig, 'enable').onChange((enable) => {
  canvas.setConfig({
    dirtyRectangle: {
      enable,
      debug: dirtyRectangleConfig.debug,
    },
  });
});
folder0.add(dirtyRectangleConfig, 'debug').onChange((debug) => {
  canvas.setConfig({
    dirtyRectangle: {
      enable: dirtyRectangleConfig.enable,
      debug,
    },
  });
});
folder0.open();

const folder1 = gui.addFolder('visibility');
const config = {
  earthOrbit: true,
  moonOrbit: true,
};
folder1.add(config, 'earthOrbit').onChange((visible) => {
  if (visible) {
    earthOrbit.show();
  } else {
    earthOrbit.hide();
  }
});
folder1.add(config, 'moonOrbit').onChange((visible) => {
  if (visible) {
    moonOrbit.show();
  } else {
    moonOrbit.hide();
  }
});
folder1.open();

const folder2 = gui.addFolder('z-index');
const zIndexConfig = {
  earthOrbit: 0,
  sun: 0,
  bringToFront: false,
};
folder2.add(zIndexConfig, 'bringToFront').onChange((toFront) => {
  if (toFront) {
    sun.toFront();
  } else {
    sun.toBack();
  }
});
folder2.add(zIndexConfig, 'sun', 0, 100).onChange((zIndex) => {
  sun.setZIndex(zIndex);
});
folder2.add(zIndexConfig, 'earthOrbit', 0, 100).onChange((zIndex) => {
  earthOrbit.setZIndex(zIndex);
});
folder2.open();
