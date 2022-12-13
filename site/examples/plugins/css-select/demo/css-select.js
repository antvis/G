import { Canvas, CanvasEvent, Circle, Group } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-css-select';
import * as lil from 'lil-gui';
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

// create a canvas renderer
const canvasRenderer = new CanvasRenderer();
// register CSS select plugin
canvasRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
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
  className: 'classname-sun',
  style: {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const earth = new Circle({
  id: 'earth',
  className: 'classname-earth',
  style: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const moon = new Circle({
  id: 'moon',
  className: 'classname-moon',
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

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(solarSystem);
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
const gui = new lil.GUI({ autoPlace: false, width: 400 });
$wrapper.appendChild(gui.domElement);
const selectorFolder = gui.addFolder('CSS Selector');
const selectorConfig = {
  getElementById: 'sun',
  getElementsByClassName: 'classname-sun',
  getElementsByTagName: 'circle',
  querySelector: '[r=100]',
  querySelectorAll: '[r=100]',
};
const clear = () => {
  solarSystem.forEach((child) => {
    child.setAttribute('fill', '#1890FF');
  });
};
selectorFolder
  .add(selectorConfig, 'getElementById', ['sun', 'earth', 'moon'])
  .onChange((id) => {
    clear();
    const target = solarSystem.getElementById(id);
    target.setAttribute('fill', '#F04864');
  });
selectorFolder
  .add(selectorConfig, 'getElementsByClassName', [
    'classname-sun',
    'classname-earth',
    'classname-moon',
  ])
  .onChange((className) => {
    clear();
    const targets = solarSystem.getElementsByClassName(className);
    targets.forEach((target) => {
      target.setAttribute('fill', '#F04864');
    });
  });
selectorFolder
  .add(selectorConfig, 'getElementsByTagName', ['circle', 'rect'])
  .onChange((className) => {
    clear();
    const targets = solarSystem.getElementsByTagName(className);
    targets.forEach((target) => {
      target.setAttribute('fill', '#F04864');
    });
  });
selectorFolder
  .add(selectorConfig, 'querySelector', ['[r=100]', '[r=50]', '[r=25]'])
  .onChange((selector) => {
    clear();
    const target = solarSystem.querySelector(selector);
    target.setAttribute('fill', '#F04864');
  });
selectorFolder
  .add(selectorConfig, 'querySelectorAll', ['[r=100]', '[r=50]', '[r=25]'])
  .onChange((selector) => {
    clear();
    const targets = solarSystem.querySelectorAll(selector);
    targets.forEach((target) => {
      target.setAttribute('fill', '#F04864');
    });
  });
selectorFolder.open();
