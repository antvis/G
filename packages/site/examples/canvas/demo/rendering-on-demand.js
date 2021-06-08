import { Group, Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
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

// create a renderer
const canvasRenderer = new CanvasRenderer({
  enableAutoRendering: false,
});
const webglRenderer = new WebGLRenderer({
  enableAutoRendering: false,
});
const svgRenderer = new SVGRenderer({
  enableAutoRendering: false,
});

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

// GUI
const gui = new dat.GUI({ autoPlace: false });
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

// create a main loop
const tick = () => {
  if (stats) {
    stats.update();
  }

  // call `render` in each frame
  canvas.render();

  solarSystem.rotateLocal(1);
  earthOrbit.rotateLocal(2);

  requestAnimationFrame(tick);
};
tick();
