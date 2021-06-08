import { Canvas, Group } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Cube, Grid, containerModule } from '@antv/g-plugin-3d';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a webgl renderer
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(containerModule);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const camera = canvas.getCamera();
camera.setPerspective(0.1, 1000, 75, 600 / 500).setPosition(300, 250, -500);

const group = new Group({});
// create a cube
const cube = new Cube({
  attrs: {
    width: 200,
    height: 200,
    depth: 200,
    fill: '#1890FF',
  },
});
const grid = new Grid({
  attrs: {
    width: 200,
    height: 200,
    depth: 200,
    fill: '#1890FF',
  },
});

group.appendChild(grid);
group.appendChild(cube);
group.setPosition(300, 250, 10);

// add a cube to canvas
canvas.appendChild(group);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }
  group.rotate(0, 1, 1);
});
