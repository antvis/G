import { Canvas, Group } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Grid, Plugin } from '@antv/g-plugin-3d';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a webgl renderer
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const camera = canvas.getCamera();
camera.setPerspective(0.1, 1000, 75, 600 / 500).setPosition(300, 250, 500);

const grid = new Grid({
  style: {
    width: 400,
    height: 400,
    depth: 400,
    fill: '#1890FF',
  },
});
grid.setPosition(300, 250, 10);

// add a grid to canvas
canvas.appendChild(grid);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }
  grid.rotate(0, 1, 1);
});
