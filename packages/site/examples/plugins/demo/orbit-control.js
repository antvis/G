import { Group, Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import Stats from 'stats.js';
import { Cube, Grid, Plugin as Plugin3D } from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';

// create a renderer
const webglRenderer = new WebGLRenderer();

// register plugins
webglRenderer.registerPlugin(new Plugin3D());
webglRenderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

// create a perspective camera
const camera = canvas.getCamera();
camera
  .setPosition(300, 100, 500)
  .setFocalPoint(300, 250, 0)
  .setPerspective(0.1, 1000, 75, 600 / 500);

const group = new Group();
const cube = new Cube({
  style: {
    width: 200,
    height: 200,
    depth: 200,
    fill: '#FFF',
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
  },
});
const grid = new Grid({
  style: {
    width: 400,
    height: 400,
    fill: '#1890FF',
  },
});

group.appendChild(grid);
group.appendChild(cube);
grid.translateLocal(0, 100, 0);
group.setPosition(300, 250, 0);

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
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }
});
