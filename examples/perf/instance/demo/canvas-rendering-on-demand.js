import { Canvas } from '@antv/g-renderer-canvas';
import { Circle, Group } from '@antv/g';
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
  autoRendering: false,
});

const solarSystem = new Group({
  name: 'solarSystem',
});
const earthOrbit = new Group({
  name: 'earthOrbit',
});
const moonOrbit = new Group({
  name: 'moonOrbit',
});

const sun = new Circle({
  name: 'sun',
  attrs: {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const earth = new Circle({
  name: 'earth',
  attrs: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const moon = new Circle({
  name: 'moon',
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

// create a main loop
const tick = () => {
  if (stats) {
    stats.update();
  }

  solarSystem.rotateLocal(1);
  earthOrbit.rotateLocal(2);

  // call `render` in each frame
  canvas.render();
  requestAnimationFrame(tick);
};
tick();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
